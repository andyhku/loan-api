import bcrypt from 'bcryptjs';

/**
 * Hash a password
 */
export async function hashPassword(password) {
  const saltRounds = 10;
  return await bcrypt.hash(password, saltRounds);
}

/**
 * Compare password with hash
 */
export async function comparePassword(password, hash) {
  return await bcrypt.compare(password, hash);
}

/**
 * Validate phone number format (basic validation)
 */
export function validatePhoneNumber(phoneNumber) {
  // Remove all non-digit characters
  const cleaned = phoneNumber.replace(/\D/g, '');
  // Check if it's between 10-15 digits (international format)
  return cleaned.length >= 10 && cleaned.length <= 15;
}

/**
 * Validate password strength
 */
export function validatePassword(password) {
  // At least 6 characters
  return password && password.length >= 6;
}

