// Google Analytics wrapper module
import { GtagFunction } from '../types.js';

export class AnalyticsManager {
  private gtag: GtagFunction;
  private analyticsId: string;

  constructor(analyticsId: string = 'G-XXXXXXXXXX') {
    this.analyticsId = analyticsId;
    this.gtag = window.gtag;
    this.initializeAnalytics();
  }

  private initializeAnalytics(): void {
    // Initialize dataLayer if it doesn't exist
    window.dataLayer = window.dataLayer || [];
    
    // Create gtag function if it doesn't exist
    if (!window.gtag) {
      window.gtag = function(...args: any[]) {
        window.dataLayer.push(arguments);
      } as GtagFunction;
      this.gtag = window.gtag;
    }

    // Configure Google Analytics
    this.gtag('js', new Date());
    this.gtag('config', this.analyticsId, {
      page_title: 'ილუზიების მუზეუმი & ჰოლოზეუმი',
      page_location: window.location.href,
      send_page_view: true
    });
  }

  // Track CTA clicks
  public trackCTAClick(label: string, location: string = 'unknown'): void {
    this.gtag('event', 'click', {
      event_category: 'CTA',
      event_label: `${location} - ${label}`,
      page_location: window.location.href
    });
  }

  // Track ticket purchases
  public trackTicketPurchase(ticketName: string, price: number): void {
    this.gtag('event', 'click', {
      event_category: 'Ticket Purchase',
      event_label: ticketName,
      value: price,
      currency: 'GEL'
    });
  }

  // Track successful payments
  public trackPurchaseComplete(orderId: string, value: number = 10.00): void {
    this.gtag('event', 'purchase', {
      transaction_id: orderId,
      value: value,
      currency: 'GEL',
      items: [{
        item_id: 'museum_ticket',
        item_name: 'Museum Space B10 Ticket',
        category: 'Tickets',
        quantity: 1,
        price: value
      }]
    });
  }

  // Track cancelled payments
  public trackPurchaseCancelled(orderId: string, value: number = 10.00): void {
    this.gtag('event', 'purchase_cancelled', {
      transaction_id: orderId,
      value: value,
      currency: 'GEL'
    });
  }

  // Track form interactions
  public trackFormInteraction(formName: string, action: string): void {
    this.gtag('event', action, {
      event_category: 'Form',
      event_label: formName,
      page_location: window.location.href
    });
  }

  // Track page views
  public trackPageView(pageTitle?: string): void {
    this.gtag('config', this.analyticsId, {
      page_title: pageTitle || document.title,
      page_location: window.location.href
    });
  }

  // Track errors
  public trackError(errorMessage: string, errorLocation: string): void {
    this.gtag('event', 'exception', {
      description: errorMessage,
      fatal: false,
      custom_parameter: errorLocation
    });
  }
}