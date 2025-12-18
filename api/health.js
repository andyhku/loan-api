import { sql } from '@vercel/postgres';

export default async function handler(req, res) {
  try {
    // Test database connection
    await sql`SELECT 1`;
    
    return res.status(200).json({
      success: true,
      message: 'API is healthy',
      timestamp: new Date().toISOString(),
      database: 'connected'
    });
  } catch (error) {
    return res.status(503).json({
      success: false,
      message: 'API is unhealthy',
      timestamp: new Date().toISOString(),
      database: 'disconnected',
      error: error.message
    });
  }
}

