export class ApiClient {
    constructor() {
        // Determine base URL based on environment
        if (window.location.hostname === 'localhost') {
            this.baseUrl = '';
        }
        else if (window.location.hostname === 'www.betlemi10.com') {
            this.baseUrl = 'https://www.betlemi10.com';
        }
        else {
            this.baseUrl = 'https://betlemi10.com';
        }
    }
    // Test environment variables and API configuration
    async testEnvironment() {
        try {
            const response = await fetch(`${this.baseUrl}/api/test-env`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json'
                }
            });
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            return await response.json();
        }
        catch (error) {
            console.error('Environment test failed:', error);
            throw new Error(`Environment test failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
    }
    // Create UniPay payment order (production)
    async createPaymentOrder(paymentData) {
        try {
            const response = await fetch(`${this.baseUrl}/api/unipay-create-order-production`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(paymentData)
            });
            const data = await response.json();
            if (!response.ok) {
                throw new Error(data.error || `HTTP error! status: ${response.status}`);
            }
            return data;
        }
        catch (error) {
            console.error('Payment creation failed:', error);
            throw new Error(`Payment creation failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
    }
    // Create test payment order
    async createTestPayment(testData) {
        try {
            const response = await fetch(`${this.baseUrl}/api/unipay-create-order-production`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(testData)
            });
            const data = await response.json();
            if (!response.ok) {
                throw new Error(data.error || `HTTP error! status: ${response.status}`);
            }
            return data;
        }
        catch (error) {
            console.error('Test payment creation failed:', error);
            throw new Error(`Test payment failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
    }
    // Generic fetch wrapper with error handling
    async fetchWithErrorHandling(url, options = {}) {
        try {
            const response = await fetch(url, {
                ...options,
                headers: {
                    'Content-Type': 'application/json',
                    ...options.headers
                }
            });
            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
            }
            return await response.json();
        }
        catch (error) {
            if (error instanceof TypeError && error.message.includes('fetch')) {
                throw new Error('Network error: Please check your connection');
            }
            throw error;
        }
    }
    // Get payment status (future implementation)
    async getPaymentStatus(orderId) {
        return this.fetchWithErrorHandling(`${this.baseUrl}/api/payment-status/${orderId}`);
    }
    // Cancel payment order (future implementation)
    async cancelPayment(orderId) {
        return this.fetchWithErrorHandling(`${this.baseUrl}/api/cancel-payment`, {
            method: 'POST',
            body: JSON.stringify({ orderId })
        });
    }
    // Send contact form (future implementation)
    async sendContactForm(formData) {
        return this.fetchWithErrorHandling(`${this.baseUrl}/api/contact`, {
            method: 'POST',
            body: JSON.stringify(formData)
        });
    }
    // Get current base URL
    getBaseUrl() {
        return this.baseUrl;
    }
    // Set custom base URL for testing
    setBaseUrl(url) {
        this.baseUrl = url;
    }
}
//# sourceMappingURL=api-client.js.map