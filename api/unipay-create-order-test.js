// TEST VERSION - Mock UniPay Integration (No real API calls)
// For testing UI flow without actual payment processing

module.exports = async (req, res) => {
  console.log('Test API called:', {
    method: req.method,
    headers: req.headers,
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
    const { firstName, lastName, phone, amount = 10.0, ticketType = 'ბილეთი' } = req.body;

    // Basic validation
    if (!firstName || !lastName || !phone) {
      return res.status(400).json({
        error: 'Validation failed',
        details: ['firstName, lastName, and phone are required']
      });
    }

    // Generate test order ID
    const orderId = `TEST-${Date.now()}-${Math.random().toString(36).substring(2, 9).toUpperCase()}`;

    console.log('Mock payment created:', {
      orderId,
      firstName,
      lastName,
      phone: phone.substring(0, 3) + '***', // Mask phone for security
      amount,
      timestamp: new Date().toISOString()
    });

    // Environment check for debugging
    const envStatus = {
      NODE_ENV: process.env.NODE_ENV || 'not set',
      hasUnipayMerchantId: !!process.env.UNIPAY_MERCHANT_ID,
      hasUnipayApiKey: !!process.env.UNIPAY_API_KEY,
      hasUnipaySecret: !!process.env.UNIPAY_SECRET
    };

    console.log('Environment status:', envStatus);

    // Mock successful response
    return res.status(200).json({
      success: true,
      orderId: orderId,
      paymentUrl: `https://pay.unipay.com/test-gateway?order=${orderId}`, // Mock URL
      unipayOrderId: `UNIPAY-${orderId}`,
      unipayOrderHashId: `HASH-${orderId}`,
      amount: amount,
      currency: 'GEL',
      test: true,
      message: 'This is a test payment - no real transaction',
      environment: envStatus
    });

  } catch (error) {
    console.error('Test API error:', {
      message: error.message,
      stack: error.stack,
      timestamp: new Date().toISOString()
    });

    return res.status(500).json({ 
      error: 'Test API error',
      details: error.message,
      test: true
    });
  }
};