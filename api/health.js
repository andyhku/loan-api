import { createClient } from "@libsql/client";
import { encryptSM2, encrypt2Data, decryptSM2 } from "../lib/sm2-utils.js";

const EXTERNAL_API_BASE_URL = process.env.EXTERNAL_API_BASE_URL || 'http://47.76.240.167:9999/asset/api';
const DEFAULT_APP_KEY = 'Lq5bPzcnlcFuXst5Ca65Rb5r75mTmQoR';
const DEFAULT_APP_SECRET = 'XtsGzJrFP88XpZmrpGVfsVNV5q2sYbR6';
const DEFAULT_PUBLIC_KEY = '040c3700540ff36b73c1bb5f2f7c04c9ebd320348d87cc83ae501896b69660f2bf0c77b480f6dc284a39c752ba288d90145763f03bf78c4a92c67be68abe2f8298';

const client = createClient({
  url: process.env.TURSO_DATABASE_URL,
  authToken: process.env.TURSO_AUTH_TOKEN,
});

export default async function handler(req, res) {
  // Check if this is a test request
  if (req.method === 'GET' && req.query.test) {
    if (req.query.test === 'sm2') {
      return handleSM2Test(req, res);
    }
    if (req.query.test === 'banner') {
      return handleBannerTest(req, res);
    }
  }

  // Default health check
  try {
    // Test database connection
    await client.execute('SELECT 1');
    
    // Make GET request to external API
    let externalApiStatus = 'unknown';
    let externalApiError = null;
    try {
      const externalResponse = await fetch('https://otp.accessyou-anyip.com/sendsms-otp.php?accountno=11036769&user=11036769&pwd=62199579&tid=1&a=123321&phone=85251738110', {
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
        url: 'https://otp.accessyou-anyip.com/sendsms-otp.php?accountno=11036769&user=11036769&pwd=62199579&tid=1&a=123321&phone=85251738110',
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

/**
 * Handle Banner List API test
 * Usage: GET /api/health?test=banner&current=1&size=10
 * Or: GET /api/health?test=banner (uses default pagination)
 */
async function handleBannerTest(req, res) {
  try {
    const { current = '1', size = '10' } = req.query;

    // Prepare pagination data
    const paginationData = {
      current: String(current),
      size: String(size)
    };

    // Encrypt the pagination data using encrypt2Data (matching Java method)
    // Java: encrypt2Data(publicKey, data)
    let encryptedData;
    try {
      const dataToEncrypt = JSON.stringify(paginationData);
      console.log('[Banner Test] Data to encrypt:', dataToEncrypt);
      encryptedData = encrypt2Data(DEFAULT_PUBLIC_KEY, dataToEncrypt);
    } catch (error) {
      return res.status(500).json({
        success: false,
        test: 'banner',
        message: 'Failed to encrypt data',
        error: error.message
      });
    }

    // Call the getBannerList endpoint
    try {
      // Build URL with query parameters for GET request
      const urlParams = new URLSearchParams({
        appKey: DEFAULT_APP_KEY,
        appSecret: DEFAULT_APP_SECRET,
        encryptData: "04" + encryptedData
      });
      const requestUrl = `${EXTERNAL_API_BASE_URL}/integration/getBannerList?${urlParams.toString()}`;
      
      console.log('[Banner Test] Calling external API:', requestUrl);
      console.log('[Banner Test] Request method: GET');
      console.log('[Banner Test] Encrypted data length:', encryptedData.length);
      
      const response = await fetch(requestUrl, {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
        },
      });

      console.log('[Banner Test] Response status:', response.status);
      console.log('[Banner Test] Response headers:', Object.fromEntries(response.headers.entries()));
      
      const responseData = await response.json();
      console.log('[Banner Test] Response data:', JSON.stringify(responseData).substring(0, 200));

      if (response.ok) {
        return res.status(200).json({
          success: true,
          test: 'banner',
          message: 'Banner list test successful',
          request: {
            pagination: paginationData,
            encryptedDataLength: encryptedData.length
          },
          response: responseData,
          externalApiStatus: 'connected'
        });
      } else {
        // Check if the error is about method not supported
        const isMethodError = responseData.message && 
          (responseData.message.includes('method') || 
           responseData.message.includes('Method') ||
           responseData.message.includes('POST') ||
           responseData.message.includes('not supported'));
        
        return res.status(200).json({
          success: false,
          test: 'banner',
          message: 'External API returned error',
          request: {
            pagination: paginationData,
            encryptedDataLength: encryptedData.length,
            method: 'GET',
            url: requestUrl
          },
          response: responseData,
          externalApiStatus: 'error',
          httpStatus: response.status,
          troubleshooting: isMethodError ? {
            note: 'External API returned "method not supported" error',
            suggestion: 'Please verify the external API endpoint configuration. The API may require a different HTTP method or path.',
            expectedMethod: 'GET',
            actualResponse: responseData.message
          } : null
        });
      }
    } catch (fetchError) {
      return res.status(500).json({
        success: false,
        test: 'banner',
        message: 'Failed to call external API',
        request: {
          pagination: paginationData,
          encryptedDataLength: encryptedData ? encryptedData.length : 0
        },
        error: fetchError.message,
        externalApiStatus: 'disconnected'
      });
    }

  } catch (error) {
    console.error('Banner test error:', error);
    return res.status(500).json({
      success: false,
      test: 'banner',
      message: 'Internal server error',
      error: error.message
    });
  }
}

