// UniPay Callback Handler
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
  
  res.setHeader('Access-Control-Allow-Methods', 'POST, GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  res.setHeader('Access-Control-Allow-Credentials', 'true');

  // Handle preflight request
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  try {
    console.log('UniPay callback received:', {
      method: req.method,
      body: req.body,
      query: req.query,
      headers: req.headers
    });

    // Handle both POST and GET callbacks
    const callbackData = req.method === 'POST' ? req.body : req.query;

    const {
      order_id,
      status,
      transaction_id,
      amount,
      currency,
      signature
    } = callbackData;

    // Log the callback for debugging
    console.log('Payment callback data:', {
      order_id,
      status,
      transaction_id,
      amount,
      currency,
      timestamp: new Date().toISOString()
    });

    // Validate required fields
    if (!order_id || !status) {
      console.error('Missing required callback fields');
      return res.status(400).json({ error: 'Invalid callback data' });
    }

    // Handle different payment statuses
    switch (status.toLowerCase()) {
      case 'success':
      case 'completed':
      case 'paid':
        // Payment successful
        console.log(`Payment successful for order ${order_id}`);
        
        // TODO: Store successful payment in database
        // TODO: Send confirmation email to customer
        // TODO: Update booking status
        
        return res.status(200).json({ 
          success: true, 
          message: 'Payment processed successfully',
          order_id: order_id
        });

      case 'failed':
      case 'error':
      case 'declined':
        // Payment failed
        console.log(`Payment failed for order ${order_id}`);
        
        // TODO: Store failed payment attempt
        // TODO: Send failure notification if needed
        
        return res.status(200).json({ 
          success: false, 
          message: 'Payment failed',
          order_id: order_id
        });

      case 'pending':
      case 'processing':
        // Payment pending
        console.log(`Payment pending for order ${order_id}`);
        
        return res.status(200).json({ 
          success: true, 
          message: 'Payment is being processed',
          order_id: order_id
        });

      case 'cancelled':
      case 'canceled':
        // Payment cancelled
        console.log(`Payment cancelled for order ${order_id}`);
        
        return res.status(200).json({ 
          success: false, 
          message: 'Payment cancelled by user',
          order_id: order_id
        });

      default:
        console.log(`Unknown payment status: ${status} for order ${order_id}`);
        return res.status(200).json({ 
          success: false, 
          message: 'Unknown payment status',
          order_id: order_id
        });
    }

  } catch (error) {
    console.error('Callback processing error:', error);
    
    // Always return 200 to UniPay to avoid retries
    return res.status(200).json({ 
      error: 'Callback processing error',
      message: error.message 
    });
  }
}