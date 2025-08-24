// Debug endpoint to compare credentials
module.exports = async (req, res) => {
    // CORS headers
    res.setHeader('Access-Control-Allow-Origin', 'https://betlemi10.com');
    res.setHeader('Access-Control-Allow-Methods', 'GET,POST');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    
    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }
    
    const merchantId = process.env.UNIPAY_MERCHANT_ID;
    const apiKey = process.env.UNIPAY_API_KEY;
    
    return res.json({
        timestamp: new Date().toISOString(),
        hasCredentials: {
            merchantId: !!merchantId,
            apiKey: !!apiKey
        },
        credentialLengths: {
            merchantId: merchantId?.length || 0,
            apiKey: apiKey?.length || 0
        },
        credentialPreviews: {
            merchantId: merchantId ? 
                merchantId.substring(0, 4) + '***' + merchantId.substring(merchantId.length - 4) : null,
            apiKey: apiKey ? 
                apiKey.substring(0, 8) + '***' + apiKey.substring(apiKey.length - 8) : null
        },
        fullCredentials: {
            merchantId: merchantId || 'NOT_SET',
            apiKey: apiKey || 'NOT_SET'
        }
    });
};