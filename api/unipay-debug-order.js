export default async function handler(req, res) {
  const origin = req.headers.origin;
  const allowedOrigins = ['https://betlemi10.com', 'https://www.betlemi10.com', 'http://localhost:3000', 'http://localhost:5173'];
  if (allowedOrigins.includes(origin)) res.setHeader('Access-Control-Allow-Origin', origin);
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  try {
    const MERCHANT_ID = (process.env.UNIPAY_MERCHANT_ID || "5015191030581").trim();
    const API_KEY = process.env.UNIPAY_API_KEY ? process.env.UNIPAY_API_KEY.trim() : null;
    
    console.log('=== UNIPAY DEBUG ORDER CREATION ===');
    console.log('Merchant ID:', MERCHANT_ID);
    console.log('API Key configured:', !!API_KEY);

    if (!API_KEY) return res.status(500).json({ error: 'API Key not configured' });

    // Step 1: Get auth token
    const authResponse = await fetch('https://apiv2.unipay.com/v3/auth', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ merchant_id: MERCHANT_ID, api_key: API_KEY })
    });
    
    if (!authResponse.ok) {
      const errorText = await authResponse.text();
      console.log('Auth failed:', authResponse.status, errorText);
      return res.status(500).json({ error: 'Auth failed', debug: errorText });
    }
    
    const authData = await authResponse.json();
    const token = authData.token;
    
    if (!token) {
      return res.status(500).json({ error: 'No token received', debug: authData });
    }

    console.log('Auth successful, token length:', token.length);

    // Step 2: Test different order formats
    const testCases = [
      {
        name: "With SubscriptionPlanID",
        data: {
          MerchantUser: "test@betlemi10.com",
          MerchantOrderID: "TEST-" + Date.now(),
          OrderPrice: 25,
          OrderCurrency: "GEL",
          OrderName: "Test Order",
          OrderDescription: "Test Description",
          SuccessRedirectUrl: Buffer.from("https://betlemi10.com/payment-success.html").toString('base64'),
          CancelRedirectUrl: Buffer.from("https://betlemi10.com/payment-cancel.html").toString('base64'),
          CallBackUrl: Buffer.from("https://betlemi10.com/api/unipay-callback-production").toString('base64'),
          SubscriptionPlanID: "06H7AB8YY0C4EYADZCBJY37121",
          Mlogo: "",
          InApp: 1,
          Language: "GE"
        }
      },
      {
        name: "Without SubscriptionPlanID",
        data: {
          MerchantUser: "test@betlemi10.com",
          MerchantOrderID: "TEST-" + Date.now(),
          OrderPrice: 25,
          OrderCurrency: "GEL",
          OrderName: "Test Order",
          OrderDescription: "Test Description",
          SuccessRedirectUrl: Buffer.from("https://betlemi10.com/payment-success.html").toString('base64'),
          CancelRedirectUrl: Buffer.from("https://betlemi10.com/payment-cancel.html").toString('base64'),
          CallBackUrl: Buffer.from("https://betlemi10.com/api/unipay-callback-production").toString('base64'),
          Mlogo: "",
          InApp: 1,
          Language: "GE"
        }
      },
      {
        name: "With InApp=0",
        data: {
          MerchantUser: "test@betlemi10.com",
          MerchantOrderID: "TEST-" + Date.now(),
          OrderPrice: 25,
          OrderCurrency: "GEL",
          OrderName: "Test Order",
          OrderDescription: "Test Description",
          SuccessRedirectUrl: Buffer.from("https://betlemi10.com/payment-success.html").toString('base64'),
          CancelRedirectUrl: Buffer.from("https://betlemi10.com/payment-cancel.html").toString('base64'),
          CallBackUrl: Buffer.from("https://betlemi10.com/api/unipay-callback-production").toString('base64'),
          SubscriptionPlanID: "",
          Mlogo: "",
          InApp: 0,
          Language: "GE"
        }
      }
    ];

    const results = [];

    for (const testCase of testCases) {
      console.log(`\n--- Testing: ${testCase.name} ---`);
      console.log('Request data:', JSON.stringify(testCase.data, null, 2));

      try {
        const orderResponse = await fetch('https://apiv2.unipay.com/v3/api/order/create', {
          method: 'POST',
          headers: { 
            'Authorization': `Bearer ${token}`, 
            'Accept': 'application/json',
            'Content-Type': 'application/json' 
          },
          body: JSON.stringify(testCase.data)
        });

        const responseText = await orderResponse.text();
        console.log('Response status:', orderResponse.status);
        console.log('Response body:', responseText);

        let responseJson;
        try {
          responseJson = JSON.parse(responseText);
        } catch (e) {
          responseJson = { raw: responseText };
        }

        results.push({
          testCase: testCase.name,
          status: orderResponse.status,
          success: orderResponse.ok,
          response: responseJson,
          rawResponse: responseText
        });

        if (orderResponse.ok) {
          console.log('✅ SUCCESS for:', testCase.name);
          break; // If one works, stop testing
        }

      } catch (error) {
        console.log('❌ ERROR for', testCase.name, ':', error.message);
        results.push({
          testCase: testCase.name,
          error: error.message
        });
      }
    }

    return res.status(200).json({
      timestamp: new Date().toISOString(),
      merchant_id: MERCHANT_ID,
      auth_successful: true,
      test_results: results
    });

  } catch (error) {
    console.log('Overall error:', error);
    return res.status(500).json({ error: 'Debug test failed', message: error.message });
  }
}