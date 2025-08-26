export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();

  try {
    const MERCHANT_ID = (process.env.UNIPAY_MERCHANT_ID || "5015191030581").trim();
    const API_KEY = process.env.UNIPAY_API_KEY ? process.env.UNIPAY_API_KEY.trim() : null;
    
    if (!API_KEY) {
      return res.status(500).json({ 
        error: 'API Key not configured',
        env_check: {
          MERCHANT_ID: !!MERCHANT_ID,
          API_KEY: !!API_KEY
        }
      });
    }

    console.log('Testing UniPay with merchant:', MERCHANT_ID);
    
    // Step 1: Test authentication
    const authResponse = await fetch('https://apiv2.unipay.com/v3/auth', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ merchant_id: MERCHANT_ID, api_key: API_KEY })
    });

    if (!authResponse.ok) {
      const errorText = await authResponse.text();
      console.log('Auth failed:', authResponse.status, errorText);
      return res.status(500).json({ 
        step: 'auth',
        error: 'Auth failed', 
        status: authResponse.status,
        response: errorText 
      });
    }

    const authData = await authResponse.json();
    console.log('Auth response:', authData);
    
    if (!authData.token) {
      return res.status(500).json({ 
        step: 'auth',
        error: 'No token in response', 
        response: authData 
      });
    }

    // Step 2: Test simple order creation
    const testOrderData = {
      MerchantUser: "test@betlemi10.com",
      MerchantOrderID: "TEST-" + Date.now(),
      OrderPrice: "1.00",
      OrderCurrency: "GEL",
      OrderName: "Test Order",
      OrderDescription: "Test",
      SuccessRedirectUrl: Buffer.from("https://betlemi10.com/payment-success.html").toString('base64'),
      CancelRedirectUrl: Buffer.from("https://betlemi10.com/payment-cancel.html").toString('base64'),
      CallBackUrl: Buffer.from("https://betlemi10.com/api/unipay-callback-production").toString('base64'),
      SubscriptionPlanID: "",
      Mlogo: "",
      InApp: 0,
      Language: "GE"
    };

    console.log('Testing order creation with:', JSON.stringify(testOrderData, null, 2));

    const orderResponse = await fetch('https://apiv2.unipay.com/v3/api/order/create', {
      method: 'POST',
      headers: { 
        'Authorization': `Bearer ${authData.token}`,
        'Accept': 'application/json',
        'Content-Type': 'application/json' 
      },
      body: JSON.stringify(testOrderData)
    });

    const orderResponseText = await orderResponse.text();
    console.log('Order response status:', orderResponse.status);
    console.log('Order response text:', orderResponseText);

    let orderResult;
    try {
      orderResult = JSON.parse(orderResponseText);
    } catch (e) {
      orderResult = { raw: orderResponseText };
    }

    return res.status(200).json({
      success: true,
      auth_success: true,
      token_length: authData.token.length,
      order_test: {
        status: orderResponse.status,
        success: orderResponse.ok,
        response: orderResult,
        raw_response: orderResponseText
      },
      test_data: testOrderData
    });

  } catch (error) {
    console.error('Test failed:', error);
    return res.status(500).json({ 
      error: 'Test failed', 
      message: error.message,
      stack: error.stack
    });
  }
}