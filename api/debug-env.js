// Super simple endpoint to debug environment variables
module.exports = (req, res) => {
  try {
    const envCheck = {
      NODE_ENV: process.env.NODE_ENV || 'not set',
      hasUnipayMerchantId: !!process.env.UNIPAY_MERCHANT_ID,
      hasUnipayApiKey: !!process.env.UNIPAY_API_KEY,
      hasUnipaySecret: !!process.env.UNIPAY_SECRET,
      timestamp: new Date().toISOString(),
      method: req.method,
      url: req.url
    };

    console.log('Environment check:', envCheck);

    res.json({
      success: true,
      environment: envCheck,
      message: 'Environment check successful'
    });
  } catch (error) {
    console.error('Debug endpoint error:', error);
    res.status(500).json({
      error: error.message,
      stack: error.stack
    });
  }
};