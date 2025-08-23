# უსაფრთხო მიგრაციის ინსტრუქცია 🔐

## 📋 მიგრაციის ნაბიჯები

### 1. დამატებითი Dependency-ები
```bash
# Museum space ფოლდერში შედი
cd "C:\Users\user\Desktop\Museum space"

# დაამატე validator library
npm init -y  # თუ package.json არ არსებობს
npm install validator
```

### 2. უსაფრთხო ფაილების კოპირება
```bash
# ძველი ფაილების backup
cp api/unipay-callback.js api/unipay-callback-old.js
cp api/unipay-create-order.js api/unipay-create-order-old.js

# უსაფრთხო ვერსიების კოპირება
cp "../Museum_Security_Backup/api_secure/unipay-callback-secure.js" "api/unipay-callback.js"
cp "../Museum_Security_Backup/api_secure/unipay-create-order-secure.js" "api/unipay-create-order.js"
```

### 3. Environment Variables შემოწმება
```bash
# .env ფაილში უნდა იყოს:
UNIPAY_MERCHANT_ID=5015191030581
UNIPAY_API_KEY=bc6f5073-6d1c-4abe-8456-1bb814077f6e

# Vercel Dashboard-შიც უნდა იყოს ეს ცვლადები დაყენებული!
```

### 4. Test და Deploy
```bash
# ცვლილებების commit
git add .
git commit -m "security: implement secure API endpoints

- Fixed CORS wildcard vulnerability
- Removed sensitive data logging  
- Added input validation and sanitization
- Improved error handling"

# Push to trigger deployment
git push origin master
```

## 🔍 რა შეიცვალა

### ✅ უსაფრთხოების გაუმჯობესებები

#### CORS Policy ფიქსი:
```javascript
// ძველი (საშიში):
res.setHeader('Access-Control-Allow-Origin', '*');

// ახალი (უსაფრთხო):
const allowedOrigins = ['https://museum-space-b10.vercel.app'];
// მხოლოდ შენი საიტი შეძლებს API-ს მიმართვას
```

#### Sensitive Data Logging-ის მოშორება:
```javascript
// ძველი (საშიში):
console.log('Starting UniPay payment for:', { firstName, lastName, phone, amount });

// ახალი (უსაფრთხო):
console.log('Payment initiated:', { orderId, amount, timestamp });
// პირადი ინფორმაცია აღარ იბეჭდება
```

#### Input Validation დამატება:
```javascript
// ახალი უსაფრთხოება:
const sanitizeInput = {
  name: (input) => validator.escape(input.trim()),
  phone: (input) => input.replace(/[^\d+]/g, ''),
  amount: (input) => Math.round(parseFloat(input) * 100) / 100
};
```

### 🔧 ტექნიკური გაუმჯობესებები

1. **მოდულარული კოდი** - ფუნქციები დანაწევრებულია
2. **კონსტანტები** - hardcoded values-ები გატანილია ცალკე
3. **ერორ ჰენდლინგი** - უკეთესი error messages
4. **ვალიდაცია** - ყველა input ჩეკდება უსაფრთხოებაზე

## ⚠️ მნიშვნელოვანი

### ტესტირება მიგრაციის შემდეგ:
1. **Payment flow** - სრული გადახდის პროცესი ამოწმე
2. **Error handling** - არასწორი inputs ტესტირება  
3. **CORS** - მხოლოდ შენი საიტიდან API მუშაობს
4. **Logs** - პირადი ინფორმაცია აღარ ჩანს logs-ში

### უსაფრთხოების შემოწმება:
```bash
# CORS ტესტი - ეს უნდა ჩავარდეს:
curl -X POST http://evil-site.com/test-cors

# Rate limiting ტესტი (მომავალში დაემატება):
# for i in {1..20}; do curl -X POST your-api; done
```

## 📞 Support

### თუ რამე პრობლემა შექმნილია:

1. **Rollback**: 
```bash
cp api/unipay-callback-old.js api/unipay-callback.js
cp api/unipay-create-order-old.js api/unipay-create-order.js
```

2. **ლოგების შემოწმება**: Vercel Dashboard → Functions → Logs

3. **UniPay ტესტი**: მცირე თანხით (1 ლარი) სცადე გადახდა

## ✅ მიგრაციის წარმატების კრიტერიუმები

- [ ] Payment flow მუშაობს
- [ ] Logs-ში პირადი ინფორმაცია არ ჩანს  
- [ ] CORS მხოლოდ შენი domain-დან მუშაობს
- [ ] Input validation ბლოკავს მავნე inputs-ს
- [ ] UniPay callback მუშაობს წინანდელი ალგორითმით

---

**შემდეგი ნაბიჯი**: თუ ყველაფერი მუშაობს, შემდეგი security features დავამატოთ (rate limiting, webhook verification).