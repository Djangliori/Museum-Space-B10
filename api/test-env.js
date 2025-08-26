// Environment Variables Test Endpoint
// Tests if Vercel environment variables are properly configured

export default async function handler(req, res) {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  // Handle preflight request
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  // Only allow GET requests
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // Test environment variables
    const merchantId = process.env.UNIPAY_MERCHANT_ID;
    const apiKey = process.env.UNIPAY_API_KEY;

    const envStatus = {
      timestamp: new Date().toISOString(),
      vercel_region: process.env.VERCEL_REGION || 'unknown',
      node_version: process.version,
      environment_variables: {
        UNIPAY_MERCHANT_ID: {
          configured: !!merchantId,
          value: merchantId ? `${merchantId.substring(0, 4)}***${merchantId.substring(merchantId.length - 4)}` : 'NOT_SET',
          length: merchantId ? merchantId.length : 0
        },
        UNIPAY_API_KEY: {
          configured: !!apiKey,
          value: apiKey ? `${apiKey.substring(0, 8)}***${apiKey.substring(apiKey.length - 8)}` : 'NOT_SET',
          length: apiKey ? apiKey.length : 0
        }
      },
      api_endpoints: {
        auth_url: 'https://apiv2.unipay.com/v3/auth',
        order_url: 'https://apiv2.unipay.com/v3/api/order/create'
      },
      status: (merchantId && apiKey) ? 'READY' : 'CONFIGURATION_MISSING'
    };

    // Basic API connectivity test (without credentials)
    let apiConnectivity = 'UNKNOWN';
    try {
      // This is just a connectivity test - we don't send credentials
      const testResponse = await fetch('https://apiv2.unipay.com/v3/auth', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({})
      });
      
      apiConnectivity = testResponse.status === 400 ? 'REACHABLE' : `HTTP_${testResponse.status}`;
    } catch (error) {
      apiConnectivity = `ERROR: ${error.message}`;
    }

    envStatus.api_connectivity = apiConnectivity;

    return res.status(200).json(envStatus);

  } catch (error) {
    console.error('Environment test error:', error);
    
    return res.status(500).json({ 
      error: 'Environment test failed',
      message: error.message,
      timestamp: new Date().toISOString()
    });
  }
}