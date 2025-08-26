# Museum Space B10 - TypeScript Architecture

This directory contains the TypeScript modules for the Museum Space B10 website, extracted from inline JavaScript in HTML files.

## Project Structure

```
src/ts/
├── main.ts                     # Main entry point and application orchestrator
├── types.ts                    # Global type definitions and interfaces
├── modules/                    # Shared modules and utilities
│   ├── analytics.ts           # Google Analytics wrapper
│   ├── api-client.ts          # UniPay API client and HTTP utilities
│   ├── navigation.ts          # Mobile/desktop navigation handling
│   ├── payment.ts             # Payment processing and UniPay integration
│   ├── smooth-scroll.ts       # Custom smooth scrolling implementation
│   └── ui-helpers.ts          # Common UI utilities (FAQ, toggles, etc.)
└── pages/                     # Page-specific functionality
    ├── shop.ts                # Shopping cart and ticket selection
    ├── booking.ts             # Form validation and booking system
    └── test-unipay.ts         # API testing interface
```

## Module Overview

### Core Modules (`/modules/`)

#### `analytics.ts` - Google Analytics Management
- Wraps Google Analytics gtag functionality
- Tracks CTA clicks, purchases, form interactions
- Handles conversion tracking and error logging
- Type-safe event tracking with Georgian localization

#### `api-client.ts` - API Communication
- Centralized HTTP client for UniPay API
- Environment testing and configuration validation
- Payment order creation and status tracking
- Error handling and network resilience

#### `navigation.ts` - Navigation System
- Mobile menu open/close functionality
- Smooth scroll integration for navigation links
- Accessibility support (ARIA attributes, keyboard nav)
- Body scroll lock during mobile menu display

#### `payment.ts` - Payment Processing
- UniPay integration and payment flow management
- Order ID generation and URL parameter handling
- Session storage management for ticket selection
- Payment success/cancel page handling

#### `smooth-scroll.ts` - Smooth Scrolling
- Custom easing function for smooth animations
- Header offset calculation for proper positioning
- Reduced motion preference support
- Mobile-specific timing adjustments

#### `ui-helpers.ts` - UI Utilities
- FAQ accordion functionality
- Pricing toggle interactions
- Back-to-top button behavior
- Lazy image loading with Intersection Observer
- Form validation helpers and loading states

### Page-Specific Modules (`/pages/`)

#### `shop.ts` - Shopping Page
- Product card click handling
- Ticket type mapping and pricing
- Session storage integration
- Analytics tracking for purchase attempts

#### `booking.ts` - Booking System
- Real-time form validation
- Step indicator management
- Payment method selection
- UniPay integration for card payments
- Bank transfer instruction display

#### `test-unipay.ts` - API Testing
- Environment variable validation
- Test payment creation
- API response display and formatting
- Development/production environment handling

## Type Safety

### `types.ts` - Type Definitions
- DOM element interfaces with error handling
- Google Analytics function signatures
- API request/response types
- Form validation result types
- Payment flow data structures

## Key Features

### 🔒 **Type Safety**
- Comprehensive TypeScript types for all modules
- Strict null checks and error handling
- Interface definitions for API responses and form data

### 🌐 **Internationalization**
- Georgian language support throughout
- Localized date formatting
- Currency formatting for Georgian Lari (₾)

### ♿ **Accessibility**
- ARIA attributes for interactive elements
- Keyboard navigation support
- Focus management for mobile menu
- Screen reader friendly error messages

### 📱 **Mobile Optimization**
- Touch-friendly navigation
- Mobile-specific scroll timing
- Responsive form validation
- Mobile menu with overlay and body scroll lock

### 🚀 **Performance**
- Lazy image loading with Intersection Observer
- Reduced motion preference respect
- Efficient event delegation
- Memory leak prevention with cleanup methods

### 🔍 **Analytics Integration**
- Comprehensive event tracking
- Conversion funnel monitoring
- Error tracking and debugging
- Custom parameters for Georgian content

## Usage

### Development
```bash
# Install dependencies
npm install

# Start development with watch mode
npm run dev

# Type checking only
npm run type-check
```

### Production Build
```bash
# Clean previous build
npm run clean

# Build TypeScript files
npm run build
```

### Integration
The compiled JavaScript files should be included in HTML pages as ES modules:

```html
<script type="module" src="/dist/main.js"></script>
```

## Migration Notes

### Extracted JavaScript Functionality

**From `index.html`:**
- Smooth scrolling for navigation links
- Mobile menu handling
- FAQ accordion functionality
- Pricing toggle for museum spaces
- Back-to-top button
- Google Analytics integration

**From `shop.html`:**
- Product card click handling
- Ticket selection and storage
- Redirect to booking page
- Analytics tracking for purchases

**From `simple-booking.html`:**
- Complex form validation system
- Real-time field validation
- Payment method selection
- UniPay API integration
- Step indicator management
- Success/error message handling

**From `test-unipay.html`:**
- Environment variable testing
- API endpoint testing
- Payment creation testing
- Response formatting and display

**From `payment-success.html` & `payment-cancel.html`:**
- URL parameter extraction
- Date formatting in Georgian
- Analytics event tracking
- Order display updates

**From `terms.html`:**
- Scroll-to-top functionality
- Intersection Observer animations
- Print support (Ctrl+P)

## Error Handling

All modules include comprehensive error handling:
- Network request failures
- DOM element not found scenarios
- Malformed API responses
- Session storage unavailability
- Analytics tracking failures

## Browser Compatibility

- Modern browsers supporting ES2020
- Graceful degradation for older browsers
- Intersection Observer polyfill fallbacks
- Reduced motion preference support

## Security

- URL validation for payment redirects
- Input sanitization for form data
- Safe DOM manipulation
- XSS prevention in dynamic content

## Maintenance

Each module includes:
- Cleanup/destroy methods for memory management
- Console logging for debugging
- Error tracking through analytics
- Performance monitoring capabilities