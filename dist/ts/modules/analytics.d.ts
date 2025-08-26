export declare class AnalyticsManager {
    private gtag;
    private analyticsId;
    constructor(analyticsId?: string);
    private initializeAnalytics;
    trackCTAClick(label: string, location?: string): void;
    trackTicketPurchase(ticketName: string, price: number): void;
    trackPurchaseComplete(orderId: string, value?: number): void;
    trackPurchaseCancelled(orderId: string, value?: number): void;
    trackFormInteraction(formName: string, action: string): void;
    trackPageView(pageTitle?: string): void;
    trackError(errorMessage: string, errorLocation: string): void;
}
//# sourceMappingURL=analytics.d.ts.map