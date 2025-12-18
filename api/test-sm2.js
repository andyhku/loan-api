/**
 * GET /api/test-sm2
 * Test SM2 encryption and decryption functionality
 * 
 * Query parameters (optional):
 * - data: Plain text to encrypt (default: "17601600216")
 * - publicKey: Public key for encryption (optional, uses default)
 * - privateKey: Private key for decryption (optional, for testing only)
 * 
 * Response:
 * {
 *   "success": true,
 *   "original": "original data",
 *   "encrypted": "encrypted hex string",
 *   "decrypted": "decrypted data",
 *   "match": true,
 *   "message": "Test passed"
 * }
 */

import { encryptSM2, decryptSM2, testSM2Encryption } from '../lib/sm2-utils.js';

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ 
      success: false,
      message: 'Method not allowed. Use GET.' 
    });
  }

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
        message: 'Missing required parameter: data'
      });
    }

    if (!publicKey) {
      return res.status(400).json({
        success: false,
        message: 'Missing required parameter: publicKey'
      });
    }

    if (!privateKey) {
      return res.status(400).json({
        success: false,
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
      message: 'Internal server error',
      error: error.message
    });
  }
}

