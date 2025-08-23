// SECURE VERSION - UniPay Callback Handler
// Security improvements applied:
// - Fixed CORS policy
// - Removed sensitive logging
// - Added input validation
// - Improved error handling

const allowedOrigins = [
  'https://museum-space-b10.vercel.app'
];

const setCorsHeaders = (req, res) => {
  const origin = req.headers.origin;
  
  if (allowedOrigins.includes(origin)) {
    res.setHeader('Access-Control-Allow-Origin', origin);
  }
  
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  res.setHeader('Access-Control-Allow-Credentials', 'false');
};

const logSecurely = (orderId, status, amount, currency) => {
  console.log('Payment callback processed:', {
    orderId,
    status,
    amount,
    currency,
    timestamp: new Date().toISOString()
  });
};

module.exports = async (req, res) => {
  setCorsHeaders(req, res);

  // Handle preflight requests
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  // Only allow POST requests
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  // Log request securely (no sensitive data)
  console.log('UniPay callback received:', {
    method: req.method,
    timestamp: new Date().toISOString(),
    ip: req.headers['x-forwarded-for'] || req.connection.remoteAddress
  });

  try {
    const {
      OrderHashID,
      MerchantOrderID,
      Status,
      PaymentStatus,
      Amount,
      Currency,
      PaymentMethod,
      TransactionID
      // Removed CardNumber, AuthCode, RRN - not needed and sensitive
    } = req.body;

    // Validate required fields
    if (!OrderHashID || !MerchantOrderID) {
      console.error('Missing required callback fields');
      return res.status(400).json({ error: 'Invalid callback data' });
    }

    // Validate data types and formats
    if (typeof OrderHashID !== 'string' || typeof MerchantOrderID !== 'string') {
      console.error('Invalid callback data types');
      return res.status(400).json({ error: 'Invalid data format' });
    }

    // Determine payment status
    const isSuccessful = Status === 'SUCCESS' || PaymentStatus === 'SUCCESS' || PaymentStatus === 'PAID';
    const isFailed = Status === 'FAILED' || PaymentStatus === 'FAILED';
    const isPending = Status === 'PENDING' || PaymentStatus === 'PENDING';

    // Log securely without sensitive data
    logSecurely(MerchantOrderID, Status || PaymentStatus, Amount, Currency);

    // Process payment status
    if (isSuccessful) {
      console.log(`✅ Payment SUCCESS for order ${MerchantOrderID}`);
      // TODO: Update database - mark order as paid
      // TODO: Send confirmation email
      // TODO: Activate museum ticket/access
      
    } else if (isFailed) {
      console.log(`❌ Payment FAILED for order ${MerchantOrderID}`);
      // TODO: Update database - mark order as failed
      // TODO: Send failure notification
      
    } else if (isPending) {
      console.log(`⏳ Payment PENDING for order ${MerchantOrderID}`);
      // TODO: Update database - mark order as pending
      
    } else {
      console.log(`❓ Payment UNKNOWN status for order ${MerchantOrderID}`);
    }

    // Always respond with 200 OK to acknowledge receipt
    return res.status(200).json({
      success: true,
      message: 'OK',
      orderId: MerchantOrderID,
      processed: true,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Callback processing error:', {
      message: error.message,
      timestamp: new Date().toISOString()
    });
    
    // Still return 200 to prevent UniPay from retrying
    return res.status(200).json({
      success: true,
      message: 'Callback acknowledged',
      error: 'Processing error but acknowledged',
      timestamp: new Date().toISOString()
    });
  }
};