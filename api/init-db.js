import { initDatabase } from '../../lib/db.js';

export default async function handler(req, res) {
  // Only allow POST requests (for security, you might want to add authentication)
  if (req.method !== 'POST') {
    return res.status(405).json({ 
      success: false, 
      error: 'Method not allowed. Use POST.' 
    });
  }

  try {
    await initDatabase();
    
    return res.status(200).json({
      success: true,
      message: 'Database initialized successfully'
    });
  } catch (error) {
    console.error('Database initialization error:', error);
    return res.status(500).json({
      success: false,
      error: 'Failed to initialize database',
      details: error.message
    });
  }
}

