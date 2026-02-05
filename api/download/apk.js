import withCors from '../../lib/withCors.js';

export default withCors(async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  // Get base URL for absolute paths
  const protocol = req.headers['x-forwarded-proto'] || 'https';
  const host = req.headers['x-forwarded-host'] || req.headers.host || 'your-domain.vercel.app';
  const baseUrl = `${protocol}://${host}`;
  
  // APK file path - update this to your actual APK file location
  const apkUrl = process.env.APK_DOWNLOAD_URL || '/download/app.apk';
  const appName = process.env.APP_NAME || '貸款應用程式';
  const appVersion = process.env.APP_VERSION || '1.0.0';
  const appDescription = process.env.APP_DESCRIPTION || '下載並安裝我們的 Android 應用程式';
  
  // Icon URL - using absolute URL for social media sharing
  // Vercel serves files from public folder as static assets
  const iconUrl = `${baseUrl}/192x192.png`;
  const pageUrl = `${baseUrl}${req.url}`;

  const html = `<!DOCTYPE html>
<html lang="zh-TW">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    
    <!-- Primary Meta Tags -->
    <title>下載 ${appName} APK</title>
    <meta name="title" content="下載 ${appName} APK">
    <meta name="description" content="${appDescription}。立即下載 Android APK 安裝檔，享受完整的應用程式功能。">
    <meta name="keywords" content="APK下載, Android應用程式, 貸款應用程式, 手機應用程式">
    <meta name="author" content="${appName}">
    <meta name="robots" content="index, follow">
    
    <!-- Open Graph / Facebook -->
    <meta property="og:type" content="website">
    <meta property="og:url" content="${pageUrl}">
    <meta property="og:title" content="下載 ${appName} APK">
    <meta property="og:description" content="${appDescription}。立即下載 Android APK 安裝檔，享受完整的應用程式功能。">
    <meta property="og:image" content="${iconUrl}">
    <meta property="og:image:width" content="192">
    <meta property="og:image:height" content="192">
    <meta property="og:image:alt" content="${appName} 應用程式圖示">
    <meta property="og:site_name" content="${appName}">
    <meta property="og:locale" content="zh_TW">
    
    <!-- Twitter -->
    <meta name="twitter:card" content="summary">
    <meta name="twitter:url" content="${pageUrl}">
    <meta name="twitter:title" content="下載 ${appName} APK">
    <meta name="twitter:description" content="${appDescription}。立即下載 Android APK 安裝檔。">
    <meta name="twitter:image" content="${iconUrl}">
    <meta name="twitter:image:alt" content="${appName} 應用程式圖示">
    
    <!-- Apple Touch Icon -->
    <link rel="apple-touch-icon" href="${iconUrl}">
    <link rel="icon" type="image/png" href="${iconUrl}">
    
    <!-- Canonical URL -->
    <link rel="canonical" href="${pageUrl}">
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
            width: 120px;
            height: 120px;
            margin: 0 auto 20px;
            border-radius: 25px;
            overflow: hidden;
            box-shadow: 0 4px 15px rgba(0, 0, 0, 0.2);
        }
        
        .icon img {
            width: 100%;
            height: 100%;
            object-fit: cover;
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
        <div class="icon">
            <img src="${iconUrl}" alt="${appName} 圖示" />
        </div>
        <h1>下載 ${appName}</h1>
        <p class="subtitle">Android APK 安裝</p>
        
        <a href="${apkUrl}" class="download-btn" download>
            下載 APK
        </a>
        
        <div class="info-box">
            <h3>安裝說明：</h3>
            <ol>
                <li>點擊「下載 APK」並將檔案儲存到您的 Android 裝置。</li>
                <li>開啟裝置的「設定」應用程式，前往「安全性」或「隱私權」設定。</li>
                <li>啟用「允許安裝未知來源的應用程式」或「安裝未知應用程式」（選項名稱可能因裝置而異）。</li>
                <li>使用檔案管理應用程式找到下載的 APK 檔案。</li>
                <li>點擊 APK 檔案開始安裝程序。</li>
                <li>按照螢幕上的提示完成安裝。</li>
            </ol>
            
            <div class="warning">
                <strong>⚠️ 安全提示：</strong> 從未知來源安裝 APK 檔案可能存在安全風險。請僅從可信來源下載。
            </div>
        </div>
        
        <p class="version">版本 ${appVersion}</p>
    </div>
</body>
</html>`;

  res.setHeader('Content-Type', 'text/html');
  return res.status(200).send(html);
});
