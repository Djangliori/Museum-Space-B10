# 🚀 სწრაფი უსაფრთხოების ჩართვა

## 📁 რა გაქვს ახლა:

```
Museum space/
├── api/
│   ├── unipay-callback.js           ← ძველი (საშიში)
│   ├── unipay-create-order.js       ← ძველი (საშიში)
│   └── secure/
│       ├── unipay-callback-secure.js    ← ✅ უსაფრთხო
│       └── unipay-create-order-secure.js ← ✅ უსაფრთხო
├── node_modules/                    ← ✅ validator დაინსტალირდა
├── package.json                     ← ✅ dependencies
└── QUICK_SECURITY_SWITCH.md         ← ეს ფაილი
```

## ⚡ **30 წამში უსაფრთხოება ჩართვა:**

### Windows Command Prompt:
```cmd
cd "C:\Users\user\Desktop\Museum space"

# 1. Backup ძველი ფაილების
copy api\unipay-callback.js api\unipay-callback-OLD.js
copy api\unipay-create-order.js api\unipay-create-order-OLD.js

# 2. უსაფრთხო ვერსიების ჩამატება
copy api\secure\unipay-callback-secure.js api\unipay-callback.js
copy api\secure\unipay-create-order-secure.js api\unipay-create-order.js

# 3. Deploy
git add .
git commit -m "security: enable secure API endpoints"
git push origin master
```

### Git Bash (თუ Git Bash იყენებ):
```bash
cd "/c/Users/user/Desktop/Museum space"

# 1. Backup
cp api/unipay-callback.js api/unipay-callback-OLD.js
cp api/unipay-create-order.js api/unipay-create-order-OLD.js

# 2. Switch to secure
cp api/secure/unipay-callback-secure.js api/unipay-callback.js
cp api/secure/unipay-create-order-secure.js api/unipay-create-order.js

# 3. Deploy
git add .
git commit -m "security: enable secure API endpoints"
git push origin master
```

## 🔍 **რა შეიცვალება:**

### ✅ Security Fixes:
- **CORS**: მხოლოდ შენი საიტი შეძლებს API-ზე წვდომას
- **No Personal Data**: სახელები/ტელეფონები აღარ იბეჭდება logs-ში
- **Input Validation**: user inputs მოწმდება attacks-ის წინააღმდეგ
- **Better Errors**: error messages გაუმჯობესებული

### 🔄 **Rollback თუ რამე არ მუშაობს:**
```cmd
cd "C:\Users\user\Desktop\Museum space"
copy api\unipay-callback-OLD.js api\unipay-callback.js
copy api\unipay-create-order-OLD.js api\unipay-create-order.js
git add .
git commit -m "rollback: revert to previous version"
git push origin master
```

## ✅ **შემოწმება Deploy-ის შემდეგ:**

1. **2-3 წუთის შემდეგ** ამოწმე: https://museum-space-b10.vercel.app/api/unipay-callback
2. **უნდა მიიღო**: `{"error":"Method not allowed"}` (ეს კარგია!)
3. **Payment Test**: `/simple-booking.html` გვერდზე სცადე გადახდა

## 🎯 **გაკეთდა!**

- ✅ **Validator** დაინსტალირდა
- ✅ **უსაფრთხო ფაილები** შენს ფოლდერშია
- ✅ **1-ლაინერი switch** command მზადაა
- ✅ **Backup** ყველაფრისა მზადაა

**ახლა უბრალოდ commands გაუშვი და 30 წამში მზადაა! 🚀**