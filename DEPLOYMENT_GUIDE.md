# Museum Space B10 - Automated Deployment Guide

## 🚀 Overview

This guide provides complete automation for deploying the Museum Space B10 project to Vercel with multiple deployment strategies and full environment management.

**Project Details:**
- **Repository**: https://github.com/Djangliori/Museum-Space-B10.git
- **Production URL**: https://betlemi10.com
- **Technology**: Static HTML + Vercel Serverless Functions
- **Payment Integration**: Unipay API

---

## 📋 Quick Start

### 1. One-Click Deployment
```batch
# Windows Batch - Simplest option
quick-deploy.bat
```

### 2. Advanced Deployment
```powershell
# PowerShell - Full featured
.\deploy.ps1
```

### 3. Force Deployment (No Changes)
```powershell
# Deploy even without code changes
.\force-deploy.ps1 -Production
```

---

## 🛠 Installation & Setup

### Prerequisites
```bash
# Install Vercel CLI globally
npm install -g vercel

# Login to Vercel (run once)
vercel login

# Link project (run once in project directory)
vercel link --yes
```

### Verify Installation
```bash
vercel --version  # Should show version 46.0.1 or newer
vercel ls         # Should show your projects
```

---

## 🎯 Deployment Methods

### Method 1: Universal Deployment Script

The master deployment script with multiple modes:

```powershell
# Basic deployment
.\deploy.ps1

# Quick production deployment
.\deploy.ps1 -Mode quick -Production

# Force deployment without changes
.\deploy.ps1 -Mode force -Production -Silent

# Environment variables only
.\deploy.ps1 -Mode env-only

# Test current deployment
.\deploy.ps1 -Mode test
```

**Available Modes:**
- `auto` - Standard deployment (git + github + vercel) [DEFAULT]
- `quick` - Quick deployment with minimal output
- `force` - Force deployment even without changes  
- `env-only` - Update environment variables only
- `test` - Test current deployment

### Method 2: Advanced Auto-Deploy

Full-featured deployment with all options:

```powershell
# Standard auto-deploy
.\vercel-auto-deploy.ps1

# Force production deployment
.\vercel-auto-deploy.ps1 -Force -Production

# Skip git operations (Vercel only)
.\vercel-auto-deploy.ps1 -SkipGit -Verbose

# Update environment variables and deploy
.\vercel-auto-deploy.ps1 -UpdateEnv -Production
```

**Available Options:**
- `-Force` - Force deployment even without changes
- `-Production` - Deploy directly to production 
- `-SkipGit` - Skip git operations (Vercel only)
- `-UpdateEnv` - Update environment variables
- `-Verbose` - Show detailed output

### Method 3: Quick Deploy (Batch)

Simple Windows batch script for quick deployments:

```batch
# One-click deployment
quick-deploy.bat
```

This script:
1. Stages all changes with `git add -A`
2. Creates timestamped commit
3. Pushes to GitHub
4. Deploys to Vercel production
5. Shows success confirmation

### Method 4: Force Deployment

Deploy without any code changes (useful for configuration updates):

```powershell
# Force production deployment
.\force-deploy.ps1 -Production

# Silent force deployment with reason
.\force-deploy.ps1 -Production -Silent -Reason "Security update"
```

---

## 🔧 Environment Variables Management

### List Current Variables
```powershell
.\manage-env.ps1 -Action list
```

### Update All Environment Variables
```powershell
# Update production environment
.\manage-env.ps1 -Action update -Production

# Update all environments
.\manage-env.ps1 -Action update -All
```

### Test Environment Variables
```powershell
# Test via API endpoint
.\manage-env.ps1 -Action test
```

### Backup Environment Variables
```powershell
# Create JSON backup
.\manage-env.ps1 -Action backup
```

### Current Environment Variables
- `UNIPAY_MERCHANT_ID`: 5015191030581
- `UNIPAY_API_KEY`: bc6f5073-6d1c-4abe-8456-1bb814077f6e

---

## 🌐 Available URLs

After deployment, these URLs are available:

| Purpose | URL | Description |
|---------|-----|-------------|
| **Main Site** | https://betlemi10.com | Homepage |
| **Shop** | https://betlemi10.com/biletebi | Ticket shop |
| **Booking** | https://betlemi10.com/shekveta | Booking system |  
| **Terms** | https://betlemi10.com/wesmdebi | Terms & conditions |
| **API Test** | https://betlemi10.com/api/test-env | Environment test |

---

## 🧪 Testing & Verification

### Test Environment Variables
```bash
# Via curl
curl https://betlemi10.com/api/test-env

# Via PowerShell
Invoke-RestMethod -Uri https://betlemi10.com/api/test-env
```

### Test API Endpoints
```bash
# Test payment API (requires valid parameters)
curl -X POST https://betlemi10.com/api/unipay-create-order-production \
  -H "Content-Type: application/json" \
  -d '{"amount": "10.00", "currency": "GEL"}'
```

