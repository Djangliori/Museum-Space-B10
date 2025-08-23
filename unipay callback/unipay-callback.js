module.exports = async (req, res) => {
    // Set CORS headers for UniPay
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    // Handle preflight requests
    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

    // Only allow POST requests
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    console.log('UniPay callback received:', {
        method: req.method,
        userAgent: req.headers['user-agent'],
        ip: req.headers['x-forwarded-for'] || req.connection.remoteAddress,
        body: req.body
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
            TransactionID,
            CardNumber,
            AuthCode,
            RRN,
            PaymentDate
        } = req.body;

        console.log('Payment callback data:', {
            OrderHashID,
            MerchantOrderID,
            Status,
            PaymentStatus,
            Amount,
            Currency,
            PaymentMethod,
            TransactionID
        });

        // Validate required fields
        if (!OrderHashID || !MerchantOrderID) {
            console.error('Missing required callback fields');
            return res.status(400).json({ error: 'Invalid callback data' });
        }

        // Determine payment status
        const isSuccessful = Status === 'SUCCESS' || PaymentStatus === 'SUCCESS' || PaymentStatus === 'PAID';
        const isFailed = Status === 'FAILED' || PaymentStatus === 'FAILED';
        const isPending = Status === 'PENDING' || PaymentStatus === 'PENDING';

        console.log('Payment status analysis:', {
            isSuccessful,
            isFailed,
            isPending,
            rawStatus: Status,
            rawPaymentStatus: PaymentStatus
        });

        // Here you would typically:
        // 1. Update your database with the payment status
        // 2. Send confirmation email to customer
        // 3. Update inventory or activate services
        // 4. Log the transaction for auditing
        
        if (isSuccessful) {
            console.log(`✅ Payment SUCCESS for order ${MerchantOrderID}:`, {
                amount: Amount,
                currency: Currency,
                transactionId: TransactionID,
                paymentMethod: PaymentMethod
            });
            
            // TODO: Update database - mark order as paid
            // TODO: Send confirmation email
            // TODO: Activate museum ticket/access
            
        } else if (isFailed) {
            console.log(`❌ Payment FAILED for order ${MerchantOrderID}:`, {
                amount: Amount,
                currency: Currency
            });
            
            // TODO: Update database - mark order as failed
            // TODO: Send failure notification
            
        } else if (isPending) {
            console.log(`⏳ Payment PENDING for order ${MerchantOrderID}`);
            
            // TODO: Update database - mark order as pending
            
        } else {
            console.log(`❓ Payment UNKNOWN status for order ${MerchantOrderID}:`, {
                Status,
                PaymentStatus
            });
        }

        // Always respond with 200 OK to acknowledge receipt
        // UniPay expects specific response format
        return res.status(200).json({
            success: true,
            message: 'OK',
            orderId: MerchantOrderID,
            processed: true,
            timestamp: new Date().toISOString()
        });

    } catch (error) {
        console.error('Callback processing error:', error);
        
        // Still return 200 to prevent UniPay from retrying
        // UniPay will retry if it doesn't get 200 OK
        return res.status(200).json({
            success: true,  // Changed to true to prevent retries
            message: 'Callback acknowledged',
            error: 'Processing error but acknowledged',
            timestamp: new Date().toISOString()
        });
    }
}