/**
 * Loan Application API Endpoint
 * Handles loan application submissions with comprehensive data
 * 
 * POST /api/appaddinformation
 */

import { verifyToken } from '../lib/jwt.js';
import { createLoanApplication } from '../lib/db.js';
import withCors from '../lib/withCors.js';

export default withCors(async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ 
      code: 405,
      msg: 'Method not allowed. Use POST.' 
    });
  }

  try {
    // Verify authentication token
    const authHeader = req.headers.authorization;
    if (!authHeader) {
      return res.status(200).json({
        code: 401,
        msg: '未授權，請先登入'
      });
    }

    const token = authHeader.replace('Bearer ', '');
    const decoded = verifyToken(token);
    if (!decoded) {
      return res.status(200).json({
        code: 401,
        msg: '無效的授權令牌'
      });
    }

    const userId = decoded.id;
    const applicationData = req.body;

    // Validate required fields
    const requiredFields = ['customerName', 'customerPhone', 'salesmanReferralCode'];
    for (const field of requiredFields) {
      if (!applicationData[field]) {
        return res.status(200).json({
          code: 400,
          msg: `缺少必填字段: ${field}`
        });
      }
    }

    // Validate customer photos (2-5 required)
    if (!applicationData.customerPhotos || 
        applicationData.customerPhotos.length < 2 || 
        applicationData.customerPhotos.length > 5) {
      return res.status(200).json({
        code: 400,
        msg: '請上傳2-5張客戶照片'
      });
    }

    // Create loan application record
    const applicationId = await createLoanApplication({
      user_id: userId,
      ...applicationData
    });

    return res.status(200).json({
      code: 200,
      msg: '申請提交成功',
      data: {
        applicationId
      }
    });

  } catch (error) {
    console.error('Loan application submission error:', error);
    return res.status(200).json({
      code: 500,
      msg: '伺服器錯誤，請稍後再試'
    });
  }
});
