# SM2 Decryption Guide for External API

## How External API Decrypts Your Data

### Overview

When you send encrypted data to the external API, they decrypt it using the **private key** that corresponds to the **public key** you used for encryption.

### Encryption Flow

```
Your Side (Loan API):
1. Data (JSON string) → SM2 Encrypt (Public Key) → Encrypted Hex String
2. Send encrypted data in POST request

External API Side:
1. Receive encrypted hex string
2. SM2 Decrypt (Private Key) → Original Data (JSON string)
3. Parse JSON and process the data
```

## Key Pair Relationship

- **Public Key** (You use this): `040c3700540ff36b73c1bb5f2f7c04c9ebd320348d87cc83ae501896b69660f2bf0c77b480f6dc284a39c752ba288d90145763f03bf78c4a92c67be68abe2f8298`
- **Private Key** (They have this): Corresponding private key (not shared with you)

## Encryption Details

### Your Implementation (JavaScript)

```javascript
// Using encrypt2Data matching Java method
const encrypted = encrypt2Data(publicKey, data);
// Returns: hex string (e.g., "a1b2c3d4e5f6...")
```

**Configuration:**
- Mode: C1C2C3 (mode 0)
- Format: Hex string
- Public Key: 130 characters (with '04' prefix)

### Their Decryption (Java)

```java
public static String decrypt2Data(String privateKey, String dataHex) {
    SM2 sm2 = initSM2(privateKey, null);
    return StrUtil.utf8Str(sm2.decryptFromBcd(dataHex, KeyType.PrivateKey));
}
```

**Configuration:**
- Mode: C1C2C3 (SM2Engine.Mode.C1C2C3)
- Format: BCD (from hex)
- Private Key: Corresponding private key

## Compatibility

✅ **Your encryption is compatible with their decryption** because:
1. Same encryption mode: C1C2C3
2. Same key pair: Public key you use matches their private key
3. Correct format: Hex string that can be converted to BCD

## Data Format

### Example: Banner List Request

**Original Data:**
```json
{
  "current": "1",
  "size": "10"
}
```

**After Encryption:**
```json
{
  "appKey": "Lq5bPzcnlcFuXst5Ca65Rb5r75mTmQoR",
  "appSecret": "XtsGzJrFP88XpZmrpGVfsVNV5q2sYbR6",
  "encryptData": "a1b2c3d4e5f6..." // Encrypted hex string
}
```

**Their Decryption Process:**
1. Extract `encryptData` from request
2. Convert hex to BCD format
3. Decrypt using private key: `decrypt2Data(privateKey, encryptData)`
4. Result: `{"current":"1","size":"10"}`
5. Parse JSON and use the data

## Security Model

- **Asymmetric Encryption**: SM2 uses public/private key pairs
- **Public Key**: Safe to share, used for encryption
- **Private Key**: Kept secret by external API, used for decryption
- **One-way**: You can encrypt with public key, but cannot decrypt without private key

## Verification

To verify encryption/decryption works correctly:

1. **Test with your test endpoint:**
   ```
   GET /api/health?test=sm2
   ```
   This encrypts and decrypts using test keys to verify compatibility.

2. **Check encryption format:**
   - Encrypted data should be a hex string
   - Length will vary based on input data size
   - Should start with valid SM2 encrypted data format

## Troubleshooting

If external API cannot decrypt:

1. **Check encryption mode**: Must be C1C2C3 (mode 0)
2. **Check public key format**: Must be 130 chars with '04' prefix
3. **Check data format**: Must be valid JSON string before encryption
4. **Verify key pair**: Ensure public key matches their private key

## Example Decryption Code (For Reference)

If you need to test decryption locally (with test keys):

```javascript
import { decryptSM2 } from './lib/sm2-utils.js';

const testPrivateKey = "0081f147eb0b0c37d3dc2396be9a9d68bd85c930ecac3a7e23811f79caec4e8056";
const encryptedData = "encrypted_hex_string_from_api";

const decrypted = decryptSM2(encryptedData, testPrivateKey);
console.log("Decrypted:", decrypted);
```

