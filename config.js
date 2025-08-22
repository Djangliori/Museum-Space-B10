// Environment Configuration Loader
class Config {
    constructor() {
        this.config = {};
        this.loadConfig();
    }

    loadConfig() {
        // In production, these would be set via environment variables or build process
        // For development/testing, we'll use the values directly
        
        const isDevelopment = window.location.hostname === 'localhost' || 
                             window.location.hostname === '127.0.0.1' ||
                             window.location.hostname === '';

        this.config = {
            UNIPAY_MERCHANT_ID: '5015191030581',
            UNIPAY_API_KEY: 'bc6f5073-6d1c-4abe-8456-1bb814077f6e',
            SITE_URL: isDevelopment ? 
                `${window.location.protocol}//${window.location.host}` : 
                'https://museum-space-b10.vercel.app',
            UNIPAY_ENDPOINT: 'https://www.unipay.ge/checkout', // Georgian UniPay endpoint (test URL)
            ENVIRONMENT: isDevelopment ? 'development' : 'production'
        };
    }

    get(key) {
        return this.config[key];
    }

    getSiteUrl() {
        return this.config.SITE_URL;
    }

    getUniPayConfig() {
        return {
            merchant_id: this.config.UNIPAY_MERCHANT_ID,
            api_key: this.config.UNIPAY_API_KEY,
            endpoint: this.config.UNIPAY_ENDPOINT,
            success_url: `${this.getSiteUrl()}/callback.html?status=success`,
            fail_url: `${this.getSiteUrl()}/callback.html?status=failed`,
            callback_url: `${this.getSiteUrl()}/callback.html`
        };
    }
}

// Global config instance
const APP_CONFIG = new Config();