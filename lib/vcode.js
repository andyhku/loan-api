/**
 * Generate a random 6-digit verification code
 */
export function generateVerificationCode() {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

/**
 * Send verification code via SMS API
 * Uses the AccessYou OTP SMS service
 */
export async function sendVerificationCode(phone, code) {
  try {
    // Get SMS API credentials from environment variables or use defaults
    const SMS_API_URL = process.env.SMS_API_URL || 'https://otp.accessyou-anyip.com/sendsms-otp.php';
    const SMS_ACCOUNT_NO = process.env.SMS_ACCOUNT_NO || '11036769';
    const SMS_USER = process.env.SMS_USER || '11036769';
    const SMS_PASSWORD = process.env.SMS_PASSWORD || '62199579';
    const SMS_TEMPLATE_ID = process.env.SMS_TEMPLATE_ID || '1';

    // Build URL with query parameters
    const urlParams = new URLSearchParams({
      accountno: SMS_ACCOUNT_NO,
      user: SMS_USER,
      pwd: SMS_PASSWORD,
      tid: SMS_TEMPLATE_ID,
      a: code, // Verification code
      phone: "852" + phone.toString() // Phone number
    });

    const requestUrl = `${SMS_API_URL}?${urlParams.toString()}`;

    console.log(`[SMS] Sending verification code to ${phone}`);
    console.log(`[SMS] API URL: ${SMS_API_URL}`);

    // Make GET request to SMS API
    const response = await fetch(requestUrl, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
      },
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`[SMS] API error: ${response.status} - ${errorText}`);
      throw new Error(`SMS API returned status ${response.status}: ${errorText}`);
    }

    const responseData = await response.text();
    console.log(`[SMS] Response: ${responseData}`);

    return {
      success: true,
      response: responseData
    };

  } catch (error) {
    console.error(`[SMS] Failed to send verification code to ${phone}:`, error.message);
    throw error;
  }
}

