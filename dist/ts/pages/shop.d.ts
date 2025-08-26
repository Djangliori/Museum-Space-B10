import { TicketData, TicketInfo } from '../types.js';
import { AnalyticsManager } from '../modules/analytics.js';
import { PaymentManager } from '../modules/payment.js';
export declare class ShopPage {
    private analytics;
    private paymentManager;
    private tickets;
    constructor(analytics: AnalyticsManager, paymentManager: PaymentManager);
    private initializeTickets;
    private init;
    private bindProductCardEvents;
    private extractTicketTypeFromCard;
    handleTicketPurchase(ticketType: string): void;
    private trackPageView;
    getAvailableTickets(): TicketData;
    getTicketInfo(ticketType: string): TicketInfo | null;
    updateTicketPrice(ticketType: string, newPrice: number): void;
    private updatePriceDisplay;
    destroy(): void;
}
//# sourceMappingURL=shop.d.ts.map