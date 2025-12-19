/**
 * CORS helper function for Vercel serverless functions
 * Sets appropriate CORS headers based on environment configuration
 */
export function setCorsHeaders(req, res) {
  const allowedOrigins = process.env.ALLOWED_ORIGINS 
    ? process.env.ALLOWED_ORIGINS.split(',').map(origin => origin.trim())
    : ['*']; // Allow all origins by default
  
  const origin = req.headers?.origin;
  const allowedOrigin = allowedOrigins.includes('*') || (origin && allowedOrigins.includes(origin))
    ? (origin || '*')
    : allowedOrigins[0];

  // Echo back the headers requested in the preflight, or use a comprehensive default list
  // This allows any header the client requests, which is the most permissive approach
  const requestedHeaders = req.headers['access-control-request-headers'];
  
  let allowedHeaders;
  if (requestedHeaders) {
    // Echo back the headers that were requested in the preflight
    allowedHeaders = requestedHeaders;
  } else {
    // Comprehensive default list for non-preflight requests
    allowedHeaders = [
      'Content-Type',
      'Authorization',
      'X-Requested-With',
      'Accept',
      'Accept-Language',
      'Accept-Encoding',
      'User-Agent',
      'Referer',
      'Origin',
      'Cache-Control',
      'Pragma',
      'X-Custom-Header',
      'X-Request-ID',
      'X-Client-Version',
      'X-Platform',
      'X-Device-ID',
      'X-App-Version',
      'X-Token',
      'X-Session-ID',
      'content-type',
      'content-length',
      'content-encoding',
      'content-language',
      'content-location',
      'content-range',
      'content-md5',
      'content-disposition',
      'X-Forwarded-For',
      'X-Forwarded-Proto',
      'X-Real-IP',
      'Cookie',
      'Set-Cookie'
    ].join(', ');
  }

  res.setHeader('Access-Control-Allow-Origin', allowedOrigin);
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, PATCH, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', allowedHeaders);
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Max-Age', '86400'); // 24 hours
  res.setHeader('Access-Control-Expose-Headers', 'Content-Length, Content-Type, Content-Disposition');
}

/**
 * Handle OPTIONS preflight request
 */
export function handleOptions(req, res) {
  setCorsHeaders(req, res);
  return res.status(200).end();
}

