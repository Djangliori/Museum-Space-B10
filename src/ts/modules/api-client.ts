// API client module for UniPay and other API interactions
import { PaymentData, PaymentResponse, TestEnvironmentResponse, TestPaymentData } from '../types.js';

export class ApiClient {
  private baseUrl: string;

  constructor() {
    // Determine base URL based on environment
    this.baseUrl = window.location.hostname === 'localhost' ? '' : 'https://betlemi10.com';
  }

  // Test environment variables and API configuration
  public async testEnvironment(): Promise<TestEnvironmentResponse> {
    try {
      const response = await fetch(`${this.baseUrl}/api/test-env`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Environment test failed:', error);
      throw new Error(`Environment test failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  // Create UniPay payment order (production)
  public async createPaymentOrder(paymentData: PaymentData): Promise<PaymentResponse> {
    try {
      const response = await fetch(`${this.baseUrl}/api/unipay-create-order-production`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(paymentData)
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || `HTTP error! status: ${response.status}`);
      }

      return data;
    } catch (error) {
      console.error('Payment creation failed:', error);
      throw new Error(`Payment creation failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  // Create test payment order
  public async createTestPayment(testData: TestPaymentData): Promise<PaymentResponse> {
    try {
      const response = await fetch(`${this.baseUrl}/api/unipay-create-order-production`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(testData)
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || `HTTP error! status: ${response.status}`);
      }

      return data;
    } catch (error) {
      console.error('Test payment creation failed:', error);
      throw new Error(`Test payment failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  // Generic fetch wrapper with error handling
  private async fetchWithErrorHandling<T>(url: string, options: RequestInit = {}): Promise<T> {
    try {
      const response = await fetch(url, {
        ...options,
        headers: {
          'Content-Type': 'application/json',
          ...options.headers
        }
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      if (error instanceof TypeError && error.message.includes('fetch')) {
        throw new Error('Network error: Please check your connection');
      }
      throw error;
    }
  }

  // Get payment status (future implementation)
  public async getPaymentStatus(orderId: string): Promise<any> {
    return this.fetchWithErrorHandling(`${this.baseUrl}/api/payment-status/${orderId}`);
  }

  // Cancel payment order (future implementation)
  public async cancelPayment(orderId: string): Promise<any> {
    return this.fetchWithErrorHandling(`${this.baseUrl}/api/cancel-payment`, {
      method: 'POST',
      body: JSON.stringify({ orderId })
    });
  }

  // Send contact form (future implementation)
  public async sendContactForm(formData: any): Promise<any> {
    return this.fetchWithErrorHandling(`${this.baseUrl}/api/contact`, {
      method: 'POST',
      body: JSON.stringify(formData)
    });
  }

  // Get current base URL
  public getBaseUrl(): string {
    return this.baseUrl;
  }

  // Set custom base URL for testing
  public setBaseUrl(url: string): void {
    this.baseUrl = url;
  }
}