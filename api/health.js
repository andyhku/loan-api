import { createClient } from "@libsql/client";
import { encryptSM2, decryptSM2 } from "../lib/sm2-utils.js";

const client = createClient({
  url: process.env.TURSO_DATABASE_URL,
  authToken: process.env.TURSO_AUTH_TOKEN,
});

export default async function handler(req, res) {
  // Check if this is an SM2 test request
  if (req.method === 'GET' && req.query.test === 'sm2') {
    return handleSM2Test(req, res);
  }

  // Default health check
  try {
    // Test database connection
    await client.execute('SELECT 1');
    
    // Make GET request to external API
    let externalApiStatus = 'unknown';
    let externalApiError = null;
    try {
      const externalResponse = await fetch('https://otp.accessyou-api.com/sendsms-otp.php?accountno=11036769&user=11036769&pwd=62199579&tid=1&a=123321&phone=85251738110', {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
        },
      });
      
      if (externalResponse.ok) {
        externalApiStatus = 'connected';
      } else {
        externalApiStatus = 'error';
        externalApiError = `HTTP ${externalResponse.status}`;
      }
    } catch (error) {
      externalApiStatus = 'disconnected';
      externalApiError = error.message;
    }
    
    return res.status(200).json({
      success: true,
      message: 'API is healthy',
      timestamp: new Date().toISOString(),
      database: 'connected',
      externalApi: {
        status: externalApiStatus,
        url: 'https://otp.accessyou-api.com/sendsms-otp.php?accountno=11036769&user=11036769&pwd=62199579&tid=1&a=123321&phone=85251738110',
        error: externalApiError
      }
    });
  } catch (error) {
    return res.status(503).json({
      success: false,
      message: 'API is unhealthy',
      timestamp: new Date().toISOString(),
      database: 'disconnected',
      error: error.message
    });
  }
}

/**
 * Handle SM2 encryption/decryption test
 * Usage: GET /api/health?test=sm2&data=HelloWorld&publicKey=04...&privateKey=00...
 * Or: GET /api/health?test=sm2 (uses default test data)
 */
async function handleSM2Test(req, res) {
  try {
    const { data, publicKey, privateKey } = req.query;

    // If no parameters provided, run the default test
    if (!data && !publicKey && !privateKey) {
      // Use test data from Java example
      const testData = "17601600216";
      const testPublicKey = "0453c9e7fba50807852866ad461f60ac013efa00d313308e8a7ef2b6df1e37fd9f4a5415506cd344d0219340fd5ec90a2424845543521f0a4d75c85214d8d1c18e";
      const testPrivateKey = "0081f147eb0b0c37d3dc2396be9a9d68bd85c930ecac3a7e23811f79caec4e8056";

      try {
        const encrypted = encryptSM2(testData, testPublicKey);
        const decrypted = decryptSM2(encrypted, testPrivateKey);
        const match = testData === decrypted;

        return res.status(200).json({
          success: true,
          test: 'sm2',
          original: testData,
          encrypted: encrypted,
          decrypted: decrypted,
          match: match,
          message: match ? 'Test passed: Encryption/Decryption successful' : 'Test failed: Decrypted data does not match original',
          testMode: 'default'
        });
      } catch (error) {
        return res.status(500).json({
          success: false,
          test: 'sm2',
          message: 'Test failed with error',
          error: error.message,
          testMode: 'default'
        });
      }
    }

    // Custom test with provided parameters
    if (!data) {
      return res.status(400).json({
        success: false,
        test: 'sm2',
        message: 'Missing required parameter: data'
      });
    }

    if (!publicKey) {
      return res.status(400).json({
        success: false,
        test: 'sm2',
        message: 'Missing required parameter: publicKey'
      });
    }

    if (!privateKey) {
      return res.status(400).json({
        success: false,
        test: 'sm2',
        message: 'Missing required parameter: privateKey (required for decryption test)'
      });
    }

    // Perform encryption
    const encrypted = encryptSM2(data, publicKey);
    
    // Perform decryption
    const decrypted = decryptSM2(encrypted, privateKey);
    
    // Check if decrypted matches original
    const match = data === decrypted;

    return res.status(200).json({
      success: true,
      test: 'sm2',
      original: data,
      encrypted: encrypted,
      decrypted: decrypted,
      match: match,
      message: match ? 'Test passed: Encryption/Decryption successful' : 'Test failed: Decrypted data does not match original',
      testMode: 'custom',
      publicKeyLength: publicKey.length,
      privateKeyLength: privateKey.length
    });

  } catch (error) {
    console.error('SM2 test error:', error);
    return res.status(500).json({
      success: false,
      test: 'sm2',
      message: 'Internal server error',
      error: error.message
    });
  }
}

