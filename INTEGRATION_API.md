# Integration API Documentation

This document describes the integration API endpoints for syncing loan application data and retrieving banner information.

## Base URL

- **Test Environment**: `http://47.76.240.167:9999/asset/api`
- **Production**: Configure via `EXTERNAL_API_BASE_URL` environment variable

## Authentication

All integration endpoints require:
- **appKey**: Application ID (`Lq5bPzcnlcFuXst5Ca65Rb5r75mTmQoR`)
- **appSecret**: Application Secret (`XtsGzJrFP88XpZmrpGVfsVNV5q2sYbR6`)
- **encryptData**: SM2 encrypted data (see encryption format below)

## Endpoints

### 0. Test SM2 Encryption (Testing Only)

**Endpoint**: `GET /api/test-sm2`

**Description**: Test SM2 encryption and decryption functionality. This endpoint is for testing purposes only.

**Query Parameters** (all optional):
- `data`: Plain text to encrypt (default: "17601600216")
- `publicKey`: Public key for encryption (optional, uses default if not provided)
- `privateKey`: Private key for decryption (required if testing decryption)

**Examples**:

1. **Default test** (uses Java example data):
   ```
   GET /api/test-sm2
   ```

2. **Custom test**:
   ```
   GET /api/test-sm2?data=HelloWorld&publicKey=04...&privateKey=00...
   ```

**Response**:
```json
{
  "success": true,
  "original": "17601600216",
  "encrypted": "encrypted_hex_string_here",
  "decrypted": "17601600216",
  "match": true,
  "message": "Test passed: Encryption/Decryption successful",
  "testMode": "default"
}
```

**Status Codes**:
- `200`: Success
- `400`: Missing required parameters
- `405`: Method not allowed
- `500`: Internal server error

### 1. Sync Loan Application Data

**Endpoint**: `POST /api/integration/syncApplication`

**Description**: Synchronizes loan application data to the external API.

**Request Body**:
```json
{
  "appKey": "Lq5bPzcnlcFuXst5Ca65Rb5r75mTmQoR",
  "appSecret": "XtsGzJrFP88XpZmrpGVfsVNV5q2sYbR6",
  "encryptData": "encrypted_data_here"
}
```

**Response**:
```json
{
  "code": 1,
  "message": "success",
  "data": {}
}
```

**Status Codes**:
- `200`: Success
- `400`: Missing required fields
- `405`: Method not allowed
- `500`: Internal server error

### 2. Get Banner List

**Endpoint**: `POST /api/integration/getBannerList`

**Description**: Retrieves banner list from the external API.

**Request Body**:
```json
{
  "appKey": "Lq5bPzcnlcFuXst5Ca65Rb5r75mTmQoR",
  "appSecret": "XtsGzJrFP88XpZmrpGVfsVNV5q2sYbR6",
  "encryptData": "encrypted_data_here"
}
```

**Response**:
```json
{
  "code": 1,
  "message": "success",
  "data": {
    "records": [
      {
        "id": "4e52354a41331edf292b10d5aea0971a",
        "title": "221",
        "position": 2,
        "href": "www.baidu.com",
        "sort": 1,
        "status": 1,
        "startTime": null,
        "endTime": null,
        "description": "22"
      }
    ],
    "total": 1,
    "size": 2,
    "current": 1,
    "pages": 1
  }
}
```

**Status Codes**:
- `200`: Success
- `400`: Missing required fields
- `405`: Method not allowed
- `500`: Internal server error

## Data Encryption

### SM2 Encryption Format

Data must be encrypted using SM2 encryption before sending to the API.

**Public Key**: `040c3700540ff36b73c1bb5f2f7c04c9ebd320348d87cc83ae501896b69660f2bf0c77b480f6dc284a39c752ba288d90145763f03bf78c4a92c67be68abe2f8298`

**Encryption Mode**: C1C3C2 (Mode 1)

