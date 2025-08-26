// Main entry point for Museum Space B10 application
import { AnalyticsManager } from './modules/analytics.js';
import { SmoothScroll } from './modules/smooth-scroll.js';
import { NavigationManager } from './modules/navigation.js';
import { ApiClient } from './modules/api-client.js';
import { PaymentManager } from './modules/payment.js';
import { UIHelpers } from './modules/ui-helpers.js';
// Page-specific imports
import { ShopPage } from './pages/shop.js';
import { BookingPage } from './pages/booking.js';
import { TestUniPayPage } from './pages/test-unipay.js';
export class MuseumSpaceApp {
    constructor() {
        this.currentPage = this.getCurrentPageType();
        this.initializeCore();
        this.initializePageSpecific();
    }
    getCurrentPageType() {
        const path = window.location.pathname;
        if (path.includes('shop') || path.includes('biletebi')) {
            return 'shop';
        }
        else if (path.includes('booking') || path.includes('shekveta')) {
            return 'booking';
        }
        else if (path.includes('test-unipay')) {
            return 'test-unipay';
        }
        else if (path.includes('payment-success')) {
            return 'payment-success';
        }
        else if (path.includes('payment-cancel')) {
            return 'payment-cancel';
        }
        else if (path.includes('terms') || path.includes('wesmdebi')) {
            return 'terms';
        }
        else {
            return 'home';
        }
    }
    initializeCore() {
        // Initialize core modules
        this.analytics = new AnalyticsManager();
        this.smoothScroll = new SmoothScroll();
        this.navigation = new NavigationManager(this.smoothScroll);
        this.apiClient = new ApiClient();
        this.paymentManager = new PaymentManager(this.apiClient, this.analytics);
        // Initialize common UI components
        this.initializeCommonUI();
        // Handle reduced motion preference
        this.handleReducedMotion();
        // Log initialization
        console.log('Museum Space B10 App initialized:', {
            page: this.currentPage,
            timestamp: new Date().toISOString(),
            userAgent: navigator.userAgent
        });
    }
    initializeCommonUI() {
        // Initialize FAQ accordion (if present)
        UIHelpers.initFAQAccordion();
        // Initialize pricing toggle (if present)
        UIHelpers.initPricingToggle();
        // Initialize back to top button (if present)
        UIHelpers.initBackToTop();
        // Initialize scroll to top (if present)
        UIHelpers.initScrollToTop();
        // Initialize lazy loading for images
        UIHelpers.initLazyLoading();
    }
    initializePageSpecific() {
        switch (this.currentPage) {
            case 'home':
                this.initializeHomePage();
                break;
            case 'shop':
                this.initializeShopPage();
                break;
            case 'booking':
                this.initializeBookingPage();
                break;
            case 'test-unipay':
                this.initializeTestUniPayPage();
                break;
            case 'payment-success':
                this.initializePaymentSuccessPage();
                break;
            case 'payment-cancel':
                this.initializePaymentCancelPage();
                break;
            case 'terms':
                this.initializeTermsPage();
                break;
            default:
                console.log('No specific initialization for page:', this.currentPage);
        }
    }
    initializeHomePage() {
        // Home page is handled by common UI components
        this.analytics.trackPageView('Home - ილუზიების მუზეუმი & ჰოლოზეუმი');
    }
    initializeShopPage() {
        this.shopPage = new ShopPage(this.analytics, this.paymentManager);
    }
    initializeBookingPage() {
        this.bookingPage = new BookingPage(this.analytics, this.paymentManager, this.apiClient);
    }
    initializeTestUniPayPage() {
        this.testUniPayPage = new TestUniPayPage(this.apiClient, this.analytics);
    }
    initializePaymentSuccessPage() {
        const orderId = this.paymentManager.getOrderFromUrl();
        if (orderId) {
            this.paymentManager.handlePaymentSuccess(orderId);
        }
        this.analytics.trackPageView('Payment Success');
    }
    initializePaymentCancelPage() {
        const orderId = this.paymentManager.getOrderFromUrl();
        if (orderId) {
            this.paymentManager.handlePaymentCancel(orderId);
        }
        this.analytics.trackPageView('Payment Cancelled');
    }
    initializeTermsPage() {
        UIHelpers.initTermsAnimations();
        UIHelpers.initPrintSupport();
        this.analytics.trackPageView('Terms and Conditions');
    }
    handleReducedMotion() {
        if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
            document.documentElement.style.scrollBehavior = 'auto';
            console.log('Reduced motion preference detected - animations disabled');
        }
    }
    // Public methods for external access
    getAnalytics() {
        return this.analytics;
    }
    getPaymentManager() {
        return this.paymentManager;
    }
    getApiClient() {
        return this.apiClient;
    }
    getCurrentPage() {
        return this.currentPage;
    }
    // Destroy method for cleanup
    destroy() {
        // Clean up page-specific instances
        this.shopPage?.destroy();
        this.bookingPage?.destroy();
        this.testUniPayPage?.destroy();
        // Clean up core modules
        this.navigation.destroy();
        console.log('Museum Space B10 App destroyed');
    }
}
// Global error handler
window.addEventListener('error', (event) => {
    console.error('Global error:', event.error);
    // Track error if analytics is available
    if (window.museumApp?.getAnalytics) {
        window.museumApp.getAnalytics().trackError(event.error?.message || 'Unknown error', 'global_error');
    }
});
// Initialize app when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    try {
        window.museumApp = new MuseumSpaceApp();
    }
    catch (error) {
        console.error('Failed to initialize Museum Space App:', error);
    }
});
//# sourceMappingURL=main.js.map