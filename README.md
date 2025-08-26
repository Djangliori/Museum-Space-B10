# Museum Space B10 - Georgian Museum Ticket Booking System

🏛️ **Live Site**: https://betlemi10.com

## 🚀 Quick Deploy

This is a static HTML/CSS/JavaScript application with Vercel serverless functions for payment processing.

### Automatic Deployment
```bash
# Use automated scripts:
.\auto-deploy-complete.bat     # Windows
.\auto-deploy-complete.ps1     # PowerShell
```

### Manual Deployment  
```bash
git add -A
git commit -m "Update"
git push
# Vercel auto-deploys in ~1-2 minutes
```

## 🧪 Testing & Development

### API Testing
- **Test Environment**: https://betlemi10.com/test-unipay.html
- **Main Site**: https://betlemi10.com
- **Shop**: https://betlemi10.com/biletebi
- **Booking**: https://betlemi10.com/shekveta

### Local Development
```bash
# Simple HTTP server
npm start
# Or
python -m http.server 3000
```

## 🔧 Technical Stack

- **Frontend**: HTML5, CSS3, JavaScript (ES6+)
- **Backend**: Vercel Serverless Functions (Node.js)
- **Payment**: UniPay API Integration
- **Hosting**: Vercel with GitHub integration
- **Domain**: betlemi10.com

## 📁 Project Structure

```
├── index.html              # Homepage
├── shop.html              # Ticket selection  
├── simple-booking.html    # Booking form
├── payment-success.html   # Success page
├── payment-cancel.html    # Cancel page
├── terms.html            # Terms & conditions
├── test-unipay.html      # API testing interface
├── api/
│   ├── unipay-create-order-production.js  # Order creation
│   ├── unipay-callback-production.js      # Payment webhook  
│   └── test-env.js                        # Environment test
├── vercel.json           # Deployment config
└── package.json          # Dependencies
```

## ⚙️ Configuration

### Environment Variables (Vercel Dashboard)
- `UNIPAY_MERCHANT_ID`: 5015191030581
- `UNIPAY_API_KEY`: [Your API Key]

### Build Settings
- **Build Command**: None (Static site)
- **Output Directory**: `./` (Root)
- **Node Version**: 18.x

## 🎫 Features

### Ticket Types
- კომბო ბილეთი (ზრდასრული/სტუდენტი)
- ილუზიების მუზეუმი (ზრდასრული/სტუდენტი)  
- ჰოლოზეუმი (ზრდასრული/სტუდენტი)

### Payment Integration
- UniPay API v3
- Secure order generation
- Webhook callbacks
- Success/cancel handling

## 🛠️ Development Notes

### Static Site Configuration
This project is configured as a static site with serverless functions:
- No build process required
- Direct file serving
- API endpoints in `/api/` directory

### Deployment Process
1. GitHub push triggers Vercel deployment
2. Static files served directly
3. API functions deployed as serverless
4. Environment variables injected at runtime

### Troubleshooting
- **404 API Errors**: Check vercel.json functions configuration
- **Environment Issues**: Use test-unipay.html for diagnosis
- **Payment Errors**: Verify UniPay API credentials

## 📞 Support

- **Repository**: https://github.com/Djangliori/Museum-Space-B10
- **Live Site**: https://betlemi10.com  
- **API Test**: https://betlemi10.com/test-unipay.html

---

*Generated and maintained with Claude Code assistance* 🤖