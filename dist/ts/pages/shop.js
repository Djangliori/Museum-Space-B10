export class ShopPage {
    constructor(analytics, paymentManager) {
        this.analytics = analytics;
        this.paymentManager = paymentManager;
        this.tickets = this.initializeTickets();
        this.init();
    }
    initializeTickets() {
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
    init() {
        this.bindProductCardEvents();
        this.trackPageView();
    }
    bindProductCardEvents() {
        // Add click handlers to product cards
        document.querySelectorAll('.product-card').forEach(card => {
            card.addEventListener('click', (e) => {
                const target = e.target;
                const productCard = target.closest('.product-card');
                if (productCard) {
                    const ticketType = this.extractTicketTypeFromCard(productCard);
                    if (ticketType) {
                        this.handleTicketPurchase(ticketType);
                    }
                }
            });
        });
        // Also handle direct onclick attributes (for backwards compatibility)
        window.buyTicket = (ticketType) => {
            this.handleTicketPurchase(ticketType);
        };
    }
    extractTicketTypeFromCard(card) {
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
    handleTicketPurchase(ticketType) {
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
        }
        catch (error) {
            console.error('Failed to handle ticket purchase:', error);
            this.analytics.trackError(`Ticket purchase failed: ${error instanceof Error ? error.message : 'Unknown error'}`, 'shop_page');
        }
    }
    trackPageView() {
        this.analytics.trackPageView('Shop - ბილეთების მაღაზია');
    }
    // Public method to get all available tickets
    getAvailableTickets() {
        return { ...this.tickets };
    }
    // Public method to get specific ticket info
    getTicketInfo(ticketType) {
        return this.tickets[ticketType] || null;
    }
    // Method to update ticket prices (for future dynamic pricing)
    updateTicketPrice(ticketType, newPrice) {
        if (this.tickets[ticketType]) {
            this.tickets[ticketType].price = newPrice;
            this.updatePriceDisplay(ticketType, newPrice);
        }
    }
    updatePriceDisplay(ticketType, newPrice) {
        // Update price display in the UI if elements exist
        const priceElements = document.querySelectorAll(`[data-ticket="${ticketType}"] .product-price`);
        priceElements.forEach(element => {
            element.textContent = `${newPrice}₾`;
        });
    }
    // Destroy method for cleanup
    destroy() {
        // Remove global function
        delete window.buyTicket;
    }
}
//# sourceMappingURL=shop.js.map