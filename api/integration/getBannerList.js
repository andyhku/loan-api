/**
 * GET /integration/getBannerList
 * Get banner list from external API
 * 
 * Query parameters:
 * - current (int, optional): Page number, default: 1
 * - size (int, optional): Page size, default: 100
 * 
 * Response:
 * {
 *   "code": 1,
 *   "message": "success",
 *   "data": {
 *     "records": [...],
 *     "total": 1,
 *     "size": 2,
 *     "current": 1,
 *     "pages": 1
 *   }
 * }
 */

import withCors from '../../lib/withCors.js';
import { encrypt2Data } from '../../lib/sm2-utils.js';

const EXTERNAL_API_BASE_URL = process.env.EXTERNAL_API_BASE_URL || 'http://47.76.240.167:9999/asset/api';
const DEFAULT_APP_KEY = 'Lq5bPzcnlcFuXst5Ca65Rb5r75mTmQoR';
const DEFAULT_APP_SECRET = 'XtsGzJrFP88XpZmrpGVfsVNV5q2sYbR6';
const DEFAULT_PUBLIC_KEY = '040c3700540ff36b73c1bb5f2f7c04c9ebd320348d87cc83ae501896b69660f2bf0c77b480f6dc284a39c752ba288d90145763f03bf78c4a92c67be68abe2f8298';

export default withCors(async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ 
      code: 405, 
      message: 'Method not allowed. Use GET.' 
    });
  }

  try {
    // Get pagination parameters with defaults
    const { current = '1', size = '100' } = req.query;

    // Prepare pagination data
    const paginationData = {
      current: String(current),
      size: String(size)
    };

    // Encrypt the pagination data using encrypt2Data (matching Java method)
    let encryptedData;
    try {
      const dataToEncrypt = JSON.stringify(paginationData);
      console.log('[GetBannerList] Data to encrypt:', dataToEncrypt);
      encryptedData = encrypt2Data(DEFAULT_PUBLIC_KEY, dataToEncrypt);
    } catch (error) {
      console.error('[GetBannerList] Encryption error:', error);
      return res.status(500).json({
        code: 500,
        message: 'Failed to encrypt data',
        error: error.message
      });
    }

    // Build URL with query parameters for GET request
    const urlParams = new URLSearchParams({
      appKey: DEFAULT_APP_KEY,
      appSecret: DEFAULT_APP_SECRET,
      encryptData: "04" + encryptedData
    });
    const requestUrl = `${EXTERNAL_API_BASE_URL}/integration/getBannerList?${urlParams.toString()}`;
    
    console.log('[GetBannerList] Calling external API:', requestUrl);
    console.log('[GetBannerList] Request method: GET');
    console.log('[GetBannerList] Pagination:', paginationData);
    console.log('[GetBannerList] Encrypted data length:', encryptedData.length);
    
    const externalResponse = await fetch(requestUrl, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
      },
    });

    console.log('[GetBannerList] Response status:', externalResponse.status);
    console.log('[GetBannerList] Response status text:', externalResponse.statusText);
    
    const responseData = await externalResponse.json();
    console.log('[GetBannerList] Response data code:', responseData.code);
    console.log('[GetBannerList] Response data message:', responseData.message);

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
    console.error('Get banner list error:', error);
    return res.status(500).json({
      code: 500,
      message: 'Internal server error',
      data: null
    });
  }
});

