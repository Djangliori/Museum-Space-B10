import { AnalyticsManager } from '../modules/analytics.js';
import { PaymentManager } from '../modules/payment.js';
import { ApiClient } from '../modules/api-client.js';
export declare class BookingPage {
    private analytics;
    private paymentManager;
    private apiClient;
    private form;
    private cardPaymentBtn;
    private bankTransferBtn;
    private successMessage;
    constructor(analytics: AnalyticsManager, paymentManager: PaymentManager, apiClient: ApiClient);
    private init;
    private loadSelectedTicket;
    private initEventListeners;
    private validateField;
    private validateName;
    private validatePhone;
    private updateFieldUI;
    private isFormValid;
    private updatePaymentButtons;
    private getFormData;
    private handleCardPayment;
    private handleBankTransfer;
    private proceedToNextStep;
    private updateStepIndicator;
    private simulateNextStep;
    private trackPageView;
    resetForm(): void;
    destroy(): void;
}
//# sourceMappingURL=booking.d.ts.map