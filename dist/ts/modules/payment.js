export class PaymentManager {
    constructor(apiClient, analytics) {
        this.apiClient = apiClient;
        this.analytics = analytics;
    }
    // Handle card payment process
    async processCardPayment(formData, amount = 10.0, ticketType = 'სამუზეუმო სივრცის ბილეთი') {
        // Track payment attempt
        this.analytics.trackFormInteraction('booking', 'payment_attempt');
        const paymentData = {
            firstName: formData.firstName,
            lastName: formData.lastName,
            phone: formData.phone,
            amount: amount,
            ticketType: ticketType
        };
        try {
            const response = await this.apiClient.createPaymentOrder(paymentData);
            if (response.success && response.paymentUrl) {
                // Track successful payment creation
                this.analytics.trackFormInteraction('booking', 'payment_created');
                return response;
            }
            else {
                // Track payment creation failure
                this.analytics.trackError(response.error || 'Payment creation failed', 'payment_creation');
                throw new Error(response.error || 'Payment creation failed');
            }
        }
        catch (error) {
            // Track payment error
            this.analytics.trackError(error instanceof Error ? error.message : 'Unknown payment error', 'payment_processing');
            throw error;
        }
    }
    // Redirect to payment URL with safety checks
    redirectToPayment(paymentUrl, delay = 2000) {
        // Validate URL
        if (!this.isValidPaymentUrl(paymentUrl)) {
            throw new Error('Invalid payment URL');
        }
        // Track redirect
        this.analytics.trackFormInteraction('booking', 'payment_redirect');
        // Redirect after delay
        setTimeout(() => {
            window.location.href = paymentUrl;
        }, delay);
    }
    // Validate payment URL for security
    isValidPaymentUrl(url) {
        try {
            const parsedUrl = new URL(url);
            // Allow UniPay domains and localhost for development
            const allowedHosts = [
                'apiv2.unipay.com',
                'pay.unipay.com',
                'localhost'
            ];
            return allowedHosts.some(host => parsedUrl.hostname === host || parsedUrl.hostname.endsWith(`.${host}`));
        }
        catch {
            return false;
        }
    }
    // Generate unique order ID
    generateOrderId() {
        const timestamp = Date.now();
        const random = Math.random().toString(36).substr(2, 5).toUpperCase();
        return `MS-${timestamp}-${random}`;
    }
    // Get order details from URL parameters
    getOrderFromUrl() {
        const urlParams = new URLSearchParams(window.location.search);
        return urlParams.get('order');
    }
    // Format Georgian date
    formatGeorgianDate(date = new Date()) {
        return date.toLocaleDateString('ka-GE', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    }
    // Handle payment success
    handlePaymentSuccess(orderId, amount = 10.0) {
        // Track successful payment
        this.analytics.trackPurchaseComplete(orderId, amount);
        // Update UI elements if they exist
        this.updateOrderDisplay(orderId);
        this.updatePaymentDate();
        console.log('Payment successful for order:', orderId);
    }
    // Handle payment cancellation
    handlePaymentCancel(orderId, amount = 10.0) {
        // Track cancelled payment
        this.analytics.trackPurchaseCancelled(orderId, amount);
        // Update UI elements if they exist
        this.updateOrderDisplay(orderId);
        this.updateCancelDate();
        console.log('Payment cancelled for order:', orderId);
    }
    // Update order display in UI
    updateOrderDisplay(orderId) {
        const orderDisplay = document.getElementById('orderIdDisplay');
        if (orderDisplay) {
            orderDisplay.textContent = orderId;
        }
    }
    // Update payment date in UI
    updatePaymentDate() {
        const dateElement = document.getElementById('paymentDate');
        if (dateElement) {
            dateElement.textContent = this.formatGeorgianDate();
        }
    }
    // Update cancel date in UI
    updateCancelDate() {
        const dateElement = document.getElementById('cancelDate');
        if (dateElement) {
            dateElement.textContent = this.formatGeorgianDate();
        }
    }
    // Store selected ticket in session storage
    storeSelectedTicket(ticket) {
        try {
            sessionStorage.setItem('selectedTicket', JSON.stringify(ticket));
        }
        catch (error) {
            console.warn('Failed to store selected ticket:', error);
        }
    }
    // Retrieve selected ticket from session storage
    getSelectedTicket() {
        try {
            const stored = sessionStorage.getItem('selectedTicket');
            return stored ? JSON.parse(stored) : null;
        }
        catch (error) {
            console.warn('Failed to retrieve selected ticket:', error);
            return null;
        }
    }
    // Clear selected ticket from session storage
    clearSelectedTicket() {
        try {
            sessionStorage.removeItem('selectedTicket');
        }
        catch (error) {
            console.warn('Failed to clear selected ticket:', error);
        }
    }
}
//# sourceMappingURL=payment.js.map