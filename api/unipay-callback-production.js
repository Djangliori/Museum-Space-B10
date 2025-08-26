export default async function handler(req, res) {
  const origin = req.headers.origin;
  const allowedOrigins = ['https://betlemi10.com', 'https://www.betlemi10.com', 'http://localhost:3000', 'http://localhost:5173'];
  if (allowedOrigins.includes(origin)) res.setHeader('Access-Control-Allow-Origin', origin);
  res.setHeader('Access-Control-Allow-Methods', 'POST, GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  if (req.method === 'OPTIONS') return res.status(200).end();

  try {
    const callbackData = req.method === 'POST' ? req.body : req.query;
    const { order_id, status, transaction_id, amount, currency, signature } = callbackData;
    if (!order_id || !status) return res.status(400).json({ error: 'Invalid callback data' });

    switch (status.toLowerCase()) {
      case 'success':
      case 'completed':
      case 'paid':
        return res.status(200).json({ success: true, message: 'Payment processed successfully', order_id });

      case 'failed':
      case 'error':
      case 'declined':
        return res.status(200).json({ success: false, message: 'Payment failed', order_id });

      case 'pending':
      case 'processing':
        return res.status(200).json({ success: true, message: 'Payment is being processed', order_id });

      case 'cancelled':
      case 'canceled':
        return res.status(200).json({ success: false, message: 'Payment cancelled by user', order_id });

      default:
        return res.status(200).json({ success: false, message: 'Unknown payment status', order_id });
    }

  } catch (error) {
    return res.status(200).json({ error: 'Callback processing error' });
  }
}