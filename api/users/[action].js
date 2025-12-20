/**
 * Consolidated Users API endpoint
 * Handles: login, register, get (by id)
 * 
 * Usage:
 * - POST /api/users/login
 * - POST /api/users/register
 * - GET /api/users/get?id=123
 */

import { getUserByPhone, getUserById, createUser } from '../../lib/db.js';
import { hashPassword, comparePassword, validatePassword } from '../../lib/auth.js';
import withCors from '../../lib/withCors.js';

export default withCors(async function handler(req, res) {
  const { action } = req.query;

  // If action is a number, treat it as user ID (GET /api/users/123)
  if (action && !isNaN(parseInt(action))) {
    if (req.method !== 'GET') {
      return res.status(405).json({ 
        success: false, 
        error: 'Method not allowed. Use GET.' 
      });
    }
    return handleGetUser(req, res);
  }

  // Route to appropriate handler based on action
  switch (action) {
    case 'login':
      if (req.method !== 'POST') {
        return res.status(405).json({ 
          success: false, 
          error: 'Method not allowed. Use POST.' 
        });
      }
      return handleLogin(req, res);
    
    case 'register':
      if (req.method !== 'POST') {
        return res.status(405).json({ 
          success: false, 
          error: 'Method not allowed. Use POST.' 
        });
      }
      return handleRegister(req, res);
    
    case 'get':
      // GET /api/users/get?id=123
      if (req.method !== 'GET') {
        return res.status(405).json({ 
          success: false, 
          error: 'Method not allowed. Use GET.' 
        });
      }
      return handleGetUser(req, res);
    
    default:
      return res.status(404).json({
        success: false,
        error: `Unknown action: ${action}. Valid actions: login, register, get (or use numeric ID like /api/users/123)`
      });
  }
});

/**
 * Handle login
 * POST /api/users/login
 */
async function handleLogin(req, res) {
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
}

/**
 * Handle register
 * POST /api/users/register
 */
async function handleRegister(req, res) {
  try {
    const { phone_number, password } = req.body;

    // Validate input
    if (!phone_number || !password) {
      return res.status(400).json({
        success: false,
        error: 'Phone number and password are required'
      });
    }

    // Validate password strength
    if (!validatePassword(password)) {
      return res.status(400).json({
        success: false,
        error: 'Password must contain at least one number, one letter, and be at least 8 characters long'
      });
    }

    // Check if phone already exists
    const existingUser = await getUserByPhone(phone_number);
    if (existingUser) {
      return res.status(409).json({
        success: false,
        error: 'Phone number already registered'
      });
    }

    // Hash password
    const passwordHash = await hashPassword(password);

    // Create user
    const userData = {
      phone_number,
      password_hash: passwordHash
    };

    const newUser = await createUser(userData);

    // Return success
    return res.status(200).json({
      success: true,
      message: 'Registration successful',
      user: {
        id: newUser.id,
        phone_number: newUser.phone_number,
        created_at: newUser.created_at
      }
    });

  } catch (error) {
    console.error('Registration error:', error);
    return res.status(500).json({
      success: false,
      error: 'Internal server error. Please try again later.'
    });
  }
}

/**
 * Handle get user by ID
 * GET /api/users/get?id=123
 * GET /api/users/123 (where 123 is the action parameter)
 */
async function handleGetUser(req, res) {
  try {
    // Get ID from query param (for /api/users/get?id=123) or action (for /api/users/123)
    const id = req.query.id || req.query.action;
    
    // Validate input
    if (!id || isNaN(parseInt(id))) {
      return res.status(400).json({
        success: false,
        error: 'Valid user ID is required'
      });
    }

    // Get user by ID
    const user = await getUserById(parseInt(id));
    if (!user) {
      return res.status(404).json({
        success: false,
        error: 'User not found'
      });
    }

    // Return user data (without password hash)
    return res.status(200).json({
      success: true,
      user: {
        id: user.id,
        phone_number: user.phone_number,
        created_at: user.created_at,
        updated_at: user.updated_at
      }
    });

  } catch (error) {
    console.error('Get user error:', error);
    return res.status(500).json({
      success: false,
      error: 'Internal server error. Please try again later.'
    });
  }
}

