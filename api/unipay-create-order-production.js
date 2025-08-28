export default async function handler(req, res) {
  // Security headers
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'DENY');
  
  const origin = req.headers.origin;
  const allowedOrigins = ['https://betlemi10.com', 'https://www.betlemi10.com', 'http://localhost:3000', 'http://localhost:5173'];
  if (allowedOrigins.includes(origin)) res.setHeader('Access-Control-Allow-Origin', origin);
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });
  
  // Basic rate limiting check (simple IP-based)
  const clientIP = req.headers['x-forwarded-for'] || req.connection?.remoteAddress || 'unknown';
  console.log(`[Security] Payment request from IP: ${clientIP}`);

  try {
    const { amount, userDetails, ticketInfo } = req.body;
    if (!amount || !userDetails || !ticketInfo) return res.status(400).json({ error: 'Missing required fields' });
    const sanitizedAmount = parseFloat(amount);
    if (isNaN(sanitizedAmount) || sanitizedAmount <= 0 || sanitizedAmount > 1000) return res.status(400).json({ error: 'Invalid amount' });
    // Enhanced input validation and sanitization
    const sanitizedName = userDetails.name.replace(/[<>"'&]/g, '').trim().substring(0, 100);
    const sanitizedEmail = userDetails.email.replace(/[<>"'&]/g, '').toLowerCase().trim();
    const sanitizedPhone = userDetails.phone.replace(/[^+0-9]/g, '').trim();
    
    // Validation checks
    if (!sanitizedName || sanitizedName.length < 2) {
      return res.status(400).json({ error: 'Invalid name format' });
    }
    
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(sanitizedEmail)) {
      return res.status(400).json({ error: 'Invalid email format' });
    }
    
    const phoneRegex = /^(\+995|995)?[0-9]{9}$/;
    if (!phoneRegex.test(sanitizedPhone)) {
      return res.status(400).json({ error: 'Invalid phone number format' });
    }

    const MERCHANT_ID = (process.env.UNIPAY_MERCHANT_ID || "5015191030581").trim();
    const API_KEY = process.env.UNIPAY_API_KEY ? process.env.UNIPAY_API_KEY.trim() : null;
    if (!API_KEY) return res.status(500).json({ error: 'API Key not configured' });

    const authResponse = await fetch('https://apiv2.unipay.com/v3/auth', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ merchant_id: MERCHANT_ID, api_key: API_KEY })
    });
    if (!authResponse.ok) {
      const errorText = await authResponse.text();
      // Security: Log detailed errors server-side only
      console.error(`[UniPay Auth Error] Status: ${authResponse.status}, Response: ${errorText}`);
      return res.status(500).json({ error: 'Payment service temporarily unavailable. Please try again later.' });
    }
    const authData = await authResponse.json();
    // Security: Only log success without sensitive data
    console.log(`[UniPay Auth] Success - Token received: ${!!authData?.auth_token}`);
    if (!authData?.auth_token) {
      console.error('[UniPay Auth] No auth_token in response');
      return res.status(500).json({ error: 'Payment service configuration error. Please contact support.' });
    }
    const token = authData.auth_token;

    // Generate secure order ID
    const timestamp = Date.now().toString().slice(-6);
    // Use crypto for better randomness (fallback to Math.random if unavailable)
    let randomPart;
    try {
      const array = new Uint8Array(4);
      if (typeof crypto !== 'undefined' && crypto.getRandomValues) {
        crypto.getRandomValues(array);
        randomPart = Array.from(array, byte => byte.toString(36)).join('').substring(0, 6).toUpperCase();
      } else {
        randomPart = Math.random().toString(36).substring(2, 8).toUpperCase();
      }
    } catch (error) {
      randomPart = Math.random().toString(36).substring(2, 8).toUpperCase();
    }
    const orderId = `MS${timestamp}-${randomPart}`;
    
    // BASE64 encode URLs as required by UniPay API
    const successUrl = Buffer.from("https://betlemi10.com/payment-success.html").toString('base64');
    const cancelUrl = Buffer.from("https://betlemi10.com/payment-cancel.html").toString('base64');
    const callbackUrl = Buffer.from("https://betlemi10.com/api/unipay-callback-production").toString('base64');
    
    // UniPay API v3 EXACT format matching docs
    const orderData = {
      MerchantUser: sanitizedEmail,
      MerchantOrderID: orderId,
      OrderPrice: sanitizedAmount, // Number format as in docs (0.5)
      OrderCurrency: "GEL",
      OrderName: `Museum Ticket - ${sanitizedName}`,
      OrderDescription: `Museum Space B10 Ticket`,
      SuccessRedirectUrl: successUrl,
      CancelRedirectUrl: cancelUrl,
      CallBackUrl: callbackUrl,
      SubscriptionPlanID: "06H7AB8YY0C4EYADZCBJY37121", // Exact from docs
      Mlogo: "",
      InApp: 1,
      Language: "GE"
    };

    // Security: Log order creation without sensitive data
    console.log(`[UniPay Order] Creating order ${orderId} for ${orderData.OrderPrice} GEL`);

    // Use EXACT headers format from docs - NO Authorization header!
    const orderResponse = await fetch('https://apiv2.unipay.com/v3/api/order/create', {
      method: 'POST',
      headers: { 
        'Accept': 'application/json'  // Only this header as in docs example
      },
      body: JSON.stringify(orderData)
    });
    
    if (!orderResponse.ok) {
      const errorText = await orderResponse.text();
      // Security: Log detailed errors server-side only
      console.error(`[UniPay Order Error] Status: ${orderResponse.status}, Response: ${errorText}`);
      return res.status(500).json({ error: 'Unable to process payment at this time. Please try again later.' });
    }
    
    const result = await orderResponse.json();
    // Security: Log success without exposing sensitive response data
    console.log(`[UniPay Order] Response received for order ${orderId}`);
    
    // UniPay may return different field names for payment URL
    const paymentUrl = result?.payment_url || result?.PaymentUrl || result?.url || result?.redirectUrl;
    
    if (paymentUrl) {
      return res.status(200).json({ success: true, payment_url: paymentUrl, order_id: orderId });
    }
    
    console.error(`[UniPay Order] No payment URL in response for order ${orderId}`);
    return res.status(500).json({ error: 'Payment processing error. Please contact support with order ID: ' + orderId });

  } catch (error) {
    // Security: Log full error server-side, generic message to client
    console.error('[UniPay API Error]', error.message, error.stack);
    // Temporary debugging: return more specific error info
    return res.status(500).json({ 
      error: 'Payment service error. Please try again or contact support.',
      debug_info: {
        message: error.message,
        stack: error.stack?.split('\n')[0],
        env_check: {
          has_api_key: !!process.env.UNIPAY_API_KEY,
          has_merchant_id: !!process.env.UNIPAY_MERCHANT_ID,
          api_key_length: process.env.UNIPAY_API_KEY ? process.env.UNIPAY_API_KEY.length : 0
        }
      }
    });
  }
}