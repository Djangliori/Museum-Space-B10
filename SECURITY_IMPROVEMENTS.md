# Security Improvements (PENDING REVIEW)

## 1. Fix CORS Configuration (CRITICAL)

### Problem
Wildcard CORS policy in callback endpoint allows any origin:
```javascript
res.setHeader('Access-Control-Allow-Origin', '*');
```

### Security Risk
- Allows malicious websites to make requests to your API
- Potential for CSRF attacks
- Data exposure to unauthorized domains

### Suggested Fix
```javascript
// api/unipay-callback.js
const allowedOrigins = [
  'https://museum-space-b10.vercel.app',
  'https://museum-space-b10.vercel.app',
  // Add any additional trusted domains
];

const setCorsHeaders = (req, res) => {
  const origin = req.headers.origin;
  
  if (allowedOrigins.includes(origin)) {
    res.setHeader('Access-Control-Allow-Origin', origin);
  }
  
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  res.setHeader('Access-Control-Allow-Credentials', 'false');
};
```

---

## 2. Remove Sensitive Data Logging (HIGH PRIORITY)

### Problem
Payment details and personal information logged to console:

```javascript
// CURRENT - INSECURE
console.log('UniPay callback received:', {
  method: req.method,
  userAgent: req.headers['user-agent'],
  ip: req.headers['x-forwarded-for'] || req.connection.remoteAddress,
  body: req.body  // ← Contains sensitive payment data
});

console.log('Starting UniPay payment for:', { firstName, lastName, phone, amount });
```

### Security Risk
- Personal data (names, phone numbers) exposed in logs
- Payment details logged and potentially stored
- GDPR compliance issues
- Log aggregation services may expose sensitive data

### Suggested Fix
```javascript
// utils/secure-logger.js
const createSecureLogger = () => {
  const maskSensitiveData = (data) => {
    const sensitive = ['CardNumber', 'AuthCode', 'RRN', 'phone', 'firstName', 'lastName'];
    const masked = { ...data };
    
    sensitive.forEach(field => {
      if (masked[field]) {
        if (field === 'CardNumber') {
          masked[field] = `****-****-****-${masked[field].slice(-4)}`;
        } else if (field === 'phone') {
          masked[field] = `****${masked[field].slice(-3)}`;
        } else {
          masked[field] = '***REDACTED***';
        }
      }
    });
    
    return masked;
  };

  const logPaymentCallback = (data) => {
    console.log('Payment callback received:', {
      orderId: data.MerchantOrderID,
      status: data.Status,
      amount: data.Amount,
      currency: data.Currency,
      timestamp: new Date().toISOString()
    });
  };

  const logPaymentStart = (data) => {
    console.log('Payment initiated:', {
      orderId: data.orderId,
      amount: data.amount,
      timestamp: new Date().toISOString()
    });
  };

  return { logPaymentCallback, logPaymentStart, maskSensitiveData };
};

module.exports = createSecureLogger;
```

---

## 3. Add Input Sanitization (HIGH PRIORITY)

### Problem
User inputs not properly validated or sanitized before processing.

### Security Risk
- SQL injection (if database is added later)
- XSS attacks through stored data
- Data corruption
- Invalid data causing application errors

### Suggested Fix
```javascript
// utils/input-sanitizer.js
const validator = require('validator'); // npm install validator

const sanitizeInput = {
  name: (input) => {
    if (!input || typeof input !== 'string') return null;
    
    // Remove HTML tags, extra spaces, and limit length
    const cleaned = validator.escape(input.trim());
    return cleaned.length >= 2 && cleaned.length <= 50 ? cleaned : null;
  },
  
  phone: (input) => {
    if (!input || typeof input !== 'string') return null;
    
    // Remove all non-digits except +
    const cleaned = input.replace(/[^\d+]/g, '');
    
    // Validate Georgian phone format
    const phoneRegex = /^(\+995|995)?[0-9]{9}$/;
    return phoneRegex.test(cleaned) ? cleaned : null;
  },
  
  amount: (input) => {
    const num = parseFloat(input);
    if (isNaN(num) || num <= 0 || num > 1000) return null;
    
    // Round to 2 decimal places
    return Math.round(num * 100) / 100;
  },
  
  orderId: (input) => {
    if (!input || typeof input !== 'string') return null;
    
    // Only allow alphanumeric, hyphens
    const cleaned = input.replace(/[^a-zA-Z0-9-]/g, '');
    return cleaned.length <= 50 ? cleaned : null;
  }
};

const validateAndSanitize = (data) => {
  const sanitized = {};
  const errors = [];
  
  // Sanitize each field
  Object.keys(data).forEach(key => {
    if (sanitizeInput[key]) {
      sanitized[key] = sanitizeInput[key](data[key]);
      if (sanitized[key] === null) {
        errors.push(`Invalid ${key}`);
      }
    } else {
      sanitized[key] = data[key];
    }
  });
  
  return { sanitized, errors: errors.length > 0 ? errors : null };
};

module.exports = { sanitizeInput, validateAndSanitize };
```

---

## 4. Add Rate Limiting (MEDIUM PRIORITY)

