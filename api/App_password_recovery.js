import { getUserByAccount, getUserByPhone, updateUserPasswordByAccount } from '../lib/db.js';
import { hashPassword, validatePassword } from '../lib/auth.js';
import { verifyCode } from '../lib/db.js';
import withCors from '../lib/withCors.js';

export default withCors(async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ 
      code: 405,
      msg: 'Method not allowed. Use POST.' 
    });
  }

  try {
    const { user_account, phone, Vcode, new_password } = req.body;

    // Validate required fields
    if (!user_account || !phone || !Vcode || !new_password) {
      return res.status(200).json({
        code: 400,
        msg: '請輸入完整的信息'
      });
    }

    // Validate password strength
    if (!validatePassword(new_password)) {
      return res.status(200).json({
        code: 400,
        msg: '密碼至少包含數字、字母，並超過8位～'
      });
    }

    // Verify user account exists
    const user = await getUserByAccount(user_account);
    if (!user) {
      return res.status(200).json({
        code: 404,
        msg: '帳號不存在'
      });
    }

    // Verify phone matches account
    if (user.user_mobile_number !== phone) {
      return res.status(200).json({
        code: 400,
        msg: '手機號碼與帳號不匹配'
      });
    }

    // Verify verification code
    const isCodeValid = await verifyCode(phone, Vcode, 'reset');
    if (!isCodeValid) {
      return res.status(200).json({
        code: 400,
        msg: '驗證碼錯誤或已過期'
      });
    }

    // Hash new password
    const passwordHash = await hashPassword(new_password);

    // Update password
    await updateUserPasswordByAccount(user_account, passwordHash);

    // Return success
    return res.status(200).json({
      code: 200,
      msg: '密碼重置成功'
    });

  } catch (error) {
    console.error('Password recovery error:', error);
    return res.status(200).json({
      code: 500,
      msg: '伺服器錯誤，請稍後再試'
    });
  }
});

