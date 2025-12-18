import { getUserByAccount, updateUserPasswordByAccount } from '../lib/db.js';
import { hashPassword, comparePassword, validatePassword } from '../lib/auth.js';
import { verifyToken } from '../lib/jwt.js';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ 
      code: 405,
      msg: 'Method not allowed. Use POST.' 
    });
  }

  try {
    const { user_account, user_password, new_password, new_password_sure } = req.body;

    // Validate required fields
    if (!user_account || !user_password || !new_password || !new_password_sure) {
      return res.status(200).json({
        code: 400,
        msg: '請輸入完整密碼'
      });
    }

    // Validate password strength
    if (!validatePassword(new_password)) {
      return res.status(200).json({
        code: 400,
        msg: '密碼至少包含數字、字母，並超過8位～'
      });
    }

    // Check password match
    if (new_password !== new_password_sure) {
      return res.status(200).json({
        code: 400,
        msg: '密碼不一致'
      });
    }

    // Verify authentication token (optional but recommended)
    const authHeader = req.headers.authorization;
    if (authHeader) {
      const token = authHeader.replace('Bearer ', '');
      const decoded = verifyToken(token);
      if (!decoded || decoded.user_account !== user_account) {
        return res.status(200).json({
          code: 401,
          msg: '未授權'
        });
      }
    }

    // Get user
    const user = await getUserByAccount(user_account);
    if (!user) {
      return res.status(200).json({
        code: 404,
        msg: '用戶不存在'
      });
    }

    // Verify old password
    const isPasswordValid = await comparePassword(user_password, user.password_hash);
    if (!isPasswordValid) {
      return res.status(200).json({
        code: 401,
        msg: '原密碼錯誤'
      });
    }

    // Hash new password
    const passwordHash = await hashPassword(new_password);

    // Update password
    await updateUserPasswordByAccount(user_account, passwordHash);

    // Return success
    return res.status(200).json({
      code: 200,
      msg: '密碼修改成功'
    });

  } catch (error) {
    console.error('Change password error:', error);
    return res.status(200).json({
      code: 500,
      msg: '伺服器錯誤，請稍後再試'
    });
  }
}

