/**
 * Consolidated Integration API endpoint
 * Handles: getBannerList, syncApplication, upload/file
 * 
 * Usage:
 * - GET /api/integration/getBannerList?current=1&size=100
 * - POST /api/integration/syncApplication
 * - POST /api/integration/upload/file
 */

import withCors from '../../lib/withCors.js';
import { encrypt2Data } from '../../lib/sm2-utils.js';
import formidable from 'formidable-serverless';
import FormData from 'form-data';
import fs from 'fs';

const EXTERNAL_API_BASE_URL = process.env.EXTERNAL_API_BASE_URL || 'http://47.76.240.167:9999/asset/api';
const DEFAULT_APP_KEY = 'Lq5bPzcnlcFuXst5Ca65Rb5r75mTmQoR';
const DEFAULT_APP_SECRET = 'XtsGzJrFP88XpZmrpGVfsVNV5q2sYbR6';
const DEFAULT_PUBLIC_KEY = '040c3700540ff36b73c1bb5f2f7c04c9ebd320348d87cc83ae501896b69660f2bf0c77b480f6dc284a39c752ba288d90145763f03bf78c4a92c67be68abe2f8298';

export default withCors(async function handler(req, res) {
  const { action } = req.query;

  // Handle upload/file path (action will be "upload/file" in Vercel)
  if (action && action.includes('upload')) {
    if (req.method !== 'POST') {
      return res.status(405).json({ code: 405, message: 'Method not allowed. Use POST.' });
    }
    return handleUploadFile(req, res);
  }

  // Route to appropriate handler based on action
  switch (action) {
    case 'getBannerList':
      if (req.method !== 'GET') {
        return res.status(405).json({ code: 405, message: 'Method not allowed. Use GET.' });
      }
      return handleGetBannerList(req, res);
    
    case 'syncApplication':
      if (req.method !== 'POST') {
        return res.status(405).json({ code: 405, message: 'Method not allowed. Use POST.' });
      }
      return handleSyncApplication(req, res);
    
    default:
      return res.status(404).json({
        code: 404,
        message: `Unknown action: ${action}. Valid actions: getBannerList, syncApplication, upload/file`
      });
  }
});

/**
 * Handle getBannerList
 * GET /api/integration/getBannerList?current=1&size=100
 */
async function handleGetBannerList(req, res) {
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
}

/**
 * Handle syncApplication
 * POST /api/integration/syncApplication
 */
async function handleSyncApplication(req, res) {
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
}

/**
 * Handle upload file
 * POST /api/integration/upload/file
 * Note: For upload/file, we need to handle it as action=upload with subAction=file
 * Or use: POST /api/integration/upload?subAction=file
 */
async function handleUploadFile(req, res) {
  try {
    // Parse multipart form data
    const form = formidable({
      maxFileSize: 50 * 1024 * 1024, // 50MB max file size
      keepExtensions: true,
    });

    const [fields, files] = await form.parse(req);
    
    // Extract file and useType
    const file = Array.isArray(files.file) ? files.file[0] : files.file;
    const useType = Array.isArray(fields.useType) ? fields.useType[0] : fields.useType;

    // Validate required fields
    if (!file) {
      return res.status(400).json({
        code: 400,
        message: 'Missing required field: file is required'
      });
    }

    if (!useType) {
      return res.status(400).json({
        code: 400,
        message: 'Missing required field: useType is required'
      });
    }

    // Validate useType value
    const validUseTypes = ['20', '21', '22'];
    if (!validUseTypes.includes(String(useType))) {
      return res.status(400).json({
        code: 400,
        message: `Invalid useType. Must be one of: ${validUseTypes.join(', ')} (20: customer photo, 21: monthly statement, 22: other attachments)`
      });
    }

    console.log('[UploadFile] File received:', {
      originalFilename: file.originalFilename,
      mimetype: file.mimetype,
      size: file.size,
      useType: useType
    });

    // Create FormData for forwarding to external API
    const formData = new FormData();
    
    // Read file and add to form data
    const fileStream = fs.createReadStream(file.filepath);
    formData.append('file', fileStream, {
      filename: file.originalFilename,
      contentType: file.mimetype || 'application/octet-stream',
    });
    formData.append('useType', String(useType));
    formData.append('appKey', DEFAULT_APP_KEY);
    formData.append('appSecret', DEFAULT_APP_SECRET);

    // Forward request to external API
    const requestUrl = `${EXTERNAL_API_BASE_URL}/integration/upload/file`;
    console.log('[UploadFile] Calling external API:', requestUrl);
    
    const externalResponse = await fetch(requestUrl, {
      method: 'POST',
      headers: formData.getHeaders(),
      body: formData,
    });

    console.log('[UploadFile] Response status:', externalResponse.status);
    console.log('[UploadFile] Response status text:', externalResponse.statusText);
    
    const responseData = await externalResponse.json();
    console.log('[UploadFile] Response data code:', responseData.code);
    console.log('[UploadFile] Response data message:', responseData.message);

    // Clean up temporary file
    try {
      fs.unlinkSync(file.filepath);
    } catch (cleanupError) {
      console.warn('[UploadFile] Failed to cleanup temp file:', cleanupError);
    }

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
    console.error('Upload file error:', error);
    return res.status(500).json({
      code: 500,
      message: 'Internal server error',
      error: error.message,
      data: null
    });
  }
}

