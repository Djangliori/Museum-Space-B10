import { ApiClient } from '../modules/api-client.js';
import { AnalyticsManager } from '../modules/analytics.js';
export declare class TestUniPayPage {
    private apiClient;
    private analytics;
    private authBtn;
    private authStatus;
    private authResponse;
    private paymentBtn;
    private paymentStatus;
    private paymentResponse;
    private ticketTypeSelect;
    private customerNameInput;
    private customerEmailInput;
    private customerPhoneInput;
    constructor(apiClient: ApiClient, analytics: AnalyticsManager);
    private init;
    private findElements;
    private bindEvents;
    testAuth(): Promise<void>;
    testPayment(): Promise<void>;
    private getTestPaymentData;
    private buildEnvironmentErrorMessage;
    private logEnvironmentInfo;
    private trackPageView;
    clearTestResults(): void;
    resetForm(): void;
    destroy(): void;
}
//# sourceMappingURL=test-unipay.d.ts.map