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
    const { amount, userDetails, ticketInfo } = req.body;
    if (!amount || !userDetails || !ticketInfo) return res.status(400).json({ error: 'Missing required fields' });
    const sanitizedAmount = parseFloat(amount);
    if (isNaN(sanitizedAmount) || sanitizedAmount <= 0 || sanitizedAmount > 1000) return res.status(400).json({ error: 'Invalid amount' });
    const sanitizedName = userDetails.name.replace(/[<>"']/g, '');
    const sanitizedEmail = userDetails.email.replace(/[<>"']/g, '');
    const sanitizedPhone = userDetails.phone.replace(/[<>"']/g, '');
    const phoneRegex = /^(\+995|995)?[0-9]{9}$/;
    if (!phoneRegex.test(sanitizedPhone)) return res.status(400).json({ error: 'Invalid phone number format' });

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
      console.log('Auth failed - Status:', authResponse.status, 'Response:', errorText);
      return res.status(500).json({ error: 'Payment authentication failed', debug: errorText });
    }
    const authData = await authResponse.json();
    console.log('Auth success - Token length:', authData.token ? authData.token.length : 'no token');
    if (!authData?.token) return res.status(500).json({ error: 'Payment authentication failed' });
    const token = authData.token;

    // Generate order ID in format similar to docs example
    const timestamp = Date.now().toString().slice(-6);
    const random = Math.random().toString(36).substring(2, 8).toUpperCase();
    const orderId = `MS${timestamp}-${random}`;
    
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

    console.log('=== SENDING ORDER TO UNIPAY ===');
    console.log('Order Data:', JSON.stringify(orderData, null, 2));
    console.log('Token present:', !!token);
    console.log('================================');

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
      console.log('Order creation failed - Status:', orderResponse.status, 'Response:', errorText);
      return res.status(500).json({ error: 'Order creation failed', debug: errorText });
    }
    
    const result = await orderResponse.json();
    console.log('Order creation response:', JSON.stringify(result));
    
    // UniPay may return different field names for payment URL
    const paymentUrl = result?.payment_url || result?.PaymentUrl || result?.url || result?.redirectUrl;
    
    if (paymentUrl) {
      return res.status(200).json({ success: true, payment_url: paymentUrl, order_id: orderId });
    }
    
    return res.status(500).json({ error: 'Order created but no payment URL received', debug: result });

  } catch (error) {
    return res.status(500).json({ error: 'Payment processing error' });
  }
}