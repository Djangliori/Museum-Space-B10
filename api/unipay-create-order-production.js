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

    const MERCHANT_ID = process.env.UNIPAY_MERCHANT_ID || "5015191030581";
    const API_KEY = process.env.UNIPAY_API_KEY;
    if (!API_KEY) return res.status(500).json({ error: 'API Key not configured' });

    const authResponse = await fetch('https://apiv2.unipay.com/v3/auth', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ merchant_id: MERCHANT_ID, api_key: API_KEY })
    });
    if (!authResponse.ok) return res.status(500).json({ error: 'Payment authentication failed' });
    const authData = await authResponse.json();
    if (!authData?.token) return res.status(500).json({ error: 'Payment authentication failed' });
    const token = authData.token;

    const crypto = await import('crypto');
    const orderId = crypto.randomBytes(16).toString('hex');
    const orderData = {
      merchant_id: MERCHANT_ID, amount: sanitizedAmount, currency: "GEL", order_id: orderId,
      description: `მუზეუმის ბილეთი - ${ticketInfo.name}`,
      callback_url: "https://betlemi10.com/api/unipay-callback-production",
      success_url: "https://betlemi10.com/payment-success.html", cancel_url: "https://betlemi10.com/payment-cancel.html",
      customer: { name: sanitizedName, email: sanitizedEmail, phone: sanitizedPhone }
    };

    const orderResponse = await fetch('https://apiv2.unipay.com/v3/api/order/create', {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
      body: JSON.stringify(orderData)
    });
    if (!orderResponse.ok) return res.status(500).json({ error: 'Order creation failed' });
    const result = await orderResponse.json();
    if (result?.payment_url) return res.status(200).json({ success: true, payment_url: result.payment_url, order_id: orderId });
    return res.status(500).json({ error: 'Order creation failed' });

  } catch (error) {
    return res.status(500).json({ error: 'Payment processing error' });
  }
}