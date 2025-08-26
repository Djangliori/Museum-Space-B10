export interface HTMLElementWithError extends HTMLElement {
    style: CSSStyleDeclaration;
}
export interface GtagFunction {
    (command: 'config', targetId: string, config?: Record<string, any>): void;
    (command: 'event', eventName: string, eventParameters?: Record<string, any>): void;
    (command: 'js', date: Date): void;
}
declare global {
    interface Window {
        dataLayer: any[];
        gtag: GtagFunction;
    }
}
export interface TicketInfo {
    name: string;
    price: number;
}
export interface TicketData {
    [key: string]: TicketInfo;
}
export interface ValidationResult {
    isValid: boolean;
    errorMessage?: string;
}
export interface FormField extends HTMLInputElement {
    readonly id: string;
    readonly value: string;
    readonly required: boolean;
}
export interface BookingFormData {
    firstName: string;
    lastName: string;
    phone: string;
    orderId: string;
    timestamp: string;
}
export interface PaymentData {
    firstName: string;
    lastName: string;
    phone: string;
    amount: number;
    ticketType: string;
}
export interface PaymentResponse {
    success: boolean;
    paymentUrl?: string;
    orderId?: string;
    error?: string;
    details?: string;
}
export interface TestEnvironmentResponse {
    status: string;
    environment_variables?: {
        UNIPAY_MERCHANT_ID: {
            configured: boolean;
        };
        UNIPAY_API_KEY: {
            configured: boolean;
        };
    };
}
export interface TestPaymentData {
    amount: number;
    userDetails: {
        name: string;
        email: string;
        phone: string;
    };
    ticketInfo: {
        name: string;
        type: string;
    };
}
export interface SmoothScrollOptions {
    duration?: number;
    headerOffset?: number;
}
export interface NavigationElements {
    mobileMenuBtn?: HTMLElement;
    mobileCloseBtn?: HTMLElement;
    mobileNav?: HTMLElement;
    mobileOverlay?: HTMLElement;
    mobileNavLinks?: NodeListOf<HTMLElement>;
}
export interface FAQElement extends HTMLElement {
    nextElementSibling: HTMLElement;
}
export interface IntersectionObserverOptions {
    threshold?: number;
    rootMargin?: string;
}
export interface MuseumError extends Error {
    code?: string;
    details?: any;
}
//# sourceMappingURL=types.d.ts.map