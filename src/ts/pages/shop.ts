// Shop page functionality - ticket purchasing
import { TicketData, TicketInfo } from '../types.js';
import { AnalyticsManager } from '../modules/analytics.js';
import { PaymentManager } from '../modules/payment.js';

export class ShopPage {
  private analytics: AnalyticsManager;
  private paymentManager: PaymentManager;
  private tickets: TicketData;

  constructor(analytics: AnalyticsManager, paymentManager: PaymentManager) {
    this.analytics = analytics;
    this.paymentManager = paymentManager;
    this.tickets = this.initializeTickets();
    this.init();
  }

  private initializeTickets(): TicketData {
    return {
      'combo-adult': {
        name: '2 მუზეუმის კომბო – ჰოლოზეუმი და ილუზიები (ზრდასრული)',
        price: 50
      },
      'combo-child': {
        name: '2 მუზეუმის კომბო – ჰოლოზეუმი და ილუზიები (საბავშვო – 15 წლამდე)',
        price: 30
      },
      'illusions-adult': {
        name: 'ილუზიების მუზეუმი (ზრდასრული)',
        price: 25
      },
      'illusions-child': {
        name: 'ილუზიების მუზეუმი (საბავშვო – 15 წლამდე)',
        price: 15
      },
      'holoseum-adult': {
        name: 'ჰოლოზეუმი – ვან გოგის ციფრული გამოფენა (ზრდასრული)',
        price: 25
      },
      'holoseum-child': {
        name: 'ჰოლოზეუმი – ვან გოგის ციფრული გამოფენა (საბავშვო – 15 წლამდე)',
        price: 15
      }
    };
  }

  private init(): void {
    this.bindProductCardEvents();
    this.trackPageView();
  }

  private bindProductCardEvents(): void {
    // Add click handlers to product cards
    document.querySelectorAll('.product-card').forEach(card => {
      card.addEventListener('click', (e) => {
        const target = e.target as HTMLElement;
        const productCard = target.closest('.product-card') as HTMLElement;
        
        if (productCard) {
          const ticketType = this.extractTicketTypeFromCard(productCard);
          if (ticketType) {
            this.handleTicketPurchase(ticketType);
          }
        }
      });
    });

    // Also handle direct onclick attributes (for backwards compatibility)
    (window as any).buyTicket = (ticketType: string) => {
      this.handleTicketPurchase(ticketType);
    };
  }

  private extractTicketTypeFromCard(card: HTMLElement): string | null {
    // Try to get from onclick attribute
    const onclickAttr = card.getAttribute('onclick');
    if (onclickAttr) {
      const match = onclickAttr.match(/buyTicket\('([^']+)'\)/);
      if (match) {
        return match[1];
      }
    }

    // Try to get from data attribute
    return card.dataset.ticketType || null;
  }

  public handleTicketPurchase(ticketType: string): void {
    const ticket = this.tickets[ticketType];
    
    if (!ticket) {
      console.error('Unknown ticket type:', ticketType);
      this.analytics.trackError(`Unknown ticket type: ${ticketType}`, 'shop_page');
      return;
    }

    try {
      // Store selected ticket in session storage
      this.paymentManager.storeSelectedTicket(ticket);
      
      // Track purchase attempt
      this.analytics.trackTicketPurchase(ticket.name, ticket.price);
      
      // Redirect to booking page
      window.location.href = '/shekveta';
      
    } catch (error) {
      console.error('Failed to handle ticket purchase:', error);
      this.analytics.trackError(
        `Ticket purchase failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
        'shop_page'
      );
    }
  }

  private trackPageView(): void {
    this.analytics.trackPageView('Shop - ბილეთების მაღაზია');
  }

  // Public method to get all available tickets
  public getAvailableTickets(): TicketData {
    return { ...this.tickets };
  }

  // Public method to get specific ticket info
  public getTicketInfo(ticketType: string): TicketInfo | null {
    return this.tickets[ticketType] || null;
  }

  // Method to update ticket prices (for future dynamic pricing)
  public updateTicketPrice(ticketType: string, newPrice: number): void {
    if (this.tickets[ticketType]) {
      this.tickets[ticketType].price = newPrice;
      this.updatePriceDisplay(ticketType, newPrice);
    }
  }

  private updatePriceDisplay(ticketType: string, newPrice: number): void {
    // Update price display in the UI if elements exist
    const priceElements = document.querySelectorAll(`[data-ticket="${ticketType}"] .product-price`);
    priceElements.forEach(element => {
      element.textContent = `${newPrice}₾`;
    });
  }

  // Destroy method for cleanup
  public destroy(): void {
    // Remove global function
    delete (window as any).buyTicket;
  }
}