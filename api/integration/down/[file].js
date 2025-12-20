/**
 * GET /integration/down/file
 * Download banner image file
 * 
 * Query parameters:
 * - id: String (the banner id from getBannerList response)
 * 
 * Response: File stream (image file)
 */

import withCors from '../../../lib/withCors.js';
import { encrypt2Data } from '../../../lib/sm2-utils.js';

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
      console.log('[DownFile] Data to encrypt (id):', dataToEncrypt);
      encryptedData = encrypt2Data(DEFAULT_PUBLIC_KEY, dataToEncrypt);
    } catch (error) {
      console.error('[DownFile] Encryption error:', error);
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
    
    console.log('[DownFile] Calling external API:', requestUrl);
    console.log('[DownFile] Request method: GET');
    console.log('[DownFile] Banner ID:', id);
    console.log('[DownFile] Encrypted data length:', encryptedData.length);
    
    const externalResponse = await fetch(requestUrl, {
      method: 'GET',
      headers: {
        'Accept': '*/*', // Accept any file type
      },
    });

    console.log('[DownFile] Response status:', externalResponse.status);
    console.log('[DownFile] Response status text:', externalResponse.statusText);
    console.log('[DownFile] Response content-type:', externalResponse.headers.get('content-type'));

    // Check if response is successful
    if (!externalResponse.ok) {
      const errorText = await externalResponse.text();
      console.error('[DownFile] External API error:', errorText);
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
    console.error('Down file error:', error);
    return res.status(500).json({
      code: 500,
      message: 'Internal server error',
      error: error.message
    });
  }
});

