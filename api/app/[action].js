/**
 * Consolidated App API endpoint
 * Handles: login, register, password_recovery, changepassword
 * 
 * Usage:
 * - POST /api/app/login
 * - POST /api/app/register
 * - POST /api/app/password_recovery
 * - POST /api/app/changepassword
 */

import { getUserByAccount, getUserByPhone, createUser, updateUserPasswordByAccount } from '../../lib/db.js';
import { hashPassword, comparePassword, validatePassword } from '../../lib/auth.js';
import { generateToken, verifyToken } from '../../lib/jwt.js';
import { updateUserCookie, verifyCode } from '../../lib/db.js';
import withCors from '../../lib/withCors.js';

export default withCors(async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ 
      code: 405,
      msg: 'Method not allowed. Use POST.' 
    });
  }

  const { action } = req.query;

  // Route to appropriate handler based on action
  switch (action) {
    case 'login':
      return handleLogin(req, res);
    case 'register':
      return handleRegister(req, res);
    case 'password_recovery':
      return handlePasswordRecovery(req, res);
    case 'changepassword':
      return handleChangePassword(req, res);
    default:
      return res.status(404).json({
        code: 404,
        msg: `Unknown action: ${action}. Valid actions: login, register, password_recovery, changepassword`
      });
  }
});

/**
 * Handle login
 * POST /api/app/login
 */
async function handleLogin(req, res) {
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

/**
 * Handle register
 * POST /api/app/register
 */
async function handleRegister(req, res) {
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

/**
 * Handle password recovery
 * POST /api/app/password_recovery
 */
async function handlePasswordRecovery(req, res) {
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
}

/**
 * Handle change password
 * POST /api/app/changepassword
 */
async function handleChangePassword(req, res) {
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

