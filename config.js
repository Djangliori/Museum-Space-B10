class Config {
    constructor() {
        this.config = {};
        this.loadConfig();
    }

    loadConfig() {
        const isDevelopment = window.location.hostname === 'localhost' || 
                             window.location.hostname === '127.0.0.1' ||
                             window.location.hostname === '';

        this.config = {
            SITE_URL: isDevelopment ? 
                `${window.location.protocol}//${window.location.host}` : 
                'https://museum-space-b10.vercel.app',
            ENVIRONMENT: isDevelopment ? 'development' : 'production',
            CONTACT_EMAIL: 'betlemi.museum@gmail.com',
            CONTACT_PHONE: '+995 32 2 123 456',
            COMPANY_NAME: 'შპს სამუზეუმო სივრცე',
            ADDRESS: 'ბეთლემის ქუჩა 10N, სოლოლაკი, თბილისი'
        };
    }

    get(key) {
        return this.config[key];
    }

    getSiteUrl() {
        return this.config.SITE_URL;
    }

    getContactInfo() {
        return {
            email: this.config.CONTACT_EMAIL,
            phone: this.config.CONTACT_PHONE,
            company: this.config.COMPANY_NAME,
            address: this.config.ADDRESS
        };
    }
}

// Global config instance
const APP_CONFIG = new Config();