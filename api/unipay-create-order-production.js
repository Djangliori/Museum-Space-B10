// UniPay Order Creation API Endpoint
// Production version for betlemi10.com

export default async function handler(req, res) {
  // Set CORS headers for both betlemi10.com and www.betlemi10.com
  const origin = req.headers.origin;
  const allowedOrigins = [
    'https://betlemi10.com',
    'https://www.betlemi10.com',
    'http://localhost:3000',
    'http://localhost:5173'
  ];
  
  if (allowedOrigins.includes(origin)) {
    res.setHeader('Access-Control-Allow-Origin', origin);
  }
  
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  res.setHeader('Access-Control-Allow-Credentials', 'true');

  // Handle preflight request
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  // Only allow POST requests
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { amount, userDetails, ticketInfo } = req.body;

    // Input validation
    if (!amount || !userDetails || !ticketInfo) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    // Sanitize inputs
    const sanitizedAmount = parseFloat(amount);
    if (isNaN(sanitizedAmount) || sanitizedAmount <= 0 || sanitizedAmount > 1000) {
      return res.status(400).json({ error: 'Invalid amount' });
    }

    const sanitizedName = userDetails.name.replace(/[<>"']/g, '');
    const sanitizedEmail = userDetails.email.replace(/[<>"']/g, '');
    const sanitizedPhone = userDetails.phone.replace(/[<>"']/g, '');

    // Phone validation
    const phoneRegex = /^(\+995|995)?[0-9]{9}$/;
    if (!phoneRegex.test(sanitizedPhone)) {
      return res.status(400).json({ error: 'Invalid phone number format' });
    }

    // UniPay configuration
    const MERCHANT_ID = process.env.UNIPAY_MERCHANT_ID || "5015191030581";
    const API_KEY = process.env.UNIPAY_API_KEY;
    
    if (!API_KEY) {
      console.error('UniPay API key not configured');
      return res.status(500).json({ 
        error: 'API Key არ არის კონფიგურირებული. Vercel Dashboard-ში დაამატეთ UNIPAY_API_KEY environment variable.',
        debug: 'Environment variables needed: UNIPAY_API_KEY' 
      });
    }

    // Step 1: Get auth token
    const authResponse = await fetch('https://apiv2.unipay.com/v3/auth', {
      method: 'POST',
      headers: {
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
    if (!authData || !authData.token) {
      console.error('UniPay auth failed:', authData);
      return res.status(500).json({ error: 'Payment authentication failed' });
    }

    const token = authData.token;

    // Generate secure order ID
    const crypto = await import('crypto');
    const orderId = crypto.randomBytes(16).toString('hex');

    // Step 2: Create order
    const orderData = {
      merchant_id: MERCHANT_ID,
      amount: sanitizedAmount,
      currency: "GEL",
      order_id: orderId,
      description: `მუზეუმის ბილეთი - ${ticketInfo.name}`,
      callback_url: "https://betlemi10.com/api/unipay-callback-production",
      success_url: "https://betlemi10.com/payment-success.html",
      cancel_url: "https://betlemi10.com/payment-cancel.html",
      customer: {
        name: sanitizedName,
        email: sanitizedEmail,
        phone: sanitizedPhone
      }
    };

    const orderResponse = await fetch('https://apiv2.unipay.com/v3/api/order/create', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(orderData)
    });

    if (!orderResponse.ok) {
      console.error('Order creation failed:', orderResponse.status, orderResponse.statusText);
      const errorText = await orderResponse.text();
      console.error('Error response:', errorText);
      return res.status(500).json({ error: 'Order creation failed' });
    }

    const orderData_result = await orderResponse.json();
    if (orderData_result && orderData_result.payment_url) {
      // Success - return payment URL
      return res.status(200).json({
        success: true,
        payment_url: orderData_result.payment_url,
        order_id: orderId
      });
    } else {
      console.error('Order creation failed:', orderData_result);
      return res.status(500).json({ error: 'Order creation failed' });
    }

  } catch (error) {
    console.error('UniPay API error:', error.message);
    console.error('Full error:', error);
    
    if (error.message.includes('403')) {
      return res.status(500).json({ 
        error: 'Payment service permissions issue - contact support' 
      });
    }
    
    return res.status(500).json({ error: 'Payment processing error' });
  }
}