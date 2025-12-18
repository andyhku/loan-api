import { createUser, getUserByAccount, getUserByPhone } from '../lib/db.js';
import { hashPassword, validatePassword } from '../lib/auth.js';
import { verifyCode } from '../lib/db.js';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ 
      code: 405,
      msg: 'Method not allowed. Use POST.' 
    });
  }

  try {
    const { 
      user_name, 
      user_account, 
      user_mobile_number, 
      user_password, 
      user_password_sure,
      user_age, 
      user_sex, 
      Vcode 
    } = req.body;

    // Validate required fields
    if (!user_name || !user_account || !user_mobile_number || !user_password || !user_age || !Vcode) {
      return res.status(200).json({
        code: 400,
        msg: '請填寫完整信息'
      });
    }

    // Validate password strength
    if (!validatePassword(user_password)) {
      return res.status(200).json({
        code: 400,
        msg: '密碼至少包含數字、字母，並超過8位～'
      });
    }

    // Check password match
    if (user_password !== user_password_sure) {
      return res.status(200).json({
        code: 400,
        msg: '密碼不一致'
      });
    }

    // Verify verification code
    const isCodeValid = await verifyCode(user_mobile_number, Vcode, 'register');
    if (!isCodeValid) {
      return res.status(200).json({
        code: 400,
        msg: '驗證碼錯誤或已過期'
      });
    }

    // Check if account already exists
    const existingAccount = await getUserByAccount(user_account);
    if (existingAccount) {
      return res.status(200).json({
        code: 409,
        msg: '此帳號已被使用'
      });
    }

    // Check if phone already exists
    const existingPhone = await getUserByPhone(user_mobile_number);
    if (existingPhone) {
      return res.status(200).json({
        code: 409,
        msg: '此手機號碼已被使用'
      });
    }

    // Hash password
    const passwordHash = await hashPassword(user_password);

    // Create user
    const userData = {
      user_account,
      user_name,
      user_mobile_number,
      user_age: String(user_age),
      user_sex: user_sex || '男',
      password_hash: passwordHash
    };

    await createUser(userData);

    // Return success
    return res.status(200).json({
      code: 200,
      msg: '註冊成功'
    });

  } catch (error) {
    console.error('Registration error:', error);
    return res.status(200).json({
      code: 500,
      msg: '伺服器錯誤，請稍後再試'
    });
  }
}

