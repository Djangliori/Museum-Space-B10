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

    // Make request to UniPay API from server-side (no CORS issues)
    const response = await fetch('https://apiv2.unipay.com/v3/api/order/create', {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json'
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
      headers: Object.fromEntries(response.headers.entries())
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