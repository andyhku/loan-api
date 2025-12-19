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

  res.setHeader('Access-Control-Allow-Origin', allowedOrigin);
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With');
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Max-Age', '86400'); // 24 hours
}

/**
 * Handle OPTIONS preflight request
 */
export function handleOptions(req, res) {
  setCorsHeaders(req, res);
  return res.status(200).end();
}

