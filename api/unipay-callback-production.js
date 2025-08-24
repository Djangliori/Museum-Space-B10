// Production UniPay Callback Handler - Based on AI Academia working version
const crypto = require('crypto');

module.exports = async (req, res) => {
    // Security headers for callback endpoint
    res.setHeader('Access-Control-Allow-Origin', 'https://apiv2.unipay.com');
    res.setHeader('Access-Control-Allow-Methods', 'POST');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    
    // UniPay callback received
    
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
            
            // Payment callback data received
            
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
                // Payment successful
            } else if (Status === 'Failed' || PaymentStatus === 'Failed' || Status === '0' || Status === 0) {
                orderStatus = 'failed';
                paymentResult = 'failed';
                // Payment failed
            } else if (Status === 'Cancelled' || PaymentStatus === 'Cancelled') {
                orderStatus = 'cancelled';
                paymentResult = 'cancelled';
                // Payment cancelled
            } else if (Status === 'Processing' || PaymentStatus === 'Processing') {
                orderStatus = 'processing';
                paymentResult = 'processing';
                // Payment processing
            } else {
                // Unknown payment status
            }
            
            // TODO: Here you would normally update your database
            // For now, we just log the status change
            // Payment status updated
            
            // TODO: Based on status, you could:
            // - Send confirmation email to customer
            // - Generate tickets/vouchers
            // - Update inventory
            // - Trigger fulfillment processes
            
            if (orderStatus === 'paid') {
                // TODO: Send confirmation email and generate ticket
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
            // Callback processing error occurred
            
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