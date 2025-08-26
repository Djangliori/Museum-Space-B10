export class AnalyticsManager {
    constructor(analyticsId = 'G-XXXXXXXXXX') {
        this.analyticsId = analyticsId;
        this.gtag = window.gtag;
        this.initializeAnalytics();
    }
    initializeAnalytics() {
        // Initialize dataLayer if it doesn't exist
        window.dataLayer = window.dataLayer || [];
        // Create gtag function if it doesn't exist
        if (!window.gtag) {
            window.gtag = function (...args) {
                window.dataLayer.push(arguments);
            };
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
    trackCTAClick(label, location = 'unknown') {
        this.gtag('event', 'click', {
            event_category: 'CTA',
            event_label: `${location} - ${label}`,
            page_location: window.location.href
        });
    }
    // Track ticket purchases
    trackTicketPurchase(ticketName, price) {
        this.gtag('event', 'click', {
            event_category: 'Ticket Purchase',
            event_label: ticketName,
            value: price,
            currency: 'GEL'
        });
    }
    // Track successful payments
    trackPurchaseComplete(orderId, value = 10.00) {
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
    trackPurchaseCancelled(orderId, value = 10.00) {
        this.gtag('event', 'purchase_cancelled', {
            transaction_id: orderId,
            value: value,
            currency: 'GEL'
        });
    }
    // Track form interactions
    trackFormInteraction(formName, action) {
        this.gtag('event', action, {
            event_category: 'Form',
            event_label: formName,
            page_location: window.location.href
        });
    }
    // Track page views
    trackPageView(pageTitle) {
        this.gtag('config', this.analyticsId, {
            page_title: pageTitle || document.title,
            page_location: window.location.href
        });
    }
    // Track errors
    trackError(errorMessage, errorLocation) {
        this.gtag('event', 'exception', {
            description: errorMessage,
            fatal: false,
            custom_parameter: errorLocation
        });
    }
}
//# sourceMappingURL=analytics.js.map