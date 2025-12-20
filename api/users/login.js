import { getUserByPhone } from '../../lib/db.js';
import { comparePassword } from '../../lib/auth.js';
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

    // Get user by phone number
    const user = await getUserByPhone(phone_number);
    if (!user) {
      return res.status(401).json({
        success: false,
        error: 'Invalid phone number or password'
      });
    }

    // Compare password
    const isPasswordValid = await comparePassword(password, user.password_hash);
    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        error: 'Invalid phone number or password'
      });
    }

    // Return success (don't return password hash)
    return res.status(200).json({
      success: true,
      message: 'Login successful',
      user: {
        id: user.id,
        phone_number: user.phone_number,
        created_at: user.created_at
      }
    });

  } catch (error) {
    console.error('Login error:', error);
    return res.status(500).json({
      success: false,
      error: 'Internal server error. Please try again later.'
    });
  }
});

