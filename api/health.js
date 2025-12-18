import { createClient } from "@libsql/client";

const client = createClient({
  url: process.env.TURSO_DATABASE_URL,
  authToken: process.env.TURSO_AUTH_TOKEN,
});

export default async function handler(req, res) {
  try {
    // Test database connection
    await client.execute('SELECT 1');
    
    // Make GET request to external API
    let externalApiStatus = 'unknown';
    let externalApiError = null;
    try {
      const externalResponse = await fetch('https://otp.accessyou-api.com/sendsms-otp.php?accountno=11036769&user=11036769&pwd=62199579&tid=1&a=123321&phone=85251738110', {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
        },
      });
      
      if (externalResponse.ok) {
        externalApiStatus = 'connected';
      } else {
        externalApiStatus = 'error';
        externalApiError = `HTTP ${externalResponse.status}`;
      }
    } catch (error) {
      externalApiStatus = 'disconnected';
      externalApiError = error.message;
    }
    
    return res.status(200).json({
      success: true,
      message: 'API is healthy',
      timestamp: new Date().toISOString(),
      database: 'connected',
      externalApi: {
        status: externalApiStatus,
        url: 'https://otp.accessyou-api.com/sendsms-otp.php?accountno=11036769&user=11036769&pwd=62199579&tid=1&a=123321&phone=85251738110',
        error: externalApiError
      }
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

