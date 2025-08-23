# Refactor Suggestions (PENDING REVIEW)

## 1. Extract Constants (Needs Review)

### Problem
Hardcoded values scattered throughout the codebase make maintenance difficult.

### Suggested Solution
Create a constants file:

```javascript
// constants.js
module.exports = {
  UNIPAY: {
    AUTH_URL: 'https://apiv2.unipay.com/v3/auth',
    ORDER_URL: 'https://apiv2.unipay.com/v3/api/order/create',
    CURRENCY: 'GEL',
    LANGUAGE: 'GE'
  },
  DEFAULTS: {
    TICKET_PRICE: 10.0,
    TICKET_TYPE: 'ბილეთი',
    ORDER_PREFIX: 'MS'
  },
  DOMAIN: 'https://museum-space-b10.vercel.app'
};
```

### Files to Update
- `api/unipay-create-order.js` - Replace hardcoded URLs and values
- `config.js` - Use constants for domain

---

## 2. Break Down Large Functions (Needs Review)

### Problem
`unipay-create-order.js` is 149 lines with multiple responsibilities.

### Suggested Solution
Split into smaller, focused functions:

```javascript
// api/unipay-create-order.js (refactored)
const { authenticateWithUnipay } = require('./utils/unipay-auth');
const { generateOrderId, createOrderData } = require('./utils/order-utils');
const { validateInput, setCorsHeaders } = require('./utils/api-utils');

module.exports = async (req, res) => {
  setCorsHeaders(res, 'https://museum-space-b10.vercel.app');
  
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const { firstName, lastName, phone, amount = 10.0, ticketType = 'ბილეთი' } = req.body;
  
  const validationError = validateInput({ firstName, lastName, phone });
  if (validationError) return res.status(400).json(validationError);

  try {
    const accessToken = await authenticateWithUnipay();
    const orderId = generateOrderId();
    const orderData = createOrderData({ firstName, lastName, phone, amount, ticketType, orderId });
    
    const paymentUrl = await createUnipayOrder(orderData, accessToken);
    
    return res.status(200).json({
      success: true,
      orderId,
      paymentUrl,
      amount,
      currency: 'GEL'
    });
  } catch (error) {
    console.error('Payment creation error:', error);
    return res.status(500).json({ 
      error: 'Payment system error',
      details: error.message 
    });
  }
};
```

### New Utility Files Needed
- `utils/unipay-auth.js` - Authentication logic
- `utils/order-utils.js` - Order generation and data creation
- `utils/api-utils.js` - Common API utilities

---

## 3. Standardize Error Handling (Needs Review)

### Problem
Inconsistent error response formats across endpoints.

### Suggested Solution
Create a standard error handler:

```javascript
// utils/error-handler.js
const createErrorResponse = (type, message, details = null, statusCode = 500) => ({
  error: {
    type,
    message,
    details,
    timestamp: new Date().toISOString()
  }
});

const handleApiError = (res, error, defaultMessage = 'Internal server error') => {
  console.error('API Error:', error);
  
  if (error.name === 'ValidationError') {
    return res.status(400).json(createErrorResponse('validation', error.message, error.details, 400));
  }
  
  if (error.name === 'UnipayError') {
    return res.status(503).json(createErrorResponse('payment', 'Payment service unavailable', error.message, 503));
  }
  
  return res.status(500).json(createErrorResponse('server', defaultMessage, error.message, 500));
};

module.exports = { createErrorResponse, handleApiError };
```

### Files to Update
- `api/unipay-callback.js` - Use standard error responses
- `api/unipay-create-order.js` - Use standard error responses

---

## 4. Add Input Validation (Needs Review)

### Problem
Limited validation on user inputs, potential security risk.

### Suggested Solution
Create comprehensive validation:

