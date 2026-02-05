import withCors from '../../lib/withCors.js';

export default withCors(async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  // APK file path - update this to your actual APK file location
  const apkUrl = process.env.APK_DOWNLOAD_URL || '/download/app.apk';
  const appName = process.env.APP_NAME || 'Loan App';
  const appVersion = process.env.APP_VERSION || '1.0.0';

  const html = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Download ${appName} APK</title>
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }
        
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            min-height: 100vh;
            display: flex;
            align-items: center;
            justify-content: center;
            padding: 20px;
        }
        
        .container {
            background: white;
            border-radius: 20px;
            box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
            max-width: 500px;
            width: 100%;
            padding: 40px;
            text-align: center;
        }
        
        .icon {
            width: 80px;
            height: 80px;
            margin: 0 auto 20px;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            border-radius: 20px;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 40px;
        }
        
        h1 {
            color: #333;
            margin-bottom: 10px;
            font-size: 28px;
        }
        
        .subtitle {
            color: #666;
            margin-bottom: 30px;
            font-size: 14px;
        }
        
        .download-btn {
            display: inline-block;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            padding: 16px 40px;
            border-radius: 50px;
            text-decoration: none;
            font-weight: 600;
            font-size: 18px;
            transition: transform 0.2s, box-shadow 0.2s;
            margin-bottom: 30px;
            box-shadow: 0 4px 15px rgba(102, 126, 234, 0.4);
        }
        
        .download-btn:hover {
            transform: translateY(-2px);
            box-shadow: 0 6px 20px rgba(102, 126, 234, 0.6);
        }
        
        .download-btn:active {
            transform: translateY(0);
        }
        
        .info-box {
            background: #f8f9fa;
            border-radius: 12px;
            padding: 20px;
            margin-top: 20px;
            text-align: left;
        }
        
        .info-box h3 {
            color: #333;
            margin-bottom: 15px;
            font-size: 16px;
        }
        
        .info-box ol {
            color: #666;
            padding-left: 20px;
            line-height: 1.8;
            font-size: 14px;
        }
        
        .info-box li {
            margin-bottom: 8px;
        }
        
        .warning {
            background: #fff3cd;
            border-left: 4px solid #ffc107;
            padding: 12px;
            margin-top: 15px;
            border-radius: 8px;
            font-size: 13px;
            color: #856404;
        }
        
        .version {
            color: #999;
            font-size: 12px;
            margin-top: 20px;
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="icon">📱</div>
        <h1>Download ${appName}</h1>
        <p class="subtitle">Android APK Installation</p>
        
        <a href="${apkUrl}" class="download-btn" download>
            Download APK
        </a>
        
        <div class="info-box">
            <h3>Installation Instructions:</h3>
            <ol>
                <li>Click "Download APK" and save the file to your Android device.</li>
                <li>Open your device's Settings app and navigate to Security or Privacy settings.</li>
                <li>Enable "Install from Unknown Sources" or "Install Unknown Apps" (the exact option name may vary by device).</li>
                <li>Locate the downloaded APK file using a file manager app.</li>
                <li>Tap on the APK file to begin the installation process.</li>
                <li>Follow the on-screen prompts to complete the installation.</li>
            </ol>
            
            <div class="warning">
                <strong>⚠️ Security Note:</strong> Installing APK files from unknown sources may pose security risks. Only download from trusted sources.
            </div>
        </div>
        
        <p class="version">Version ${appVersion}</p>
    </div>
</body>
</html>`;

  res.setHeader('Content-Type', 'text/html');
  return res.status(200).send(html);
});
