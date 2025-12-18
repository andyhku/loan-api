/**
 * Generate a random 6-digit verification code
 */
export function generateVerificationCode() {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

/**
 * Send verification code (mock implementation)
 * In production, integrate with SMS service like Twilio, AWS SNS, etc.
 */
export async function sendVerificationCode(phone, code) {
  // TODO: Integrate with actual SMS service
  // For now, just log it (in production, remove this)
  console.log(`[MOCK SMS] Verification code for ${phone}: ${code}`);
  
  // Simulate async SMS sending
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({ success: true });
    }, 100);
  });
}

