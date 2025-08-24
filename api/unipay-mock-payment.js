// Mock UniPay Payment Flow - Works until real API permissions are fixed
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
    const { firstName, lastName, phone, amount = 10.0, ticketType = 'ბილეთი' } = req.body;

    // Basic validation
    if (!firstName || !lastName || !phone) {
      return res.status(400).json({
        error: 'Missing required fields',
        required: ['firstName', 'lastName', 'phone']
      });
    }

    // Generate order ID
    const orderId = `MOCK-${Date.now()}-${Math.random().toString(36).substring(2, 9).toUpperCase()}`;

    console.log('Mock payment initiated:', {
      orderId,
      firstName: firstName.substring(0, 2) + '***',
      lastName: lastName.substring(0, 2) + '***', 
      phone: phone.substring(0, 3) + '***',
      amount,
      ticketType,
      timestamp: new Date().toISOString()
    });

    // Simulate delay like real API
    await new Promise(resolve => setTimeout(resolve, 1000));

    // Create mock UniPay-like payment URL
    const mockPaymentUrl = `https://pay.unipay.com/checkout?` + new URLSearchParams({
      merchant_id: process.env.UNIPAY_MERCHANT_ID || '5015191030581',
      order_id: orderId,
      amount: amount,
      currency: 'GEL',
      description: `${ticketType} - ${firstName} ${lastName}`,
      success_url: `https://betlemi10.com/payment-success.html?order=${orderId}`,
      cancel_url: `https://betlemi10.com/payment-cancel.html?order=${orderId}`,
      callback_url: `https://betlemi10.com/api/unipay-callback`,
      language: 'GE'
    }).toString();

    return res.status(200).json({
      success: true,
      orderId: orderId,
      paymentUrl: mockPaymentUrl,
      unipayOrderId: `UNIPAY-${orderId}`,
      unipayOrderHashId: `HASH-${orderId}`,
      amount: amount,
      currency: 'GEL',
      mock: true,
      message: '🚧 Mock payment - UniPay API needs order creation permissions',
      note: 'Real API authentication works, but lacks order creation ability'
    });

  } catch (error) {
    console.error('Mock payment error:', error);
    return res.status(500).json({ 
      error: 'Mock payment error',
      message: error.message
    });
  }
};