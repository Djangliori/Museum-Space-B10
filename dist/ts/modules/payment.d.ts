import { PaymentResponse, BookingFormData, TicketInfo } from '../types.js';
import { ApiClient } from './api-client.js';
import { AnalyticsManager } from './analytics.js';
export declare class PaymentManager {
    private apiClient;
    private analytics;
    constructor(apiClient: ApiClient, analytics: AnalyticsManager);
    processCardPayment(formData: BookingFormData, amount?: number, ticketType?: string): Promise<PaymentResponse>;
    redirectToPayment(paymentUrl: string, delay?: number): void;
    private isValidPaymentUrl;
    generateOrderId(): string;
    getOrderFromUrl(): string | null;
    formatGeorgianDate(date?: Date): string;
    handlePaymentSuccess(orderId: string, amount?: number): void;
    handlePaymentCancel(orderId: string, amount?: number): void;
    private updateOrderDisplay;
    private updatePaymentDate;
    private updateCancelDate;
    storeSelectedTicket(ticket: TicketInfo): void;
    getSelectedTicket(): TicketInfo | null;
    clearSelectedTicket(): void;
}
//# sourceMappingURL=payment.d.ts.map