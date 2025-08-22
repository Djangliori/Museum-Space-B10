// Vercel Serverless Function to create UniPay order (bypassing CORS)
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

        // UniPay API endpoint
        const uniPayEndpoint = 'https://apiv2.unipay.com/v3/api/order/create';
        
        // Your UniPay credentials
        const apiKey = 'bc6f5073-6d1c-4abe-8456-1bb814077f6e';

        // Prepare UniPay request
        const uniPayRequest = {
            "MerchantUser": merchantUser,
            "MerchantOrderID": merchantOrderID,
            "OrderPrice": orderPrice,
            "OrderCurrency": orderCurrency,
            "OrderName": orderName,
            "OrderDescription": orderDescription,
            "SuccessRedirectUrl": successRedirectUrl,
            "CancelRedirectUrl": cancelRedirectUrl,
            "CallBackUrl": callBackUrl,
            "Language": language || "GE",
            "InApp": inApp || 0
        };

        console.log('Making UniPay API request:', uniPayRequest);

        // Make request to UniPay
        const response = await fetch(uniPayEndpoint, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-API-Key': apiKey,
                'Accept': 'application/json'
            },
            body: JSON.stringify(uniPayRequest)
        });

        console.log('UniPay response status:', response.status);
        console.log('UniPay response headers:', Object.fromEntries(response.headers));
        
        const responseText = await response.text();
        console.log('UniPay raw response:', responseText);

        // Check if the response is not ok
        if (!response.ok) {
            console.error('UniPay API error:', {
                status: response.status,
                statusText: response.statusText,
                body: responseText
            });
            res.status(response.status).json({ 
                error: 'UniPay API Error', 
                status: response.status,
                statusText: response.statusText,
                details: responseText 
            });
            return;
        }

        let result;
        try {
            result = JSON.parse(responseText);
        } catch (parseError) {
            console.error('Failed to parse UniPay response:', parseError);
            res.status(500).json({ 
                error: 'Invalid response from UniPay', 
                details: responseText.substring(0, 200) 
            });
            return;
        }

        console.log('UniPay parsed response:', result);

        // Return response to client
        res.status(200).json(result);

    } catch (error) {
        console.error('UniPay proxy error:', error);
        res.status(500).json({ 
            error: 'Failed to create order', 
            details: error.message 
        });
    }
}