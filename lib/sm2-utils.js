/**
 * SM2 Encryption/Decryption Utilities
 * 
 * This module provides SM2 encryption and decryption functions
 * using the sm-crypto library, matching the Java Hutool implementation.
 * 
 * Java Implementation Reference:
 * - Uses SM2Engine.Mode.C1C2C3
 * - Uses encryptHex() which returns hex string
 * - Uses decryptFromBcd() which takes BCD format
 * - Public key handling: if length 130, remove first 2 bytes, then split into xhex (0-64) and yhex (64-128)
 * 
 * Configuration:
 * - App ID: Lq5bPzcnlcFuXst5Ca65Rb5r75mTmQoR
 * - App Secret: XtsGzJrFP88XpZmrpGVfsVNV5q2sYbR6
 * - Public Key: 040c3700540ff36b73c1bb5f2f7c04c9ebd320348d87cc83ae501896b69660f2bf0c77b480f6dc284a39c752ba288d90145763f03bf78c4a92c67be68abe2f8298
 */

import { sm2 } from 'sm-crypto';

// Default public key from the API documentation
const DEFAULT_PUBLIC_KEY = '040c3700540ff36b73c1bb5f2f7c04c9ebd320348d87cc83ae501896b69660f2bf0c77b480f6dc284a39c752ba288d90145763f03bf78c4a92c67be68abe2f8298';

/**
 * Process public key to match Java implementation format
 * Java code: if (publicKey.length() == 130) { publicKey = publicKey.substring(2); }
 * Then splits into xhex (0-64) and yhex (64-128)
 * 
 * @param {string} publicKey - Raw public key (may include '04' prefix)
 * @returns {string} - Processed public key for sm-crypto
 */
function processPublicKey(publicKey) {
  let key = publicKey;
  
  // Java implementation: if length is 130, remove first 2 bytes (the '04' prefix)
  if (key.length === 130 && key.startsWith('04')) {
    key = key.substring(2);
  }
  
  // sm-crypto library can handle the key with or without '04' prefix
  // But we need to ensure consistency with Java implementation
  // The Java code removes '04' and then uses xhex (0-64) and yhex (64-128)
  // sm-crypto expects the full uncompressed key, so we'll keep it as is after removing '04'
  
  return key;
}

/**
 * Encrypt data using SM2 (matching Java encrypt2Data method)
 * 
 * Java equivalent:
 * public static String encrypt2Data(String publicKey, String data) {
 *   SM2 sm2 = initSM2(null, publicKey);
 *   return sm2.encryptHex(data, KeyType.PublicKey);
 * }
 * 
 * @param {string} publicKey - SM2 public key (optional, uses default if not provided)
 * @param {string} data - Plain text data to encrypt
 * @returns {string} - Encrypted hex string (same as Java encryptHex)
 */
export function encryptSM2(data, publicKey = DEFAULT_PUBLIC_KEY) {
  try {
    // Process public key to match Java format
    const processedKey = processPublicKey(publicKey);
    
    // sm-crypto mode 0 = C1C2C3 (matching Java SM2Engine.Mode.C1C2C3)
    // mode 1 = C1C3C2
    // Java uses C1C2C3, so we use mode 0
    const encrypted = sm2.doEncrypt(data, processedKey, 0);
    
    return encrypted;
  } catch (error) {
    console.error('SM2 encryption error:', error);
    throw new Error(`SM2 encryption failed: ${error.message}`);
  }
}

/**
 * Decrypt data using SM2 (matching Java decrypt2Data method)
 * 
 * Java equivalent:
 * public static String decrypt2Data(String privateKey, String dataHex) {
 *   SM2 sm2 = initSM2(privateKey, null);
 *   return StrUtil.utf8Str(sm2.decryptFromBcd(dataHex, KeyType.PrivateKey));
 * }
 * 
 * Note: Java uses decryptFromBcd which takes BCD format, but since encryptHex returns hex,
 * we use the hex format directly. The sm-crypto library handles this conversion.
 * 
 * @param {string} privateKey - SM2 private key
 * @param {string} encryptedData - Encrypted hex string (from encryptHex)
 * @returns {string} - Decrypted plain text (UTF-8 string)
 */
export function decryptSM2(encryptedData, privateKey) {
  try {
    if (!privateKey) {
      throw new Error('Private key is required for decryption');
    }
    
    // sm-crypto mode 0 = C1C2C3 (matching Java SM2Engine.Mode.C1C2C3)
    // Must match the mode used in encryption
    const decrypted = sm2.doDecrypt(encryptedData, privateKey, 0);
    
    return decrypted;
  } catch (error) {
    console.error('SM2 decryption error:', error);
    throw new Error(`SM2 decryption failed: ${error.message}`);
  }
}

/**
 * Generate SM2 key pair
 * @returns {Object} - { publicKey, privateKey }
 */
export function generateSM2KeyPair() {
  try {
    const keypair = sm2.generateKeyPairHex();
    return {
      publicKey: keypair.publicKey,
      privateKey: keypair.privateKey
    };
  } catch (error) {
    console.error('SM2 key generation error:', error);
    throw new Error(`SM2 key generation failed: ${error.message}`);
  }
}

/**
 * Validate app credentials
 * @param {string} appKey - Application ID
 * @param {string} appSecret - Application Secret
 * @returns {boolean} - True if credentials match
 */
export function validateAppCredentials(appKey, appSecret) {
  const VALID_APP_KEY = 'Lq5bPzcnlcFuXst5Ca65Rb5r75mTmQoR';
  const VALID_APP_SECRET = 'XtsGzJrFP88XpZmrpGVfsVNV5q2sYbR6';
  
  return appKey === VALID_APP_KEY && appSecret === VALID_APP_SECRET;
}

/**
 * Test function matching Java main() method
 * This can be used to verify encryption/decryption works correctly
 * 
 * Java test:
 * String str = "17601600216";
 * String publicKey = "0453c9e7fba50807852866ad461f60ac013efa00d313308e8a7ef2b6df1e37fd9f4a5415506cd344d0219340fd5ec90a2424845543521f0a4d75c85214d8d1c18e";
 * String privateKey = "0081f147eb0b0c37d3dc2396be9a9d68bd85c930ecac3a7e23811f79caec4e8056";
 * String encrypt2Data = encrypt2Data(publicKey, str);
 * String decrypt2Data = decrypt2Data(privateKey, encrypt2Data);
 */
export function testSM2Encryption() {
  const testData = "17601600216";
  const testPublicKey = "0453c9e7fba50807852866ad461f60ac013efa00d313308e8a7ef2b6df1e37fd9f4a5415506cd344d0219340fd5ec90a2424845543521f0a4d75c85214d8d1c18e";
  const testPrivateKey = "0081f147eb0b0c37d3dc2396be9a9d68bd85c930ecac3a7e23811f79caec4e8056";
  
  try {
    console.log("Original data:", testData);
    
    const encrypted = encryptSM2(testData, testPublicKey);
    console.log("Encrypted data:", encrypted);
    
    const decrypted = decryptSM2(encrypted, testPrivateKey);
    console.log("Decrypted data:", decrypted);
    
    if (testData === decrypted) {
      console.log("✓ Test passed: Encryption/Decryption successful");
      return true;
    } else {
      console.error("✗ Test failed: Decrypted data doesn't match original");
      return false;
    }
  } catch (error) {
    console.error("✗ Test failed with error:", error);
    return false;
  }
}