### Example Data Formats

#### Sync Application Data Format

The `encryptData` for `/integration/syncApplication` should contain a JSON string with the following structure:

```json
{
  "salesmanReferralCode": "业务员推荐码",
  "customerCompanyName": "贷款人公司名称",
  "customerCompanyAddress": "贷款人公司地址",
  "customerCompanyPhone": "贷款人公司电话",
  "customerCompanyPosition": "贷款人公司职位",
  "customerIncome": 贷款人收入,
  "customerWorkYears": 贷款人公司工作年限,
  "isCustomerOwnCompany": 是否贷款人自有公司,
  "customerName": "贷款人姓名",
  "customerPhone": "贷款人手机号",
  "customerIdCard": "贷款人身份证",
  "customerBirthDate": 贷款人出生日期,
  "customerAge": 贷款人年龄,
  "customerGender": "贷款人性别",
  "loanAmount": 申请额度,
  "hasProvidentFundExtraction": 贷款人有无提取强积金,
  "providentFundTrustee": "贷款人强积金保存信托公司名称",
  "customerResidentialAddress": "贷款人居住地址",
  "customerResidentialType": "贷款人住宅类型",
  "customerResidentialPhone": "贷款人住宅电话",
  "customerResidentialYears": 贷款人住宅居住年限,
  "isCustomerHouseOwned": 贷款人住宅是否购买,
  "houseOwnerName": "贷款人住宅屋主名称",
  "hasBankruptcy": 贷款人有否破产,
  "hasBadCredit": 贷款人有无走数记录,
  "receivingBankCode": "贷款人收款银行",
  "receivingBankName": "贷款人收款银行名称",
  "receivingAccountName": "贷款人收款人姓名",
  "cohabitants": [
    {
      "age": "年龄",
      "name": "姓名",
      "phone": "电话",
      "relationship": "关系",
      "workAddress": "工作地址",
      "workPhone": "工作电话"
    }
  ],
  "nonCohabitants": [
    {
      "age": "年龄",
      "name": "姓名",
      "phone": "电话",
      "relationship": "关系",
      "workAddress": "工作地址",
      "workPhone": "工作电话"
    }
  ],
  "debts": [
    {
      "amount": "金额",
      "name": "借款人姓名",
      "period": "期数",
      "remainingPeriod": "余下期数"
    }
  ],
  "customerPhoneBookList": [
    {
      "phoneUserName": "电话用户",
      "phoneNumber": "电话号码"
    }
  ]
}
```

#### Get Banner List Data Format

The `encryptData` for `/integration/getBannerList` should contain a JSON string with pagination parameters:

```json
{
  "current": "当前页码",
  "size": "每页显示条数"
}
```

## Environment Variables

Configure the following environment variables:

- `EXTERNAL_API_BASE_URL`: Base URL for the external API (default: `http://47.76.240.167:9999/asset/api`)

## Usage Example

### Using Node.js with sm-crypto

```javascript
import { encryptSM2 } from './lib/sm2-utils.js';

// Prepare data
const data = {
  current: 1,
  size: 10
};

// Encrypt data
const encryptedData = encryptSM2(JSON.stringify(data));

// Make request
const response = await fetch('https://your-domain.vercel.app/api/integration/getBannerList', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    appKey: 'Lq5bPzcnlcFuXst5Ca65Rb5r75mTmQoR',
    appSecret: 'XtsGzJrFP88XpZmrpGVfsVNV5q2sYbR6',
    encryptData: encryptedData
  })
});

const result = await response.json();
console.log(result);
```

## Error Handling

All endpoints return a consistent error format:

```json
{
  "code": <status_code>,
  "message": "Error message",
  "data": null
}
```

Common error codes:
- `400`: Bad Request - Missing or invalid parameters
- `401`: Unauthorized - Invalid app credentials
- `403`: Forbidden - No permission to access resource
- `500`: Internal Server Error - Server-side error

