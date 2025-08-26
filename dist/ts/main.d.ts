import { AnalyticsManager } from './modules/analytics.js';
import { ApiClient } from './modules/api-client.js';
import { PaymentManager } from './modules/payment.js';
export declare class MuseumSpaceApp {
    private analytics;
    private smoothScroll;
    private navigation;
    private apiClient;
    private paymentManager;
    private currentPage;
    private shopPage?;
    private bookingPage?;
    private testUniPayPage?;
    constructor();
    private getCurrentPageType;
    private initializeCore;
    private initializeCommonUI;
    private initializePageSpecific;
    private initializeHomePage;
    private initializeShopPage;
    private initializeBookingPage;
    private initializeTestUniPayPage;
    private initializePaymentSuccessPage;
    private initializePaymentCancelPage;
    private initializeTermsPage;
    private handleReducedMotion;
    getAnalytics(): AnalyticsManager;
    getPaymentManager(): PaymentManager;
    getApiClient(): ApiClient;
    getCurrentPage(): string;
    destroy(): void;
}
declare global {
    interface Window {
        museumApp: MuseumSpaceApp;
    }
}
//# sourceMappingURL=main.d.ts.map