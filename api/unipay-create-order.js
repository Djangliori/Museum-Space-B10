// Helper function to encode URLs to base64
function encodeBase64(str) {
    return Buffer.from(str).toString('base64');
}

// Vercel Serverless Function to create UniPay order (following proper 2-step flow)
export default async function handler(req, res) {
    // Set CORS headers
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    // Handle preflight request
    if (req.method === 'OPTIONS') {
        res.status(200).end();
        return;
    }

    if (req.method !== 'POST') {
        res.status(405).json({ error: 'Method not allowed' });
        return;
    }

    try {
        const {
            merchantUser,
            merchantOrderID,
            orderPrice,
            orderCurrency,
            orderName,
            orderDescription,
            successRedirectUrl,
            cancelRedirectUrl,
            callBackUrl,
            language,
            inApp
        } = req.body;

        // UniPay credentials
        const MERCHANT_ID = '5015191030581';
        const API_KEY = 'bc6f5073-6d1c-4abe-8456-1bb814077f6e';

        // Step 1: Authentication
        console.log('Step 1: Authenticating with UniPay...');
        const authResponse = await fetch('https://apiv2.unipay.com/v3/auth', {
            method: 'POST',
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                merchant_id: MERCHANT_ID,
                api_key: API_KEY
            })
        });

        const authText = await authResponse.text();
        console.log('Auth response:', authText);

        if (!authResponse.ok) {
            throw new Error(`Authentication failed: ${authResponse.status} ${authText}`);
        }

        let authData;
        try {
            authData = JSON.parse(authText);
        } catch (parseError) {
            throw new Error(`Auth response parsing failed: ${authText}`);
        }

        // Get auth token (it's in 'auth_token' field, not 'access_token')
        const authToken = authData.auth_token;
        if (!authToken) {
            throw new Error('No auth_token received from UniPay');
        }

        console.log('✅ Authentication successful, token received');

        // Step 2: Create Order
        console.log('Step 2: Creating order...');
        
        // Encode URLs to base64 as required
        const encodedSuccessUrl = encodeBase64(successRedirectUrl);
        const encodedCancelUrl = encodeBase64(cancelRedirectUrl);
        const encodedCallbackUrl = encodeBase64(callBackUrl);

        const orderData = {
            MerchantUser: merchantUser,
            MerchantOrderID: merchantOrderID,
            OrderPrice: parseFloat(orderPrice),
            OrderCurrency: orderCurrency || "GEL",
            OrderName: orderName,
            OrderDescription: orderDescription,
            SuccessRedirectUrl: encodedSuccessUrl,
            CancelRedirectUrl: encodedCancelUrl,
            CallBackUrl: encodedCallbackUrl,
            Language: language || "GE",
            InApp: inApp || 0
        };

        console.log('Order data:', orderData);

        const orderResponse = await fetch('https://apiv2.unipay.com/v3/api/order/create', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${authToken}`,
                'Accept': 'application/json',
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(orderData)
        });

        const orderText = await orderResponse.text();
        console.log('Order response:', orderText);

        if (!orderResponse.ok) {
            throw new Error(`Order creation failed: ${orderResponse.status} ${orderText}`);
        }

        let orderResult;
        try {
            orderResult = JSON.parse(orderText);
        } catch (parseError) {
            throw new Error(`Order response parsing failed: ${orderText}`);
        }

        console.log('✅ Order created successfully:', orderResult);

        // Check for UniPay errors
        if (orderResult.errorcode && orderResult.errorcode !== 0) {
            throw new Error(`UniPay error: ${orderResult.message || 'Unknown error'}`);
        }

        // Return the checkout URL and order details
        res.status(200).json({
            success: true,
            checkoutUrl: orderResult.data?.Checkout,
            unipayOrderId: orderResult.data?.UnipayOrderID,
            unipayOrderHashId: orderResult.data?.UnipayOrderHashID,
            orderId: merchantOrderID
        });

    } catch (error) {
        console.error('UniPay integration error:', error);
        res.status(500).json({ 
            success: false,
            error: 'Failed to create order', 
            details: error.message 
        });
    }
}