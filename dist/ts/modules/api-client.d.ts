import { PaymentData, PaymentResponse, TestEnvironmentResponse, TestPaymentData } from '../types.js';
export declare class ApiClient {
    private baseUrl;
    constructor();
    testEnvironment(): Promise<TestEnvironmentResponse>;
    createPaymentOrder(paymentData: PaymentData): Promise<PaymentResponse>;
    createTestPayment(testData: TestPaymentData): Promise<PaymentResponse>;
    private fetchWithErrorHandling;
    getPaymentStatus(orderId: string): Promise<any>;
    cancelPayment(orderId: string): Promise<any>;
    sendContactForm(formData: any): Promise<any>;
    getBaseUrl(): string;
    setBaseUrl(url: string): void;
}
//# sourceMappingURL=api-client.d.ts.map