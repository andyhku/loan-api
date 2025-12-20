/**
 * POST /integration/syncApplication
 * Sync loan application data to external API
 * 
 * Request body:
 * {
 *   "appKey": "应用id",
 *   "appSecret": "应用密钥",
 *   "encryptData": "加密数据"
 * }
 * 
 * Response:
 * {
 *   "code": 1,
 *   "message": "success",
 *   "data": {...}
 * }
 */

import withCors from '../../lib/withCors.js';

const EXTERNAL_API_BASE_URL = process.env.EXTERNAL_API_BASE_URL || 'http://47.76.240.167:9999/asset/api';

export default withCors(async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ 
      code: 405, 
      message: 'Method not allowed. Use POST.' 
    });
  }

  try {
    const { appKey, appSecret, encryptData } = req.body;

    // Validate required fields
    if (!appKey || !appSecret || !encryptData) {
      return res.status(400).json({
        code: 400,
        message: 'Missing required fields: appKey, appSecret, and encryptData are required'
      });
    }

    // Forward request to external API
    const externalResponse = await fetch(`${EXTERNAL_API_BASE_URL}/integration/syncApplication`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      body: JSON.stringify({
        appKey,
        appSecret,
        encryptData
      }),
    });

    const responseData = await externalResponse.json();

    // Return the response from external API
    if (externalResponse.ok) {
      return res.status(200).json(responseData);
    } else {
      return res.status(externalResponse.status).json({
        code: externalResponse.status,
        message: responseData.message || 'External API error',
        data: responseData.data || null
      });
    }

  } catch (error) {
    console.error('Sync application error:', error);
    return res.status(500).json({
      code: 500,
      message: 'Internal server error',
      data: null
    });
  }
});