### Problem
No rate limiting on API endpoints allows potential abuse.

### Security Risk
- DDoS attacks
- Brute force attempts
- Resource exhaustion
- Excessive costs from UniPay API calls

### Suggested Fix
```javascript
// utils/rate-limiter.js
const rateLimitStore = new Map();

const rateLimit = (options = {}) => {
  const {
    windowMs = 15 * 60 * 1000, // 15 minutes
    max = 10, // requests per window
    message = 'Too many requests',
    keyGenerator = (req) => req.headers['x-forwarded-for'] || req.connection.remoteAddress
  } = options;

  return (req, res, next) => {
    const key = keyGenerator(req);
    const now = Date.now();
    const windowStart = now - windowMs;
    
    // Clean old entries
    if (rateLimitStore.has(key)) {
      const requests = rateLimitStore.get(key).filter(time => time > windowStart);
      rateLimitStore.set(key, requests);
    } else {
      rateLimitStore.set(key, []);
    }
    
    const requests = rateLimitStore.get(key);
    
    if (requests.length >= max) {
      return res.status(429).json({
        error: 'Rate limit exceeded',
        message,
        retryAfter: Math.ceil(windowMs / 1000)
      });
    }
    
    requests.push(now);
    rateLimitStore.set(key, requests);
    
    if (next) next();
  };
};

// Usage in API endpoints:
// const rateLimiter = rateLimit({ max: 5, windowMs: 60000 }); // 5 requests per minute
```

---

## 5. Add Webhook Signature Verification (HIGH PRIORITY)

### Problem
No verification that callbacks are actually from UniPay.

### Security Risk
- Malicious callbacks can trigger fake payment confirmations
- Attackers can manipulate payment status
- Financial fraud potential

### Suggested Fix
```javascript
// utils/webhook-verifier.js
const crypto = require('crypto');

const verifyUnipaySignature = (payload, signature, secret) => {
  if (!signature || !secret) {
    return false;
  }
  
  // Generate expected signature
  const expectedSignature = crypto
    .createHmac('sha256', secret)
    .update(JSON.stringify(payload))
    .digest('hex');
  
  // Compare signatures using timing-safe comparison
  return crypto.timingSafeEqual(
    Buffer.from(signature, 'hex'),
    Buffer.from(expectedSignature, 'hex')
  );
};

// In callback endpoint:
const verifyCallback = (req, res, next) => {
  const signature = req.headers['x-unipay-signature']; // Check actual header name
  const secret = process.env.UNIPAY_WEBHOOK_SECRET;
  
  if (!verifyUnipaySignature(req.body, signature, secret)) {
    console.warn('Invalid webhook signature:', {
      ip: req.headers['x-forwarded-for'] || req.connection.remoteAddress,
      userAgent: req.headers['user-agent']
    });
    
    return res.status(401).json({ error: 'Invalid signature' });
  }
  
  next();
};

module.exports = { verifyUnipaySignature, verifyCallback };
```

**Note:** Check UniPay documentation for exact signature header name and algorithm.

---

## 6. Environment Variables Security (MEDIUM PRIORITY)

### Problem
No validation that required environment variables are present.

### Suggested Fix
```javascript
// utils/env-validator.js
const requiredEnvVars = [
  'UNIPAY_MERCHANT_ID',
  'UNIPAY_API_KEY',
  'UNIPAY_WEBHOOK_SECRET' // If implementing signature verification
];

const validateEnvironment = () => {
  const missing = requiredEnvVars.filter(varName => !process.env[varName]);
  
  if (missing.length > 0) {
    console.error('Missing required environment variables:', missing);
    process.exit(1);
  }
  
  // Validate format
  if (!/^\d{13}$/.test(process.env.UNIPAY_MERCHANT_ID)) {
    console.error('Invalid UNIPAY_MERCHANT_ID format');
    process.exit(1);
  }
  
  if (!/^[a-f0-9-]{36}$/i.test(process.env.UNIPAY_API_KEY)) {
    console.error('Invalid UNIPAY_API_KEY format');
    process.exit(1);
  }
};

// Call at application startup
module.exports = { validateEnvironment };
```

---

## Implementation Priority

### Critical (Implement Immediately)
1. **Fix CORS Configuration** - Security vulnerability
2. **Remove Sensitive Data Logging** - GDPR/Privacy issue
3. **Add Webhook Signature Verification** - Financial security

### High Priority (Implement Soon)
4. **Add Input Sanitization** - Prevents various attacks
5. **Environment Variables Security** - Application stability

### Medium Priority (Good to Have)
6. **Add Rate Limiting** - Prevents abuse

## Testing Security Improvements

After implementing security fixes:

1. **CORS Testing**: Try accessing from unauthorized domains
2. **Rate Limit Testing**: Make excessive requests
3. **Input Validation Testing**: Send malicious payloads
4. **Signature Verification**: Test with invalid signatures

## Compliance Considerations

- **GDPR**: Remove personal data from logs
- **PCI DSS**: Never log payment card details
- **SOX**: Ensure financial transaction integrity
- **Local Privacy Laws**: Comply with Georgian data protection regulations