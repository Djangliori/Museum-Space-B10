# UniPay API Integration Diagnostic Strategy

## Problem Summary
- **Issue**: "Payment authentication failed" when creating UniPay payment orders
- **Known Working**: Direct curl test with credentials works
- **Failing**: Vercel API endpoint returns 500 Internal Server Error
- **Suspected**: Environment variable configuration mismatch

## Key Findings from Code Analysis

### 1. CRITICAL SECURITY ISSUE IDENTIFIED
**Problem**: Environment variables are hardcoded in `vercel.json`
```json
"env": {
  "UNIPAY_MERCHANT_ID": "5015191030581",
  "UNIPAY_API_KEY": "bc6f5073-6d1c-4abe-8456-1bb814077f6e"
}
```

**Issues with this approach**:
- Secrets exposed in version control
- Not the correct way to set environment variables in Vercel
- May not be properly loaded at runtime

### 2. Current API Configuration
- **Merchant ID**: `5015191030581` (expected)
- **API Key**: `bc6f5073-6d1c-4abe-8456-1bb814077f6e` (expected format: UUID with dashes)
- **Auth Endpoint**: `https://apiv2.unipay.com/v3/auth`
- **Order Endpoint**: `https://apiv2.unipay.com/v3/api/order/create`

## Step-by-Step Diagnostic Strategy

### Phase 1: Immediate Diagnosis
1. **Deploy Enhanced Diagnostic Endpoint**
   - File created: `/api/unipay-env-diagnostics.js`
   - Endpoint: `GET /api/unipay-env-diagnostics`
   - Enhanced version: `POST /api/unipay-env-diagnostics` (tests expected credentials)

2. **Test Current Configuration**
   ```bash
   curl -X GET "https://your-vercel-domain.vercel.app/api/unipay-env-diagnostics"
   ```

3. **Test with Enhanced Analysis**
   ```bash
   curl -X POST "https://your-vercel-domain.vercel.app/api/unipay-env-diagnostics"
   ```

### Phase 2: Environment Variable Analysis

#### What the Diagnostic Endpoint Will Check:

1. **Environment Variable Presence**
   - Are `UNIPAY_MERCHANT_ID` and `UNIPAY_API_KEY` set?
   - Lengths match expected values?

2. **Data Integrity Checks**
   - Merchant ID matches exactly: `5015191030581`
   - API Key matches UUID format with dashes
   - No trailing/leading whitespace
   - No quote characters wrapping values
   - Character encoding issues

3. **Format Validation**
   - API Key: 36 characters total
   - API Key: 4 dashes in correct positions
   - API Key: Valid hexadecimal characters only
   - Invalid character detection

4. **Authentication Testing**
   - Test connectivity to UniPay API
   - Test auth with current environment variables
   - Compare with known working credentials
   - Detailed error response analysis

### Phase 3: Fix Environment Variables (Recommended Steps)

#### Step 1: Remove Hardcoded Values
1. Remove the `env` section from `vercel.json`
2. Commit and push this change

#### Step 2: Set Environment Variables Properly in Vercel Dashboard
1. Go to your Vercel project dashboard
2. Navigate to Settings → Environment Variables
3. Add variables:
   ```
   UNIPAY_MERCHANT_ID = 5015191030581
   UNIPAY_API_KEY = bc6f5073-6d1c-4abe-8456-1bb814077f6e
   ```
4. Set for: Production, Preview, and Development environments
5. Redeploy the project

#### Step 3: Verify Configuration
Run diagnostic endpoint again to confirm proper setup.

### Phase 4: Additional Debugging Steps

1. **Check Vercel Function Logs**
   ```bash
   vercel logs your-deployment-url
   ```

2. **Test Local Development**
   ```bash
   # Create .env file locally
   echo "UNIPAY_MERCHANT_ID=5015191030581" > .env
   echo "UNIPAY_API_KEY=bc6f5073-6d1c-4abe-8456-1bb814077f6e" >> .env
   
   # Test locally
   vercel dev
   ```

3. **Character Encoding Test**
   If issues persist, test for invisible characters:
   ```javascript
   // In diagnostic endpoint, we check:
   character_analysis: {
     all_chars_valid: /^[0-9a-f-]+$/i.test(apiKey),
     invalid_chars: apiKey.split('').filter(char => !/[0-9a-f-]/i.test(char)),
     char_codes: apiKey.split('').map((char, index) => ({ index, char, code: char.charCodeAt(0) }))
   }
   ```

## Common Issues and Solutions

### Issue 1: Environment Variables Not Loading
**Symptoms**: `process.env.UNIPAY_API_KEY` returns `undefined`
**Solutions**:
- Ensure variables are set in Vercel dashboard (not just vercel.json)
- Redeploy after setting variables
- Check variable names match exactly (case-sensitive)

### Issue 2: API Key Format Issues
**Symptoms**: API key has correct length but authentication fails
**Solutions**:
- Check for invisible characters (BOM, zero-width spaces)
- Verify UUID format: 8-4-4-4-12 character pattern
- Ensure all characters are valid hexadecimal

### Issue 3: Network/Connectivity Issues
**Symptoms**: Connectivity test fails
**Solutions**:
- Check Vercel region restrictions
- Test from different endpoints
- Verify UniPay API endpoints are accessible

## Expected Diagnostic Results

### Healthy Configuration
```json
{
  "configuration_status": {
    "both_configured": true,
    "merchant_id_valid": true,
    "api_key_format_valid": true,
    "ready_for_testing": true
  },
  "auth_test": {
    "status": "SUCCESS",
    "details": "Authentication successful, token received: YES"
  },
  "overall_status": {
    "configuration": "GOOD",
    "connectivity": "GOOD",
    "authentication": "GOOD",
    "ready_for_production": "YES"
  }
}
```

### Problem Configuration
```json
{
  "api_key_analysis": {
    "configured": true,
    "matches_expected": false,
    "length_matches": false,
    "has_whitespace": true,
    "starts_ends_with_quotes": true
  },
  "auth_test": {
    "status": "FAILED_401",
    "details": "Authentication failed with status 401: Invalid credentials"
  }
}
```

## Action Items

### Immediate (Deploy and Test)
1. Deploy the diagnostic endpoint
2. Run GET test to check basic configuration
3. Run POST test for comprehensive analysis
4. Fix environment variable configuration based on results

### Security (Critical)
1. Remove hardcoded credentials from vercel.json
2. Set environment variables properly in Vercel dashboard
3. Ensure .env files are in .gitignore

### Monitoring
1. Set up logging for production authentication attempts
2. Monitor for any authentication failures
3. Set up alerts for payment processing errors

## Next Steps After Running Diagnostics

1. **If diagnostics show environment issues**: Fix Vercel environment variable configuration
2. **If diagnostics show format issues**: Check for character encoding problems
3. **If diagnostics show network issues**: Investigate Vercel region or network restrictions
4. **If all diagnostics pass but payments fail**: Look into order creation logic or callback handling

This comprehensive approach should identify the exact cause of your UniPay integration issues.