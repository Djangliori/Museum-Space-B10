// Production UniPay Callback Handler - Based on AI Academia working version
const crypto = require('crypto');

module.exports = async (req, res) => {
    console.log('UniPay callback received:', {
        method: req.method,
        timestamp: new Date().toISOString(),
        ip: req.headers['x-forwarded-for'] || req.connection?.remoteAddress
    });
    
    // UniPay sends POST callbacks with payment status
    if (req.method === 'POST') {
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
            } = req.body;
            
            console.log('Payment callback data:', {
                OrderHashID,
                MerchantOrderID,
                Status,
                PaymentStatus,
                Amount,
                Currency,
                PaymentMethod,
                TransactionID,
                timestamp: new Date().toISOString()
            });
            
            // Validate required fields
            if (!MerchantOrderID) {
                console.error('Missing MerchantOrderID in callback');
                return res.status(400).json({ error: 'Missing order ID' });
            }
            
            let orderStatus = 'pending';
            let paymentResult = 'unknown';
            
            // Map UniPay status to our order status
            if (Status === 'Success' || PaymentStatus === 'Success' || Status === '1' || Status === 1) {
                orderStatus = 'paid';
                paymentResult = 'success';
                console.log(`✅ Payment SUCCESS for order ${MerchantOrderID}`);
            } else if (Status === 'Failed' || PaymentStatus === 'Failed' || Status === '0' || Status === 0) {
                orderStatus = 'failed';
                paymentResult = 'failed';
                console.log(`❌ Payment FAILED for order ${MerchantOrderID}`);
            } else if (Status === 'Cancelled' || PaymentStatus === 'Cancelled') {
                orderStatus = 'cancelled';
                paymentResult = 'cancelled';
                console.log(`🚫 Payment CANCELLED for order ${MerchantOrderID}`);
            } else if (Status === 'Processing' || PaymentStatus === 'Processing') {
                orderStatus = 'processing';
                paymentResult = 'processing';
                console.log(`⏳ Payment PROCESSING for order ${MerchantOrderID}`);
            } else {
                console.log(`❓ Unknown payment status for order ${MerchantOrderID}:`, { Status, PaymentStatus });
            }
            
            // TODO: Here you would normally update your database
            // For now, we just log the status change
            console.log('Payment status update:', {
                orderId: MerchantOrderID,
                oldStatus: 'pending',
                newStatus: orderStatus,
                paymentResult,
                amount: Amount,
                currency: Currency,
                paymentMethod: PaymentMethod,
                transactionId: TransactionID,
                timestamp: new Date().toISOString()
            });
            
            // TODO: Based on status, you could:
            // - Send confirmation email to customer
            // - Generate tickets/vouchers
            // - Update inventory
            // - Trigger fulfillment processes
            
            if (orderStatus === 'paid') {
                console.log('TODO: Send confirmation email and generate ticket');
                // Example: await sendConfirmationEmail(customerEmail, orderDetails);
                // Example: await generateMuseumTicket(MerchantOrderID);
            }
            
            // Acknowledge receipt to UniPay
            return res.status(200).json({
                success: true,
                message: 'Callback processed successfully',
                orderId: MerchantOrderID,
                status: orderStatus,
                processed: true,
                timestamp: new Date().toISOString()
            });
            
        } catch (error) {
            console.error('Callback processing error:', {
                error: error.message,
                stack: error.stack,
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
    }
    
    // For GET requests or other methods - useful for testing
    return res.status(200).json({
        message: 'UniPay callback endpoint active',
        method: req.method,
        timestamp: new Date().toISOString()
    });
};