import { saveVerificationCode, initDatabase } from '../lib/db.js';
import { generateVerificationCode, sendVerificationCode } from '../lib/vcode.js';
import { setCorsHeaders, handleOptions } from '../lib/cors.js';

// Ensure database is initialized before operations
// This is safe to call multiple times as CREATE TABLE IF NOT EXISTS is idempotent
async function ensureDatabaseInitialized() {
  try {
    await initDatabase();
  } catch (error) {
    console.error('Failed to initialize database:', error);
    // Re-throw so the error can be handled by the caller
    throw error;
  }
}

export default async function handler(req, res) {
  // Handle preflight OPTIONS request
  if (req.method === 'OPTIONS') {
    return handleOptions(req, res);
  }

  // Set CORS headers for all responses
  setCorsHeaders(req, res);

  // Ensure database is initialized
  await ensureDatabaseInitialized();

  if (req.method !== 'POST') {
    return res.status(405).json({ 
      code: 405,
      msg: 'Method not allowed. Use POST.' 
    });
  }

  try {
    const { phone, scene } = req.body;

    // Validate input
    if (!phone) {
      return res.status(200).json({
        code: 400,
        msg: '請輸入手機號碼'
      });
    }

    if (!scene || (scene !== 'register' && scene !== 'reset')) {
      return res.status(200).json({
        code: 400,
        msg: '無效的場景參數'
      });
    }

    // Generate verification code
    const code = generateVerificationCode();

    // Save code to database
    await saveVerificationCode(phone, code, scene);

    // Send SMS (mock implementation - replace with real SMS service)
    await sendVerificationCode(phone, code);

    // Return success
    return res.status(200).json({
      code: 200,
      msg: '驗證碼已發送'
    });

  } catch (error) {
    console.error('Get verification code error:', error);
    return res.status(200).json({
      code: 500,
      msg: '伺服器錯誤，請稍後再試'
    });
  }
}

