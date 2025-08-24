// Simple UniPay Order Creation (with debug)
module.exports = async (req, res) => {
  console.log('Simple API called:', {
    method: req.method,
    body: req.body
  });

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
    const { firstName, lastName, phone, amount = 10.0 } = req.body;

    // Basic validation
    if (!firstName || !lastName || !phone) {
      return res.status(400).json({
        error: 'Missing required fields',
        required: ['firstName', 'lastName', 'phone']
      });
    }

    // Get credentials
    const MERCHANT_ID = process.env.UNIPAY_MERCHANT_ID;
    const API_KEY = process.env.UNIPAY_API_KEY;
    
    if (!MERCHANT_ID || !API_KEY) {
      console.error('Missing UniPay credentials');
      return res.status(500).json({ 
        error: 'Payment configuration error',
        debug: 'Missing credentials'
      });
    }

    console.log('Attempting UniPay authentication...');

    // Step 1: Authenticate
    const authResponse = await fetch('https://apiv2.unipay.com/v3/auth', {
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

    console.log('Auth response status:', authResponse.status);

    if (!authResponse.ok) {
      const authError = await authResponse.text();
      console.error('Auth failed:', authError);
      return res.status(500).json({ 
        error: 'Authentication failed',
        details: authError,
        status: authResponse.status
      });
    }

    const authData = await authResponse.json();
    console.log('Auth successful, got token');

    if (!authData.auth_token) {
      console.error('No auth token received');
      return res.status(500).json({ 
        error: 'No authentication token received',
        authData: authData
      });
    }

    // Step 2: Create order
    const orderId = `MS-${Date.now()}-${Math.random().toString(36).substring(2, 9).toUpperCase()}`;
    
    const orderData = {
      MerchantUser: `${firstName}.${lastName}@museum-space.ge`,
      MerchantOrderID: orderId,
      OrderPrice: amount,
      OrderCurrency: "GEL",
      OrderName: "Museum Ticket",
      OrderDescription: `Museum Space Ticket - ${firstName} ${lastName}`,
      SuccessRedirectUrl: Buffer.from(`https://betlemi10.com/payment-success.html?order=${orderId}`).toString('base64'),
      CancelRedirectUrl: Buffer.from(`https://betlemi10.com/payment-cancel.html?order=${orderId}`).toString('base64'),
      CallBackUrl: Buffer.from(`https://betlemi10.com/api/unipay-callback`).toString('base64'),
      Language: "GE"
    };

    console.log('Creating order with data:', { ...orderData, MerchantUser: 'MASKED' });

    const orderResponse = await fetch('https://apiv2.unipay.com/v3/api/order/create', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${authData.auth_token}`,
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(orderData)
    });

    console.log('Order response status:', orderResponse.status);

    if (!orderResponse.ok) {
      const orderError = await orderResponse.text();
      console.error('Order creation failed:', orderError);
      return res.status(500).json({ 
        error: 'Order creation failed',
        details: orderError,
        status: orderResponse.status
      });
    }

    const orderResult = await orderResponse.json();
    console.log('Order created successfully');

    if (orderResult.errorcode && orderResult.errorcode !== 0) {
      console.error('UniPay error:', orderResult.message);
      return res.status(500).json({ 
        error: 'UniPay error',
        message: orderResult.message,
        errorcode: orderResult.errorcode
      });
    }

    const paymentUrl = orderResult.data?.Checkout;
    
    if (!paymentUrl) {
      console.error('No payment URL received');
      return res.status(500).json({ 
        error: 'No payment URL received',
        orderResult: orderResult
      });
    }

    console.log('Payment URL generated successfully');

    return res.status(200).json({
      success: true,
      orderId: orderId,
      paymentUrl: paymentUrl,
      unipayOrderId: orderResult.data?.UnipayOrderID,
      unipayOrderHashId: orderResult.data?.UnipayOrderHashID,
      amount: amount,
      currency: 'GEL',
      debug: 'Success!'
    });

  } catch (error) {
    console.error('Catch block error:', {
      message: error.message,
      stack: error.stack,
      name: error.name
    });

    return res.status(500).json({ 
      error: 'Unexpected error',
      message: error.message,
      stack: error.stack,
      type: error.name
    });
  }
};