```javascript
// utils/validators.js
const validatePhone = (phone) => {
  const phoneRegex = /^(\+995|995)?[0-9]{9}$/;
  return phoneRegex.test(phone.replace(/\s/g, ''));
};

const validateName = (name) => {
  return name && name.trim().length >= 2 && name.trim().length <= 50;
};

const validateAmount = (amount) => {
  const num = parseFloat(amount);
  return !isNaN(num) && num > 0 && num <= 1000;
};

const sanitizeString = (str) => {
  if (typeof str !== 'string') return '';
  return str.trim().replace(/<[^>]*>?/gm, ''); // Remove HTML tags
};

const validateOrderInput = ({ firstName, lastName, phone, amount }) => {
  const errors = [];
  
  if (!validateName(firstName)) errors.push('Invalid first name');
  if (!validateName(lastName)) errors.push('Invalid last name');
  if (!validatePhone(phone)) errors.push('Invalid phone number');
  if (amount && !validateAmount(amount)) errors.push('Invalid amount');
  
  return errors.length > 0 ? { error: 'Validation failed', details: errors } : null;
};

module.exports = { validatePhone, validateName, validateAmount, sanitizeString, validateOrderInput };
```

### Files to Update
- `api/unipay-create-order.js` - Add comprehensive validation
- `simple-booking.html` - Add client-side validation

---

## 5. Extract Response Helpers (Needs Review)

### Problem
Duplicate response formatting code across endpoints.

### Suggested Solution
Create response utilities:

```javascript
// utils/response-helpers.js
const createSuccessResponse = (data, message = 'Success') => ({
  success: true,
  message,
  data,
  timestamp: new Date().toISOString()
});

const createCallbackResponse = (orderId, processed = true) => ({
  success: true,
  message: 'OK',
  orderId,
  processed,
  timestamp: new Date().toISOString()
});

const createPaymentResponse = ({ orderId, paymentUrl, unipayOrderId, unipayOrderHashId, amount, currency }) => ({
  success: true,
  orderId,
  paymentUrl,
  unipayOrderId,
  unipayOrderHashId,
  amount,
  currency
});

module.exports = { createSuccessResponse, createCallbackResponse, createPaymentResponse };
```

---

## 6. Environment Configuration (Needs Review)

### Problem
Environment detection in `config.js` is browser-based and unreliable.

### Suggested Solution
Improve environment detection:

```javascript
// config.js (improved)
class Config {
  constructor() {
    this.config = {};
    this.loadConfig();
  }

  loadConfig() {
    // More reliable environment detection
    const isDevelopment = this.detectEnvironment();
    
    this.config = {
      SITE_URL: this.getSiteUrl(isDevelopment),
      ENVIRONMENT: isDevelopment ? 'development' : 'production',
      ...this.getContactConfig()
    };
  }

  detectEnvironment() {
    // Check multiple indicators
    if (typeof window === 'undefined') return false; // Server-side
    
    const hostname = window.location.hostname;
    const isLocalhost = hostname === 'localhost' || hostname === '127.0.0.1' || hostname === '';
    const hasDevPort = window.location.port && ['3000', '3001', '8000', '8080'].includes(window.location.port);
    
    return isLocalhost || hasDevPort;
  }

  getSiteUrl(isDevelopment) {
    if (isDevelopment && typeof window !== 'undefined') {
      return `${window.location.protocol}//${window.location.host}`;
    }
    return 'https://museum-space-b10.vercel.app';
  }

  getContactConfig() {
    return {
      CONTACT_EMAIL: 'betlemi.museum@gmail.com',
      CONTACT_PHONE: '+995 32 2 123 456',
      COMPANY_NAME: 'შპს სამუზეუმო სივრცე',
      ADDRESS: 'ბეთლემის ქუჩა 10N, სოლოლაკი, თბილისი'
    };
  }

  // ... rest of methods remain the same
}
```

---

## Implementation Priority

### High Priority (Should implement)
1. **Extract Constants** - Easy win, improves maintainability
2. **Standardize Error Handling** - Critical for debugging
3. **Add Input Validation** - Security and reliability

### Medium Priority (Good to have)
4. **Break Down Large Functions** - Improves code readability
5. **Extract Response Helpers** - Reduces code duplication

### Low Priority (Optional)
6. **Environment Configuration** - Current solution works, but improvement would be nice

## Review Notes

- All suggested changes maintain existing functionality
- Changes are backwards compatible
- Each refactor can be implemented independently
- Tests should be added after refactoring to ensure functionality is preserved