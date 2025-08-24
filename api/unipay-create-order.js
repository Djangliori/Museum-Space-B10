// SECURE VERSION - UniPay Order Creation
// Security improvements applied:
// - Proper input validation and sanitization
// - Removed sensitive logging
// - Better error handling
// - Rate limiting ready

// Try to load validator, fallback to basic validation if not available
let validator;
try {
  validator = require('validator');
} catch (e) {
  validator = {
    escape: (str) => str.replace(/[&<>"']/g, (match) => {
      const escapes = { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#x27;' };
      return escapes[match];
    })
  };
}

const CONSTANTS = {
  UNIPAY_AUTH_URL: 'https://apiv2.unipay.com/v3/auth',
  UNIPAY_ORDER_URL: 'https://apiv2.unipay.com/v3/api/order/create',
  BASE_URL: 'https://betlemi10.com',
  MAX_AMOUNT: 1000,
  MIN_AMOUNT: 1,
  ORDER_PREFIX: 'MS'
};

const sanitizeInput = {
  name: (input) => {
    if (!input || typeof input !== 'string') return null;
    const cleaned = validator.escape(input.trim());
    return cleaned.length >= 2 && cleaned.length <= 50 ? cleaned : null;
  },
  
  phone: (input) => {
    if (!input || typeof input !== 'string') return null;
    const cleaned = input.replace(/[^\d+]/g, '');
    const phoneRegex = /^(\+995|995)?[0-9]{9}$/;
    return phoneRegex.test(cleaned) ? cleaned : null;
  },
  
  amount: (input) => {
    const num = parseFloat(input);
    if (isNaN(num) || num < CONSTANTS.MIN_AMOUNT || num > CONSTANTS.MAX_AMOUNT) return null;
    return Math.round(num * 100) / 100;
  }
};

const validateInput = ({ firstName, lastName, phone, amount }) => {
  const errors = [];
  
  if (!sanitizeInput.name(firstName)) errors.push('Invalid first name');
  if (!sanitizeInput.name(lastName)) errors.push('Invalid last name');
  if (!sanitizeInput.phone(phone)) errors.push('Invalid phone number');
  if (amount && !sanitizeInput.amount(amount)) errors.push('Invalid amount');
  
  return errors.length > 0 ? { error: 'Validation failed', details: errors } : null;
};

const generateOrderId = () => {
  const timestamp = Date.now();
  const random = Math.random().toString(36).substring(2, 9).toUpperCase();
  return `${CONSTANTS.ORDER_PREFIX}-${timestamp}-${random}`;
};

const authenticateWithUnipay = async (merchantId, apiKey) => {
  const authResponse = await fetch(CONSTANTS.UNIPAY_AUTH_URL, {
    method: 'POST',
    headers: {
      'Accept': 'application/json',
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      merchant_id: merchantId,
      api_key: apiKey
    })
  });

  if (!authResponse.ok) {
    throw new Error(`Authentication failed: ${authResponse.status}`);
  }

  const authData = await authResponse.json();
  
  if (!authData.auth_token) {
    throw new Error('Authentication token not received');
  }

  return authData.auth_token;
};

const createUnipayOrder = async (orderData, accessToken) => {
  const orderResponse = await fetch(CONSTANTS.UNIPAY_ORDER_URL, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${accessToken}`,
      'Accept': 'application/json',
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(orderData)
  });

  if (!orderResponse.ok) {
    throw new Error(`Order creation failed: ${orderResponse.status}`);
  }

  const orderResult = await orderResponse.json();

  if (orderResult.errorcode && orderResult.errorcode !== 0) {
    throw new Error(orderResult.message || 'Unknown UniPay error');
  }

  return orderResult;
};

module.exports = async (req, res) => {
  // Only allow POST requests
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  // CORS configuration - betlemi10.com only
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

  const { firstName, lastName, phone, amount = 10.0, ticketType = 'ბილეთი' } = req.body;

  // Input validation
  const validationError = validateInput({ firstName, lastName, phone, amount });
  if (validationError) {
    return res.status(400).json(validationError);
  }

  // Sanitize inputs
  const cleanFirstName = sanitizeInput.name(firstName);
  const cleanLastName = sanitizeInput.name(lastName);
  const cleanPhone = sanitizeInput.phone(phone);
  const cleanAmount = sanitizeInput.amount(amount);

  if (!cleanFirstName || !cleanLastName || !cleanPhone || !cleanAmount) {
    return res.status(400).json({
      error: 'Invalid input data',
      details: 'One or more fields contain invalid characters'
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

    const orderId = generateOrderId();

    // Log securely (no personal data)
    console.log('Payment initiated:', {
      orderId,
      amount: cleanAmount,
      timestamp: new Date().toISOString()
    });

    // Step 1: Authenticate with UniPay
    const accessToken = await authenticateWithUnipay(MERCHANT_ID, API_KEY);

    // Step 2: Prepare URLs (base64 encoded)
    const successUrl = Buffer.from(`${CONSTANTS.BASE_URL}/payment-success.html?order=${orderId}`).toString('base64');
    const cancelUrl = Buffer.from(`${CONSTANTS.BASE_URL}/payment-cancel.html?order=${orderId}`).toString('base64');
    const callbackUrl = Buffer.from(`${CONSTANTS.BASE_URL}/api/unipay-callback`).toString('base64');

    // Step 3: Create order data
    const orderData = {
      MerchantUser: `${cleanFirstName}.${cleanLastName}@museum-space.ge`,
      MerchantOrderID: orderId,
      OrderPrice: cleanAmount,
      OrderCurrency: "GEL",
      OrderName: ticketType,
      OrderDescription: `სამუზეუმო სივრცის ბილეთი - ${cleanFirstName} ${cleanLastName}`,
      SuccessRedirectUrl: successUrl,
      CancelRedirectUrl: cancelUrl,
      CallBackUrl: callbackUrl,
      Language: "GE"
    };

    // Step 4: Create order
    const orderResult = await createUnipayOrder(orderData, accessToken);

    // Extract payment URL
    const paymentUrl = orderResult.data?.Checkout;
    
    if (!paymentUrl) {
      throw new Error('Payment URL not received from UniPay');
    }

    // Success response
    return res.status(200).json({
      success: true,
      orderId: orderId,
      paymentUrl: paymentUrl,
      unipayOrderId: orderResult.data?.UnipayOrderID,
      unipayOrderHashId: orderResult.data?.UnipayOrderHashID,
      amount: cleanAmount,
      currency: 'GEL'
    });

  } catch (error) {
    console.error('Payment creation error:', {
      message: error.message,
      orderId: orderId || 'unknown',
      timestamp: new Date().toISOString()
    });

    // Don't expose internal error details to client, but log them
    console.error('Detailed error info:', {
      stack: error.stack,
      envCheck: {
        hasValidator: !!validator,
        hasMerchantId: !!process.env.UNIPAY_MERCHANT_ID,
        hasApiKey: !!process.env.UNIPAY_API_KEY
      }
    });
    
    return res.status(500).json({ 
      error: 'Payment system error',
      details: 'Unable to process payment request',
      debug: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};