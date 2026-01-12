/**
 * Loan Application API Endpoint
 * Handles loan application submissions with comprehensive data
 * 
 * POST /api/appaddinformation
 */

import { verifyToken } from '../lib/jwt.js';
import { createLoanApplication } from '../lib/db.js';
import { encrypt2Data } from '../lib/sm2-utils.js';
import withCors from '../lib/withCors.js';
import fetch from 'node-fetch';

const EXTERNAL_API_BASE_URL = process.env.EXTERNAL_API_BASE_URL || 'http://47.76.240.167:9999/asset/api';
const DEFAULT_APP_KEY = 'Lq5bPzcnlcFuXst5Ca65Rb5r75mTmQoR';
const DEFAULT_APP_SECRET = 'XtsGzJrFP88XpZmrpGVfsVNV5q2sYbR6';
const DEFAULT_PUBLIC_KEY = '040c3700540ff36b73c1bb5f2f7c04c9ebd320348d87cc83ae501896b69660f2bf0c77b480f6dc284a39c752ba288d90145763f03bf78c4a92c67be68abe2f8298';

/**
 * Transform new format to old API format
 * Maps camelCase fields to the format expected by external API
 */
function transformToOldFormat(data) {
  return {
    // Basic information
    Referral_Code: data.salesmanReferralCode || '',
    customer_name: data.customerName || '',
    customer_phone: data.customerPhone || '',
    apply_limit: String(data.loanAmount || ''),
    sex: data.customerGender || '1',
    customer_account: data.customerPhone || '', // Use phone as account
    
    // Customer photos (file IDs array)
    customer_photos: data.customerPhotos || [],
    
    // Debt records - transform to old format
    Debt_record: data.debts?.map(debt => ({
      jieqianrenname: debt.name || '',
      jine: String(debt.amount || ''),
      qishu: String(debt.period || ''),
      yuxiaqishu: String(debt.remainingPeriod || '')
    })) || [],
    
    // Company information
    company_information: {
      gongsiming: data.customerCompanyName || '',
      dizhi: data.customerCompanyAddress || '',
      dianhua: data.customerCompanyPhone || '',
      zhiwei: data.customerCompanyPosition || '',
      shouru: String(data.customerIncome || ''),
      gongzuonianxian: String(data.customerWorkYears || ''),
      isor: data.isCustomerOwnCompany || ''
    },
    
    // Personal data
    personal_data: {
      customer_phone: data.customerPhone || '',
      shenfenzheng: data.customerIdCard || '',
      chushengriqi: data.customerBirthDate || '',
      nianling: String(data.customerAge || ''),
      youtiqu: data.hasProvidentFundExtraction || '',
      qiangjijin: data.providentFundTrustee || '',
      juzhudizhi: data.customerResidentialAddress || '',
      zhuzhaileixing: data.customerResidentialType || '',
      zhuzaidianhua: data.customerResidentialPhone || '',
      juzhunianshu: String(data.customerResidentialYears || ''),
      shifougoumai: data.isCustomerHouseOwned || '',
      wuzhuxingming: data.houseOwnerName || '',
      youwuchanquan: data.hasBankruptcy || '',
      youwuzoushu: data.hasBadCredit || ''
    },
    
    // Receiving bank
    receiving_bank: {
      zhanghao: data.receivingBankCode || '',
      bank_name: data.receivingBankName || '',
      shoukuanrenming: data.receivingAccountName || ''
    },
    
    // Contact persons - combine cohabitants and non-cohabitants
    contact_person: [
      ...(data.cohabitants?.map(person => ({
        contact_person_name: person.name || '',
        dianhua: person.phone || '',
        guanxi: person.relationship || '',
        nianling: String(person.age || ''),
        gongzuodizhi: person.workAddress || '',
        gongzuodianhua: person.workPhone || '',
        type: 'cohabitant'
      })) || []),
      ...(data.nonCohabitants?.map(person => ({
        contact_person_name: person.name || '',
        dianhua: person.phone || '',
        guanxi: person.relationship || '',
        nianling: String(person.age || ''),
        gongzuodizhi: person.workAddress || '',
        gongzuodianhua: person.workPhone || '',
        type: 'nonCohabitant'
      })) || [])
    ],
    
    // Phone book list - stored as notes or separate field
    notes: data.customerPhoneBookList ? JSON.stringify(data.customerPhoneBookList) : '',
    
    // Additional files
    monthlyStatements: data.monthlyStatements || [],
    loanApplicationOtherFiles: data.loanApplicationOtherFiles || []
  };
}

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

    console.log('[AppAddInformation] Application data (new format - no transformation):', JSON.stringify(applicationData, null, 2));

    // Encrypt the application data using SM2 (send new format directly)
    let encryptedData;
    try {
      const dataToEncrypt = JSON.stringify(applicationData);
      console.log('[AppAddInformation] Data to encrypt length:', dataToEncrypt.length);
      encryptedData = encrypt2Data(DEFAULT_PUBLIC_KEY, dataToEncrypt);
      console.log('[AppAddInformation] Encryption successful, encrypted length:', encryptedData.length);
      console.log('[AppAddInformation] Encrypted data preview:', ("04" + encryptedData));
    } catch (error) {
      console.error('[AppAddInformation] Encryption error:', error);
      return res.status(200).json({
        code: 500,
        msg: '加密數據失敗',
        error: error.message
      });
    }

    // Call external API to sync application
    try {
      console.log('[AppAddInformation] Calling external API:', `${EXTERNAL_API_BASE_URL}/integration/syncApplication`);
      
      const externalResponse = await fetch(`${EXTERNAL_API_BASE_URL}/integration/syncApplication`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify({
          appKey: DEFAULT_APP_KEY,
          appSecret: DEFAULT_APP_SECRET,
          encryptData: "04" + encryptedData
        }),
      });

      const responseData = await externalResponse.json();
      console.log('[AppAddInformation] External API response:', responseData);

      // Save to database if external API call was successful
      if (externalResponse.ok && responseData.code === 1) {
        try {
          const applicationId = await createLoanApplication({
            user_id: userId,
            ...applicationData
          });
          console.log('[AppAddInformation] Saved to database, ID:', applicationId);
        } catch (dbError) {
          console.error('[AppAddInformation] Database save error:', dbError);
          // Don't fail the request if database save fails
        }
      }

      // Return the response from external API
      if (externalResponse.ok) {
        return res.status(200).json({
          code: responseData.code === 1 ? 200 : responseData.code,
          msg: responseData.message || '申請提交成功',
          data: responseData.data
        });
      } else {
        return res.status(200).json({
          code: externalResponse.status,
          msg: responseData.message || '外部API錯誤',
          data: responseData.data || null
        });
      }

    } catch (fetchError) {
      console.error('[AppAddInformation] External API call error:', fetchError);
      return res.status(200).json({
        code: 500,
        msg: '調用外部API失敗',
        error: fetchError.message
      });
    }

  } catch (error) {
    console.error('[AppAddInformation] Loan application submission error:', error);
    return res.status(200).json({
      code: 500,
      msg: '伺服器錯誤，請稍後再試',
      error: error.message
    });
  }
});
