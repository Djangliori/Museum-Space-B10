// Global type definitions for Museum Space B10 application

// DOM Element types
export interface HTMLElementWithError extends HTMLElement {
  style: CSSStyleDeclaration;
}

// Google Analytics types
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

// Ticket types
export interface TicketInfo {
  name: string;
  price: number;
}

export interface TicketData {
  [key: string]: TicketInfo;
}

// Form validation types
export interface ValidationResult {
  isValid: boolean;
  errorMessage?: string;
}

export interface FormField extends HTMLInputElement {
  readonly id: string;
  readonly value: string;
  readonly required: boolean;
}

// Booking form types
export interface BookingFormData {
  firstName: string;
  lastName: string;
  phone: string;
  orderId: string;
  timestamp: string;
}

// Payment types
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

// API testing types
export interface TestEnvironmentResponse {
  status: string;
  environment_variables?: {
    UNIPAY_MERCHANT_ID: { configured: boolean };
    UNIPAY_API_KEY: { configured: boolean };
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

// Smooth scroll types
export interface SmoothScrollOptions {
  duration?: number;
  headerOffset?: number;
}

// Navigation types
export interface NavigationElements {
  mobileMenuBtn?: HTMLElement;
  mobileCloseBtn?: HTMLElement;
  mobileNav?: HTMLElement;
  mobileOverlay?: HTMLElement;
  mobileNavLinks?: NodeListOf<HTMLElement>;
}

// FAQ types
export interface FAQElement extends HTMLElement {
  nextElementSibling: HTMLElement;
}

// Intersection Observer types
export interface IntersectionObserverOptions {
  threshold?: number;
  rootMargin?: string;
}

// Error types
export interface MuseumError extends Error {
  code?: string;
  details?: any;
}