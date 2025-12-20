/**
 * Consolidated Integration API endpoint
 * Handles: getBannerList, syncApplication, uploadfile, downloadBanner
 * 
 * Usage:
 * - GET /api/integration/getBannerList?current=1&size=100
 * - POST /api/integration/syncApplication
 * - POST /api/integration/uploadfile
 * - GET /api/integration/downloadBanner?id=<banner_id>
 */

import withCors from '../../lib/withCors.js';
import { encrypt2Data } from '../../lib/sm2-utils.js';
import { formidable } from 'formidable';
import FormData from 'form-data';
import fs from 'fs';
import fetch from 'node-fetch';

const EXTERNAL_API_BASE_URL = process.env.EXTERNAL_API_BASE_URL || 'http://47.76.240.167:9999/asset/api';
const DEFAULT_APP_KEY = 'Lq5bPzcnlcFuXst5Ca65Rb5r75mTmQoR';
const DEFAULT_APP_SECRET = 'XtsGzJrFP88XpZmrpGVfsVNV5q2sYbR6';
const DEFAULT_PUBLIC_KEY = '040c3700540ff36b73c1bb5f2f7c04c9ebd320348d87cc83ae501896b69660f2bf0c77b480f6dc284a39c752ba288d90145763f03bf78c4a92c67be68abe2f8298';

