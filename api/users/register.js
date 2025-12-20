import { createUser, getUserByPhone } from '../../lib/db.js';
import { hashPassword, validatePhoneNumber, validatePassword } from '../../lib/auth.js';
import withCors from '../../lib/withCors.js';

export default withCors(async function handler(req, res) {
  // Only allow POST requests
  if (req.method !== 'POST') {
    return res.status(405).json({ 
      success: false, 
      error: 'Method not allowed. Use POST.' 
    });
  }

  try {
    const { phone_number, password } = req.body;

    // Validate input
    if (!phone_number || !password) {
      return res.status(400).json({
        success: false,
        error: 'Phone number and password are required'
      });
    }

    // Validate phone number format
    if (!validatePhoneNumber(phone_number)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid phone number format'
      });
    }

    // Validate password strength
    if (!validatePassword(password)) {
      return res.status(400).json({
        success: false,
        error: 'Password must be at least 6 characters long'
      });
    }

    // Check if user already exists
    const existingUser = await getUserByPhone(phone_number);
    if (existingUser) {
      return res.status(409).json({
        success: false,
        error: 'User with this phone number already exists'
      });
    }

    // Hash password
    const passwordHash = await hashPassword(password);

    // Create user
    const user = await createUser(phone_number, passwordHash);

    // Return success (don't return password hash)
    return res.status(201).json({
      success: true,
      message: 'User registered successfully',
      user: {
        id: user.id,
        phone_number: user.phone_number,
        created_at: user.created_at
      }
    });

  } catch (error) {
    console.error('Registration error:', error);
    return res.status(500).json({
      success: false,
      error: 'Internal server error. Please try again later.'
    });
  }
});

