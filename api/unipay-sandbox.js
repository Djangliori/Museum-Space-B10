// UniPay Sandbox Test - Check if credentials work in test mode
module.exports = async (req, res) => {
  // CORS headers
  const allowedOrigins = [
    'https://betlemi10.com',
    'https://www.betlemi10.com',
    'https://museum-space-b10.vercel.app'
  ];
  
  const origin = req.headers.origin;
  if (allowedOrigins.includes(origin)) {
    res.setHeader('Access-Control-Allow-Origin', origin);
  }
  
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const MERCHANT_ID = process.env.UNIPAY_MERCHANT_ID;
    const API_KEY = process.env.UNIPAY_API_KEY;
    
    if (!MERCHANT_ID || !API_KEY) {
      return res.status(500).json({ 
        error: 'Missing credentials'
      });
    }

    console.log('Testing UniPay sandbox authentication...');
    console.log('Merchant ID:', MERCHANT_ID.substring(0, 4) + '***');

    // Try different API endpoints
    const endpoints = [
      'https://apiv2.unipay.com/v3/auth',           // Production
      'https://sandbox-apiv2.unipay.com/v3/auth',  // Sandbox (if exists)
      'https://test.unipay.com/v3/auth'             // Test (if exists)
    ];

    const results = [];

    for (const endpoint of endpoints) {
      try {
        console.log(`Testing endpoint: ${endpoint}`);
        
        const authResponse = await fetch(endpoint, {
          method: 'POST',
          headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            merchant_id: MERCHANT_ID,
            api_key: API_KEY
          })
        });

        const responseText = await authResponse.text();
        let responseData;
        try {
          responseData = JSON.parse(responseText);
        } catch {
          responseData = responseText;
        }

        results.push({
          endpoint,
          status: authResponse.status,
          statusText: authResponse.statusText,
          response: responseData,
          success: authResponse.ok && (typeof responseData === 'object' && responseData.auth_token)
        });

        console.log(`${endpoint} result:`, {
          status: authResponse.status,
          hasToken: !!(responseData.auth_token),
          error: responseData.message || responseData.error
        });

      } catch (error) {
        results.push({
          endpoint,
          error: error.message,
          success: false
        });
        console.log(`${endpoint} failed:`, error.message);
      }
    }

    return res.status(200).json({
      success: true,
      message: 'Endpoint testing complete',
      merchantId: MERCHANT_ID.substring(0, 4) + '***',
      results,
      recommendation: results.find(r => r.success) ? 
        `Use: ${results.find(r => r.success).endpoint}` : 
        'None of the endpoints worked - check credentials or contact UniPay support'
    });

  } catch (error) {
    console.error('Sandbox test error:', error);
    return res.status(500).json({ 
      error: 'Test failed',
      message: error.message
    });
  }
};