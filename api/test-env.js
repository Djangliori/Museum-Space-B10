export default async function handler(req, res) {
  const origin = req.headers.origin;
  const allowedOrigins = ['https://betlemi10.com', 'https://www.betlemi10.com', 'http://localhost:3000', 'http://localhost:5173'];
  if (allowedOrigins.includes(origin)) res.setHeader('Access-Control-Allow-Origin', origin);
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'GET') return res.status(405).json({ error: 'Method not allowed' });

  try {
    const merchantId = process.env.UNIPAY_MERCHANT_ID ? process.env.UNIPAY_MERCHANT_ID.trim() : null;
    const apiKey = process.env.UNIPAY_API_KEY ? process.env.UNIPAY_API_KEY.trim() : null;
    const envStatus = {
      timestamp: new Date().toISOString(),
      vercel_region: process.env.VERCEL_REGION || 'unknown',
      node_version: process.version,
      environment_variables: {
        UNIPAY_MERCHANT_ID: { configured: !!merchantId, value: merchantId ? `${merchantId.substring(0, 4)}***${merchantId.substring(merchantId.length - 4)}` : 'NOT_SET', length: merchantId ? merchantId.length : 0 },
        UNIPAY_API_KEY: { configured: !!apiKey, value: apiKey ? `${apiKey.substring(0, 8)}***${apiKey.substring(apiKey.length - 8)}` : 'NOT_SET', length: apiKey ? apiKey.length : 0 }
      },
      api_endpoints: { auth_url: 'https://apiv2.unipay.com/v3/auth', order_url: 'https://apiv2.unipay.com/v3/api/order/create' },
      status: (merchantId && apiKey) ? 'READY' : 'CONFIGURATION_MISSING'
    };

    let apiConnectivity = 'UNKNOWN';
    let realAuthTest = 'UNKNOWN';
    try {
      const testResponse = await fetch('https://apiv2.unipay.com/v3/auth', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({}) });
      apiConnectivity = testResponse.status === 400 ? 'REACHABLE' : `HTTP_${testResponse.status}`;
      
      // Test with real credentials
      const realAuthResponse = await fetch('https://apiv2.unipay.com/v3/auth', { 
        method: 'POST', 
        headers: { 'Content-Type': 'application/json' }, 
        body: JSON.stringify({ merchant_id: merchantId, api_key: apiKey }) 
      });
      if (realAuthResponse.ok) {
        const authData = await realAuthResponse.json();
        realAuthTest = authData.auth_token ? 'SUCCESS' : 'NO_TOKEN';
      } else {
        const errorText = await realAuthResponse.text();
        realAuthTest = `FAILED_${realAuthResponse.status}: ${errorText}`;
      }
    } catch (error) { 
      apiConnectivity = `ERROR: ${error.message}`;
      realAuthTest = `ERROR: ${error.message}`;
    }
    envStatus.api_connectivity = apiConnectivity;
    envStatus.real_auth_test = realAuthTest;
    return res.status(200).json(envStatus);

  } catch (error) {
    return res.status(500).json({ error: 'Environment test failed', timestamp: new Date().toISOString() });
  }
}