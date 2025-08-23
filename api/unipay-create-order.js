module.exports = async (req, res) => {
  // Only allow POST requests
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  // CORS configuration
  res.setHeader('Access-Control-Allow-Origin', 'https://museum-space-b10.vercel.app');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  const { firstName, lastName, phone, amount = 10.0, ticketType = 'ბილეთი' } = req.body;

  // Validation
  if (!firstName || !lastName || !phone) {
    return res.status(400).json({ 
      error: 'Missing required fields',
      details: 'სახელი, გვარი და ტელეფონი აუცილებელია' 
    });
  }

  try {
    // Get UniPay credentials from environment
    const MERCHANT_ID = process.env.UNIPAY_MERCHANT_ID;
    const API_KEY = process.env.UNIPAY_API_KEY;
    
    if (!MERCHANT_ID || !API_KEY) {
      console.error('Missing UniPay credentials');
      return res.status(500).json({ error: 'Payment system configuration error' });
    }

    console.log('Starting UniPay payment for:', { firstName, lastName, phone, amount });

    // Step 1: Authenticate with UniPay
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

    if (!authResponse.ok) {
      console.error('UniPay auth failed:', authResponse.status, authResponse.statusText);
      return res.status(500).json({ error: 'Payment authentication failed' });
    }

    const authData = await authResponse.json();
    console.log('Auth response:', authData);

    // Check for auth_token (NOT access_token!)
    const accessToken = authData.auth_token;
    
    if (!accessToken) {
      console.error('No auth_token in response:', authData);
      return res.status(500).json({ error: 'Authentication token not received' });
    }

    // Step 2: Generate unique order ID
    const timestamp = Date.now();
    const random = Math.random().toString(36).substring(2, 9).toUpperCase();
    const orderId = `MS-${timestamp}-${random}`;

    // Step 3: Prepare base URLs (need to be base64 encoded)
    const baseUrl = 'https://museum-space-b10.vercel.app';
    const successUrl = Buffer.from(`${baseUrl}/payment-success.html?order=${orderId}`).toString('base64');
    const cancelUrl = Buffer.from(`${baseUrl}/payment-cancel.html?order=${orderId}`).toString('base64');
    const callbackUrl = Buffer.from(`${baseUrl}/api/unipay-callback`).toString('base64');

    // Step 4: Create order data
    const orderData = {
      MerchantUser: `${firstName}.${lastName}@museum-space.ge`, // Generate email
      MerchantOrderID: orderId,
      OrderPrice: parseFloat(amount),
      OrderCurrency: "GEL",
      OrderName: ticketType,
      OrderDescription: `სამუზეუმო სივრცის ბილეთი - ${firstName} ${lastName}`,
      SuccessRedirectUrl: successUrl,
      CancelRedirectUrl: cancelUrl,
      CallBackUrl: callbackUrl,
      Language: "GE"
    };

    console.log('Creating order with data:', orderData);

    // Step 5: Create order
    const orderResponse = await fetch('https://apiv2.unipay.com/v3/api/order/create', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(orderData)
    });

    if (!orderResponse.ok) {
      console.error('UniPay order creation failed:', orderResponse.status, orderResponse.statusText);
      return res.status(500).json({ error: 'Order creation failed' });
    }

    const orderResult = await orderResponse.json();
    console.log('Order creation response:', orderResult);

    // Check for errors
    if (orderResult.errorcode && orderResult.errorcode !== 0) {
      console.error('UniPay order error:', orderResult);
      return res.status(400).json({ 
        error: 'Payment order failed',
        details: orderResult.message || 'Unknown error'
      });
    }

    // Extract payment URL
    const paymentUrl = orderResult.data?.Checkout;
    
    if (!paymentUrl) {
      console.error('No checkout URL in response:', orderResult);
      return res.status(500).json({ error: 'Payment URL not received' });
    }

    // Success response
    return res.status(200).json({
      success: true,
      orderId: orderId,
      paymentUrl: paymentUrl,
      unipayOrderId: orderResult.data?.UnipayOrderID,
      unipayOrderHashId: orderResult.data?.UnipayOrderHashID,
      amount: amount,
      currency: 'GEL'
    });

  } catch (error) {
    console.error('Payment creation error:', error);
    return res.status(500).json({ 
      error: 'Payment system error',
      details: error.message 
    });
  }
};