### Verify Deployment Status
```powershell
# Check latest deployments
vercel ls

# Get deployment details
vercel inspect [deployment-url]
```

---

## ⚡ GitHub Actions (CI/CD)

Automatic deployment via GitHub Actions when pushing to master branch.

### Setup GitHub Secrets
Add these secrets to your GitHub repository:

```
VERCEL_TOKEN=your_vercel_token
VERCEL_ORG_ID=your_org_id  
VERCEL_PROJECT_ID=your_project_id
```

### Manual Trigger
Go to GitHub Actions → Museum Space Auto Deploy → Run workflow

---

## 🔄 Deployment Flow

### Standard Flow (GitHub Integration)
1. Code changes → `git push`
2. GitHub webhook → Vercel
3. Automatic build & deploy
4. Live on betlemi10.com (~1-3 minutes)

### Direct Vercel Flow  
1. Run deployment script
2. Direct Vercel API call
3. Immediate build & deploy
4. Live on betlemi10.com (~30-90 seconds)

### Force Deployment Flow
1. Create deployment trigger
2. Git commit & push
3. Direct Vercel deployment
4. Immediate live update

---

## 📁 File Structure

```
Museum-Space-B10/
├── 🚀 Deployment Scripts
│   ├── deploy.ps1                 # Master deployment controller
│   ├── vercel-auto-deploy.ps1     # Advanced auto-deployment  
│   ├── quick-deploy.bat           # Simple batch deployment
│   ├── force-deploy.ps1           # Force deployment
│   └── manage-env.ps1             # Environment management
│
├── 📄 Static Files  
│   ├── index.html                 # Main homepage
│   ├── shop.html                  # Ticket shop
│   ├── simple-booking.html        # Booking system
│   └── terms.html                 # Terms & conditions
│
├── 🔧 API Functions
│   ├── api/unipay-create-order-production.js
│   ├── api/unipay-callback-production.js
│   └── api/test-env.js
│
├── ⚙️ Configuration
│   ├── vercel.json                # Vercel configuration
│   ├── package.json               # Project configuration
│   └── deployment-config.json     # Deployment settings
│
└── 🤖 CI/CD
    └── .github/workflows/deploy.yml  # GitHub Actions
```

---

## 🚨 Troubleshooting

### Common Issues

**1. Vercel CLI Not Found**
```bash
npm install -g vercel
vercel login
```

**2. Permission Errors (PowerShell)**
```powershell
Set-ExecutionPolicy RemoteSigned -Scope CurrentUser
```

**3. Git Push Failures**  
```bash
git status
git add -A
git commit -m "Fix deployment"
git push
```

**4. Environment Variables Not Working**
```powershell
.\manage-env.ps1 -Action update -All
.\manage-env.ps1 -Action test
```

**5. Domain Not Resolving**
- Wait 5-15 minutes for DNS propagation
- Check Vercel dashboard for domain configuration
- Verify SSL certificate status

### Debug Commands

```powershell
# Check Vercel status
vercel ls
vercel --debug

# Test environment
.\manage-env.ps1 -Action test

# Verbose deployment
.\vercel-auto-deploy.ps1 -Verbose

# Git status check
git status
git log --oneline -5
```

---

## 📞 Support & Resources

### Vercel Documentation
- [Vercel CLI Documentation](https://vercel.com/docs/cli)
- [Environment Variables](https://vercel.com/docs/concepts/projects/environment-variables)
- [Serverless Functions](https://vercel.com/docs/concepts/functions/serverless-functions)

### Project Resources  
- **Repository**: https://github.com/Djangliori/Museum-Space-B10.git
- **Live Site**: https://betlemi10.com
- **API Test**: https://betlemi10.com/api/test-env

### Quick Commands Reference

| Task | Command |
|------|---------|
| Quick Deploy | `quick-deploy.bat` |
| Full Deploy | `.\deploy.ps1 -Production` |
| Force Deploy | `.\force-deploy.ps1 -Production` |
| Update Env | `.\manage-env.ps1 -Action update -All` |
| Test Deploy | `.\manage-env.ps1 -Action test` |
| Check Status | `vercel ls` |

---

## 📈 Performance & Monitoring

### Deployment Times
- **GitHub → Vercel**: 30-90 seconds
- **Direct Vercel**: 15-60 seconds  
- **DNS Propagation**: 0-300 seconds

### Monitoring URLs
- Vercel Dashboard: https://vercel.com/dashboard
- GitHub Actions: https://github.com/Djangliori/Museum-Space-B10/actions
- Live Site Monitor: https://betlemi10.com/api/test-env

---

*Last Updated: $(Get-Date -Format 'yyyy-MM-dd HH:mm') by Claude AI Assistant*