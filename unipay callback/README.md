# UniPay Integration - სამუზეუმო სივრცე B10

## 📋 ფაილების აღწერა

### API ფუნქციები:
- **unipay-create-order.js** - შეკვეთის შექმნა და UniPay checkout URL-ის მიღება
- **unipay-callback.js** - გადახდის სტატუსის callback handler

### HTML გვერდები:
- **simple-booking.html** - ძირითადი ბუკინგის ფორმა UniPay integration-ით
- **payment-success.html** - წარმატებული გადახდის გვერდი  
- **payment-cancel.html** - გაუქმებული გადახდის გვერდი

## 🚀 როგორ გამოვიყენოთ:

### 1. API ფაილების deployment:
```bash
# ფაილები უნდა იყოს api/ ფოლდერში Vercel project-ში
api/
├── unipay-create-order.js
└── unipay-callback.js
```

### 2. HTML ფაილები:
```bash
# ფაილები უნდა იყოს root directory-ში
├── simple-booking.html      (მთავარი ბუკინგის ფორმა)
├── payment-success.html     (success redirect)
└── payment-cancel.html      (cancel redirect)
```

### 3. Environment Variables (.env):
```
UNIPAY_MERCHANT_ID=5015191030581
UNIPAY_API_KEY=bc6f5073-6d1c-4abe-8456-1bb814077f6e
```

## 🔗 URL-ები:
- **ბუკინგი**: `/simple-booking.html`
- **წარმატება**: `/payment-success.html?order=MS-xxxxx`
- **გაუქმება**: `/payment-cancel.html?order=MS-xxxxx`
- **Callback**: `/api/unipay-callback` (UniPay-სთვის)

## ✅ სტატუსი:
- Authentication: ✅ მზად
- Order Creation: ✅ მზად  
- Callback Handler: ✅ მზად
- Success/Cancel Pages: ✅ მზად
- Integration: ✅ მზად

თარიღი: 2025-08-23