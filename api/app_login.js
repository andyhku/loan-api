import { getUserByAccount } from '../lib/db.js';
import { comparePassword } from '../lib/auth.js';
import { generateToken } from '../lib/jwt.js';
import { updateUserCookie } from '../lib/db.js';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ 
      code: 405,
      msg: 'Method not allowed. Use POST.' 
    });
  }

  try {
    const { user_account, user_password } = req.body;

    // Validate input
    if (!user_account || !user_password) {
      return res.status(200).json({
        code: 400,
        msg: '請輸入帳號或密碼'
      });
    }

    // Get user by account
    const user = await getUserByAccount(user_account);
    if (!user) {
      return res.status(200).json({
        code: 401,
        msg: '帳號或密碼錯誤'
      });
    }

    // Compare password
    const isPasswordValid = await comparePassword(user_password, user.password_hash);
    if (!isPasswordValid) {
      return res.status(200).json({
        code: 401,
        msg: '帳號或密碼錯誤'
      });
    }

    // Generate JWT token
    const token = generateToken(user);
    
    // Update user cookie in database
    await updateUserCookie(user_account, token);

    // Return success with user data (matching app expectations)
    return res.status(200).json({
      code: 200,
      msg: '登入成功',
      data: {
        id: user.id,
        user_account: user.user_account,
        user_name: user.user_name,
        user_mobile_number: user.user_mobile_number,
        user_age: user.user_age,
        user_sex: user.user_sex,
        user_cookie: token,
        created_at: user.created_at
      }
    });

  } catch (error) {
    console.error('Login error:', error);
    return res.status(200).json({
      code: 500,
      msg: '伺服器錯誤，請稍後再試'
    });
  }
}

