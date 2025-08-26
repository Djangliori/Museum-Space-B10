// Payment handling module for UniPay integration
import { PaymentData, PaymentResponse, BookingFormData, TicketInfo } from '../types.js';
import { ApiClient } from './api-client.js';
import { AnalyticsManager } from './analytics.js';

export class PaymentManager {
  private apiClient: ApiClient;
  private analytics: AnalyticsManager;

  constructor(apiClient: ApiClient, analytics: AnalyticsManager) {
    this.apiClient = apiClient;
    this.analytics = analytics;
  }

  // Handle card payment process
  public async processCardPayment(
    formData: BookingFormData, 
    amount: number = 10.0,
    ticketType: string = 'სამუზეუმო სივრცის ბილეთი'
  ): Promise<PaymentResponse> {
    
    // Track payment attempt
    this.analytics.trackFormInteraction('booking', 'payment_attempt');

    const paymentData: PaymentData = {
      firstName: formData.firstName,
      lastName: formData.lastName,
      phone: formData.phone,
      amount: amount,
      ticketType: ticketType
    };

    try {
      const response = await this.apiClient.createPaymentOrder(paymentData);

      if (response.success && response.paymentUrl) {
        // Track successful payment creation
        this.analytics.trackFormInteraction('booking', 'payment_created');
        
        return response;
      } else {
        // Track payment creation failure
        this.analytics.trackError(
          response.error || 'Payment creation failed',
          'payment_creation'
        );
        
        throw new Error(response.error || 'Payment creation failed');
      }
    } catch (error) {
      // Track payment error
      this.analytics.trackError(
        error instanceof Error ? error.message : 'Unknown payment error',
        'payment_processing'
      );
      
      throw error;
    }
  }

  // Redirect to payment URL with safety checks
  public redirectToPayment(paymentUrl: string, delay: number = 2000): void {
    // Validate URL
    if (!this.isValidPaymentUrl(paymentUrl)) {
      throw new Error('Invalid payment URL');
    }

    // Track redirect
    this.analytics.trackFormInteraction('booking', 'payment_redirect');

    // Redirect after delay
    setTimeout(() => {
      window.location.href = paymentUrl;
    }, delay);
  }

  // Validate payment URL for security
  private isValidPaymentUrl(url: string): boolean {
    try {
      const parsedUrl = new URL(url);
      // Allow UniPay domains and localhost for development
      const allowedHosts = [
        'apiv2.unipay.com',
        'pay.unipay.com',
        'localhost'
      ];
      
      return allowedHosts.some(host => 
        parsedUrl.hostname === host || parsedUrl.hostname.endsWith(`.${host}`)
      );
    } catch {
      return false;
    }
  }

  // Generate unique order ID
  public generateOrderId(): string {
    const timestamp = Date.now();
    const random = Math.random().toString(36).substr(2, 5).toUpperCase();
    return `MS-${timestamp}-${random}`;
  }

  // Get order details from URL parameters
  public getOrderFromUrl(): string | null {
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.get('order');
  }

  // Format Georgian date
  public formatGeorgianDate(date: Date = new Date()): string {
    return date.toLocaleDateString('ka-GE', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }

  // Handle payment success
  public handlePaymentSuccess(orderId: string, amount: number = 10.0): void {
    // Track successful payment
    this.analytics.trackPurchaseComplete(orderId, amount);
    
    // Update UI elements if they exist
    this.updateOrderDisplay(orderId);
    this.updatePaymentDate();
    
    console.log('Payment successful for order:', orderId);
  }

  // Handle payment cancellation
  public handlePaymentCancel(orderId: string, amount: number = 10.0): void {
    // Track cancelled payment
    this.analytics.trackPurchaseCancelled(orderId, amount);
    
    // Update UI elements if they exist
    this.updateOrderDisplay(orderId);
    this.updateCancelDate();
    
    console.log('Payment cancelled for order:', orderId);
  }

  // Update order display in UI
  private updateOrderDisplay(orderId: string): void {
    const orderDisplay = document.getElementById('orderIdDisplay');
    if (orderDisplay) {
      orderDisplay.textContent = orderId;
    }
  }

  // Update payment date in UI
  private updatePaymentDate(): void {
    const dateElement = document.getElementById('paymentDate');
    if (dateElement) {
      dateElement.textContent = this.formatGeorgianDate();
    }
  }

  // Update cancel date in UI
  private updateCancelDate(): void {
    const dateElement = document.getElementById('cancelDate');
    if (dateElement) {
      dateElement.textContent = this.formatGeorgianDate();
    }
  }

  // Store selected ticket in session storage
  public storeSelectedTicket(ticket: TicketInfo): void {
    try {
      sessionStorage.setItem('selectedTicket', JSON.stringify(ticket));
    } catch (error) {
      console.warn('Failed to store selected ticket:', error);
    }
  }

  // Retrieve selected ticket from session storage
  public getSelectedTicket(): TicketInfo | null {
    try {
      const stored = sessionStorage.getItem('selectedTicket');
      return stored ? JSON.parse(stored) : null;
    } catch (error) {
      console.warn('Failed to retrieve selected ticket:', error);
      return null;
    }
  }

  // Clear selected ticket from session storage
  public clearSelectedTicket(): void {
    try {
      sessionStorage.removeItem('selectedTicket');
    } catch (error) {
      console.warn('Failed to clear selected ticket:', error);
    }
  }
}