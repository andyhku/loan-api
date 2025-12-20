/**
 * CORS wrapper for Vercel serverless functions
 * Wraps any API handler to automatically add CORS support
 * 
 * Usage:
 *   import withCors from '../lib/withCors.js';
 *   export default withCors(async (req, res) => {
 *     // Your handler code
 *   });
 */
import { setCorsHeaders, handleOptions } from './cors.js';

export default function withCors(handler) {
  return async (req, res) => {
    // Handle preflight OPTIONS request
    if (req.method === 'OPTIONS') {
      return handleOptions(req, res);
    }

    // Set CORS headers for all responses
    setCorsHeaders(req, res);

    // Call the original handler
    return handler(req, res);
  };
}