export default withCors(async function handler(req, res) {
  const { action } = req.query;

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
    
    case 'uploadfile':
      if (req.method !== 'POST') {
        return res.status(405).json({ code: 405, message: 'Method not allowed. Use POST.' });
      }
      return handleUploadFile(req, res);
    
    case 'downloadBanner':
      if (req.method !== 'GET') {
        return res.status(405).json({ code: 405, message: 'Method not allowed. Use GET.' });
      }
      return handleDownloadBanner(req, res);
    
    default:
      return res.status(404).json({
        code: 404,
        message: `Unknown action: ${action}. Valid actions: getBannerList, syncApplication, uploadfile, downloadBanner`
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
 * POST /api/integration/uploadfile
 */
async function handleUploadFile(req, res) {
  try {
    // Parse multipart form data
    // Note: formidable v3 API is different - it returns an object with fields and files
    const form = formidable({
      maxFileSize: 50 * 1024 * 1024, // 50MB max file size
      keepExtensions: true,
    });

    // formidable v3 parse returns [fields, files] as an array, not an object
    const [fields, files] = await form.parse(req);
    
    console.log('[UploadFile] Fields:', fields);
    console.log('[UploadFile] Files:', files);
    
    // Extract file and useType
    // In formidable v3, fields and files are arrays by default
    const file = files.file?.[0] || files.file;
    const useType = fields.useType?.[0] || fields.useType;

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
      originalFilename: file.originalFilename || file.originalname,
      mimetype: file.mimetype || file.type,
      size: file.size,
      filepath: file.filepath || file.path,
      useType: useType
    });

    // Create FormData for forwarding to external API
    // Only include file and useType as per API requirements
    const formData = new FormData();
    
    // Read file and add to form data as MultipartFile
    // In formidable v3, filepath might be 'path' or 'filepath'
    const filePath = file.filepath || file.path;
    
    if (!filePath || !fs.existsSync(filePath)) {
      console.error('[UploadFile] File path does not exist:', filePath);
      return res.status(400).json({
        code: 400,
        message: 'File path is invalid or file does not exist'
      });
    }
    
    // Read file as buffer for proper MultipartFile format
    // Using buffer instead of stream for better compatibility with fetch API
    const fileBuffer = fs.readFileSync(filePath);
    const filename = file.originalFilename || file.originalname || 'upload';
    const contentType = file.mimetype || file.type || 'application/octet-stream';
    
    // Append file as buffer with proper options for multipart/form-data
    formData.append('file', fileBuffer, {
      filename: filename,
      contentType: contentType,
    });
    formData.append('useType', String(useType));

    // Forward request to external API
    const requestUrl = `${EXTERNAL_API_BASE_URL}/integration/upload/file`;
    console.log('[UploadFile] Calling external API:', requestUrl);
    console.log('[UploadFile] File name:', filename);
    console.log('[UploadFile] File size:', file.size, 'bytes');
    console.log('[UploadFile] Content type:', contentType);
    console.log('[UploadFile] UseType:', useType);
    
    try {
      const headers = formData.getHeaders();
      console.log('[UploadFile] Request headers:', headers);
      
      // Create AbortController for timeout handling
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 30000); // 30 second timeout
      
      const externalResponse = await fetch(requestUrl, {
        method: 'POST',
        headers: headers,
        body: formData,
        signal: controller.signal,
      });
      
      console.log('[UploadFile] Response status:', externalResponse.status);
      console.log('[UploadFile] Response status text:', externalResponse.statusText);
      
      const responseData = await externalResponse.json();
      console.log('[UploadFile] Response data code:', responseData.code);
      console.log('[UploadFile] Response data message:', responseData.message);

      // Clean up temporary file
      try {
        if (filePath) {
          fs.unlinkSync(filePath);
        }
      } catch (cleanupError) {
        console.warn('[UploadFile] Failed to cleanup temp file:', cleanupError);
      }

      // Clear timeout on success
      clearTimeout(timeoutId);

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
    } catch (fetchError) {
      // Clear timeout on error
      if (typeof timeoutId !== 'undefined') {
        clearTimeout(timeoutId);
      }
      
      console.error('[UploadFile] Fetch error details:', {
        name: fetchError.name,
        message: fetchError.message,
        stack: fetchError.stack,
        cause: fetchError.cause,
        url: requestUrl
      });
      
      // Clean up temporary file even on error
      try {
        if (filePath) {
          fs.unlinkSync(filePath);
        }
      } catch (cleanupError) {
        console.warn('[UploadFile] Failed to cleanup temp file:', cleanupError);
      }
      
      // Provide more detailed error information
      let errorMessage = 'Failed to forward request to external API';
      if (fetchError.name === 'AbortError' || fetchError.message.includes('timeout')) {
        errorMessage = 'Request to external API timed out';
      } else if (fetchError.message.includes('ECONNREFUSED')) {
        errorMessage = 'Cannot connect to external API - connection refused';
      } else if (fetchError.message.includes('ENOTFOUND')) {
        errorMessage = 'External API host not found';
      } else if (fetchError.message.includes('ETIMEDOUT')) {
        errorMessage = 'External API connection timed out';
      }
      
      return res.status(500).json({
        code: 500,
        message: errorMessage,
        error: fetchError.message || 'fetch failed',
        errorType: fetchError.name,
        data: null
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

/**
 * Handle download banner image
 * GET /api/integration/downloadBanner?id=<banner_id>
 * 
 * Query parameters:
 * - id: String (the banner id from getBannerList response)
 * 
 * Response: File stream (image file)
 */
async function handleDownloadBanner(req, res) {
  try {
    const { id } = req.query;

    // Validate required parameter
    if (!id) {
      return res.status(400).json({
        code: 400,
        message: 'Missing required parameter: id is required'
      });
    }

    // Encrypt the id using encrypt2Data (matching Java method)
    let encryptedData;
    try {
      const dataToEncrypt = String(id);
      console.log('[DownloadBanner] Data to encrypt (id):', dataToEncrypt);
      encryptedData = encrypt2Data(DEFAULT_PUBLIC_KEY, dataToEncrypt);
    } catch (error) {
      console.error('[DownloadBanner] Encryption error:', error);
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
    const requestUrl = `${EXTERNAL_API_BASE_URL}/integration/down/file?${urlParams.toString()}`;
    
    console.log('[DownloadBanner] Calling external API:', requestUrl);
    console.log('[DownloadBanner] Request method: GET');
    console.log('[DownloadBanner] Banner ID:', id);
    console.log('[DownloadBanner] Encrypted data length:', encryptedData.length);
    
    const externalResponse = await fetch(requestUrl, {
      method: 'GET',
      headers: {
        'Accept': '*/*', // Accept any file type
      },
    });

    console.log('[DownloadBanner] Response status:', externalResponse.status);
    console.log('[DownloadBanner] Response status text:', externalResponse.statusText);
    console.log('[DownloadBanner] Response content-type:', externalResponse.headers.get('content-type'));

    // Check if response is successful
    if (!externalResponse.ok) {
      const errorText = await externalResponse.text();
      console.error('[DownloadBanner] External API error:', errorText);
      return res.status(externalResponse.status).json({
        code: externalResponse.status,
        message: 'Failed to download file from external API',
        error: errorText
      });
    }

    // Get content type from external response
    const contentType = externalResponse.headers.get('content-type') || 'application/octet-stream';
    const contentLength = externalResponse.headers.get('content-length');
    const contentDisposition = externalResponse.headers.get('content-disposition');

    // Set response headers for file stream
    res.setHeader('Content-Type', contentType);
    if (contentLength) {
      res.setHeader('Content-Length', contentLength);
    }
    if (contentDisposition) {
      res.setHeader('Content-Disposition', contentDisposition);
    }

    // Stream the file response
    // For Vercel serverless functions, we'll use arrayBuffer and send the buffer
    const arrayBuffer = await externalResponse.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    
    // Send the file buffer as response
    res.end(buffer);

  } catch (error) {
    console.error('Download banner error:', error);
    return res.status(500).json({
      code: 500,
      message: 'Internal server error',
      error: error.message
    });
  }
}

