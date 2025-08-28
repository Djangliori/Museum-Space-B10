export default async function handler(req, res) {
  // CORS headers
  const origin = req.headers.origin;
  const allowedOrigins = ['https://betlemi10.com', 'https://www.betlemi10.com', 'http://localhost:3000'];
  if (allowedOrigins.includes(origin)) {
    res.setHeader('Access-Control-Allow-Origin', origin);
  }
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  res.setHeader('Access-Control-Allow-Credentials', 'true');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // Get order data from request body
    const orderData = req.body;
    
    console.log('🔄 UniPay Direct Test - Order Data:', JSON.stringify(orderData, null, 2));

    // Step 1: Get authentication token first
    const MERCHANT_ID = (process.env.UNIPAY_MERCHANT_ID || "5015191030581").trim();
    const API_KEY = process.env.UNIPAY_API_KEY ? process.env.UNIPAY_API_KEY.trim() : null;
    
    if (!API_KEY) {
      return res.status(500).json({
        success: false,
        error: 'API Key not configured in environment variables'
      });
    }

    console.log('🔐 Getting authentication token...');
    
    const authResponse = await fetch('https://apiv2.unipay.com/v3/auth', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ merchant_id: MERCHANT_ID, api_key: API_KEY })
    });

    const authResponseText = await authResponse.text();
    console.log('🔐 Auth Response Status:', authResponse.status);
    console.log('🔐 Auth Response Body:', authResponseText);

    if (!authResponse.ok) {
      return res.status(500).json({
        success: false,
        error: `Authentication failed: HTTP ${authResponse.status}`,
        auth_response: authResponseText
      });
    }

    let authData;
    try {
      authData = JSON.parse(authResponseText);
    } catch (e) {
      return res.status(500).json({
        success: false,
        error: 'Invalid JSON in auth response',
        auth_response: authResponseText
      });
    }

    if (!authData?.auth_token) {
      return res.status(500).json({
        success: false,
        error: 'No auth_token in response',
        auth_data: authData
      });
    }

    const token = authData.auth_token;
    console.log('✅ Token received, length:', token.length);

    // Step 2: Make order request with authentication token
    const response = await fetch('https://apiv2.unipay.com/v3/api/order/create', {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(orderData)
    });

    const responseText = await response.text();
    console.log('📤 UniPay Response Status:', response.status);
    console.log('📤 UniPay Response Body:', responseText);

    // Try to parse JSON, fallback to text if invalid
    let responseData;
    try {
      responseData = JSON.parse(responseText);
    } catch (e) {
      responseData = { raw_response: responseText };
    }

    // Return response with status info
    return res.status(200).json({
      success: response.ok,
      status: response.status,
      statusText: response.statusText,
      data: responseData,
      headers: Object.fromEntries(response.headers.entries()),
      auth_info: {
        token_received: !!token,
        token_length: token ? token.length : 0,
        auth_status: authResponse.status
      }
    });

  } catch (error) {
    console.error('❌ UniPay Direct Test Error:', error);
    return res.status(500).json({
      success: false,
      error: error.message,
      stack: error.stack
    });
  }
}