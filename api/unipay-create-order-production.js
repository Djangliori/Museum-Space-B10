// Production UniPay Integration - Based on working AI Academia configuration
const axios = require('axios');

// UniPay API endpoints
const UNIPAY_AUTH_URL = 'https://apiv2.unipay.com/v3/auth';
const UNIPAY_ORDER_URL = 'https://apiv2.unipay.com/v3/api/order/create';

// Helper function to encode URLs to base64
function encodeBase64(str) {
    return Buffer.from(str).toString('base64');
}

// Generate unique order ID
function generateOrderId() {
    const timestamp = Date.now();
    const random = Math.random().toString(36).substring(2, 9).toUpperCase();
    return `MS-${timestamp}-${random}`;
}

module.exports = async (req, res) => {
    // CORS headers - production domains only
    const allowedOrigins = [
        'https://betlemi10.com',
        'https://www.betlemi10.com',
        'https://museum-space-b10.vercel.app'
    ];
    
    const origin = req.headers.origin;
    
    if (allowedOrigins.includes(origin)) {
        res.setHeader('Access-Control-Allow-Origin', origin);
    } else {
        res.setHeader('Access-Control-Allow-Origin', 'https://betlemi10.com');
    }
    
    res.setHeader('Access-Control-Allow-Credentials', true);
    res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
    res.setHeader('Access-Control-Allow-Headers', 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version');
    
    if (req.method === 'OPTIONS') {
        res.status(200).end();
        return;
    }
    
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }
    
    try {
        const { firstName, lastName, phone, amount, ticketType } = req.body;
        
        // Validate and sanitize input
        if (!firstName || !lastName || !phone || !amount) {
            return res.status(400).json({ error: 'Missing required fields' });
        }
        
        // Amount validation (prevent negative or excessive amounts)
        const parsedAmount = parseFloat(amount);
        if (isNaN(parsedAmount) || parsedAmount <= 0 || parsedAmount > 1000) {
            return res.status(400).json({ error: 'Invalid amount' });
        }
        
        // Sanitize strings to prevent XSS
        const sanitizedFirstName = firstName.replace(/[<>\"']/g, '');
        const sanitizedLastName = lastName.replace(/[<>\"']/g, '');
        const sanitizedPhone = phone.replace(/[<>\"']/g, '');
        const sanitizedTicketType = (ticketType || 'Museum Ticket').replace(/[<>\"']/g, '');
        
        // Get credentials from environment variables only
        const merchantId = process.env.UNIPAY_MERCHANT_ID;
        const apiKey = process.env.UNIPAY_API_KEY;
        
        if (!merchantId || !apiKey) {
            console.error('Missing UniPay credentials');
            return res.status(500).json({ error: 'Payment system not configured properly' });
        }
        
        console.log('Starting UniPay payment process...');
        console.log('Order details:', {
            firstName: sanitizedFirstName.substring(0, 2) + '***',
            lastName: sanitizedLastName.substring(0, 2) + '***',
            amount: parsedAmount,
            ticketType: sanitizedTicketType
        });
        
        // Step 1: Authenticate with UniPay
        let authResponse;
        try {
            authResponse = await axios.post(UNIPAY_AUTH_URL, {
                merchant_id: merchantId,
                api_key: apiKey
            }, {
                headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/json'
                }
            });
            
            console.log('UniPay authentication successful');
        } catch (authError) {
            console.error('Authentication error:', authError.response?.data || authError.message);
            throw new Error(`UniPay authentication failed: ${authError.response?.data?.message || authError.message}`);
        }
        
        // Check for auth token
        const accessToken = authResponse.data?.auth_token || 
                           authResponse.data?.access_token || 
                           authResponse.data?.accessToken || 
                           authResponse.data?.token;
                           
        if (!accessToken) {
            console.error('No access token received');
            throw new Error('Failed to authenticate with UniPay - no access token received');
        }
        
        // Step 2: Create order
        const orderId = generateOrderId();
        
        // URLs for redirect - using betlemi10.com as base
        const baseUrl = 'https://betlemi10.com';
        const successUrl = encodeBase64(`${baseUrl}/payment-success.html?order=${orderId}`);
        const cancelUrl = encodeBase64(`${baseUrl}/payment-cancel.html?order=${orderId}`);
        const callbackUrl = encodeBase64(`${baseUrl}/api/unipay-callback`);
        
        const orderData = {
            MerchantUser: `${sanitizedFirstName}.${sanitizedLastName}@museum-space.ge`,
            MerchantOrderID: orderId,
            OrderPrice: parsedAmount,
            OrderCurrency: "GEL",
            OrderName: sanitizedTicketType,
            OrderDescription: `${sanitizedTicketType} - ${sanitizedFirstName} ${sanitizedLastName} - ${sanitizedPhone}`,
            SuccessRedirectUrl: successUrl,
            CancelRedirectUrl: cancelUrl,
            CallBackUrl: callbackUrl
            // Removed Language and InApp as they might cause permission issues
        };
        
        console.log('Creating UniPay order:', {
            orderId,
            amount: parsedAmount,
            currency: 'GEL'
        });
        
        let orderResponse;
        try {
            orderResponse = await axios.post(UNIPAY_ORDER_URL, orderData, {
                headers: {
                    'Authorization': `Bearer ${accessToken}`,
                    'Accept': 'application/json',
                    'Content-Type': 'application/json'
                },
                validateStatus: function (status) {
                    return status < 500; // Don't throw for 4xx errors so we can see the response
                }
            });
            
            console.log('Order creation response status:', orderResponse.status);
        } catch (orderError) {
            console.error('Order creation error:', orderError.response?.data || orderError.message);
            throw new Error(`Failed to create order: ${orderError.response?.data?.message || orderError.message}`);
        }
        
        if (orderResponse.status !== 200 && orderResponse.status !== 201) {
            console.error('Order creation failed:', orderResponse.data);
            throw new Error(`Order creation failed with status ${orderResponse.status}: ${JSON.stringify(orderResponse.data)}`);
        }
        
        if (!orderResponse.data) {
            throw new Error('Failed to create payment order - no data returned');
        }
        
        // Check for error in response
        if (orderResponse.data.errorcode && orderResponse.data.errorcode !== 0) {
            console.error('UniPay error:', orderResponse.data);
            throw new Error(`UniPay error: ${orderResponse.data.message || 'Unknown error'}`);
        }
        
        console.log('Order created successfully');
        
        // UniPay returns the checkout URL in data.data.Checkout
        const paymentUrl = orderResponse.data.data?.Checkout || 
                          orderResponse.data.Checkout ||
                          orderResponse.data.PaymentUrl || 
                          orderResponse.data.payment_url ||
                          orderResponse.data.redirect_url;
        
        if (!paymentUrl) {
            console.error('No payment URL in response:', orderResponse.data);
            throw new Error('No payment URL returned from UniPay');
        }
        
        console.log('Payment URL generated successfully');
        
        return res.status(200).json({
            success: true,
            orderId: orderId,
            paymentUrl: paymentUrl,
            unipayOrderId: orderResponse.data.data?.UnipayOrderID,
            unipayOrderHashId: orderResponse.data.data?.UnipayOrderHashID,
            amount: parsedAmount,
            currency: 'GEL',
            orderData: orderResponse.data
        });
        
    } catch (error) {
        console.error('Payment processing error:', {
            message: error.message,
            timestamp: new Date().toISOString()
        });
        
        return res.status(500).json({
            error: 'Payment processing failed',
            details: error.message,
            debug: process.env.NODE_ENV !== 'production' ? {
                status: error.response?.status,
                data: error.response?.data
            } : undefined
        });
    }
};