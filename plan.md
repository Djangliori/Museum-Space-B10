# Code Cleanup and Refactoring Plan

## Repository Analysis Summary

### Repository Structure
- **Main application files**: 6 HTML files, 1 config.js, 1 vercel.json
- **API endpoints**: 3 serverless functions in `/api/`
- **Duplicate folders**: `unipay callback/` and `unipay setup/` contain duplicated files
- **Environment files**: `.env` files present (properly gitignored)

## Identified Issues

### 1. Code Duplication (Critical)
- **Problem**: Entire `unipay callback/` folder duplicates files from root and `/api/`
- **Files affected**: 
  - `unipay callback/unipay-callback.js` vs `api/unipay-callback.js`
  - `unipay callback/unipay-create-order.js` vs `api/unipay-create-order.js`
  - `unipay callback/simple-booking.html` vs `simple-booking.html`
  - `unipay callback/payment-*.html` vs `payment-*.html`

### 2. Formatting Issues
- **Mixed line endings**: Some files have LF, others CRLF
- **Inconsistent indentation**: Mix of 2 and 4 spaces
- **Trailing whitespace**: Present in multiple files

### 3. Code Quality Issues
- **Long functions**: `unipay-create-order.js` (148 lines, multiple responsibilities)
- **Magic numbers**: Hardcoded values (10.0, 36, etc.)
- **Inconsistent error handling**: Mix of patterns across files
- **TODO comments**: Multiple unimplemented features in callback handler

### 4. Security Issues
- **Wildcard CORS**: `Access-Control-Allow-Origin: '*'` in callback endpoint
- **Input validation**: Limited validation in create-order endpoint
- **Logging sensitive data**: Payment details logged to console
- **No rate limiting**: API endpoints unprotected

### 5. Configuration Issues
- **Hardcoded URLs**: Base URLs scattered throughout code
- **Environment detection**: Browser-based env detection in config.js
- **Missing error boundaries**: No graceful degradation

### 6. Testing Issues
- **No tests**: No unit tests, integration tests, or validation
- **Test endpoint**: Temporary test-endpoint.js should be removed
- **No input validation tests**: Payment processing lacks comprehensive validation

## Cleanup Plan

### Phase 1: Safe Automated Changes (Safe Auto)
- [ ] **Remove duplicate folders**: Delete `unipay callback/` and `unipay setup/` folders
- [ ] **Remove test endpoint**: Delete `api/test-endpoint.js`
- [ ] **Fix line endings**: Normalize to LF
- [ ] **Fix indentation**: Standardize to 2 spaces
- [ ] **Remove trailing whitespace**: Clean all files
- [ ] **Sort imports**: Organize import statements (where applicable)
- [ ] **Add missing semicolons**: JavaScript consistency

### Phase 2: Structural Improvements (Needs Review)
- [ ] **Extract constants**: Move hardcoded values to config
- [ ] **Break down large functions**: Split unipay-create-order.js into smaller functions
- [ ] **Standardize error responses**: Create consistent error handling
- [ ] **Extract validation logic**: Create reusable validation functions
- [ ] **Create response helpers**: Standardize API responses

### Phase 3: Security Hardening (Needs Review)
- [ ] **Fix CORS policy**: Restrict origins to specific domains
- [ ] **Add input sanitization**: Validate and sanitize all inputs
- [ ] **Remove sensitive logging**: Don't log payment details
- [ ] **Add rate limiting**: Protect API endpoints
- [ ] **Validate webhook signatures**: Verify UniPay callbacks

### Phase 4: Code Organization (Optional)
- [ ] **Create shared utilities**: Common functions for API endpoints
- [ ] **Add TypeScript definitions**: Type safety for better development
- [ ] **Add comprehensive logging**: Structured logging with levels
- [ ] **Add monitoring**: Health checks and metrics
- [ ] **Add documentation**: API documentation and setup guides

## Risk Assessment

### High Priority (Must Fix)
1. **Code duplication**: Causes deployment confusion and maintenance issues
2. **Security vulnerabilities**: CORS and input validation issues
3. **Sensitive data logging**: Payment information exposure

### Medium Priority (Should Fix)
1. **Code organization**: Long functions and poor separation of concerns
2. **Error handling**: Inconsistent patterns make debugging difficult
3. **Configuration management**: Hardcoded values reduce flexibility

### Low Priority (Nice to Have)
1. **Testing infrastructure**: Currently no automated testing
2. **Documentation**: Limited inline and setup documentation
3. **TypeScript migration**: Would improve type safety

## Implementation Order

1. **Phase 1 (Safe Auto)**: Can be applied immediately without review
2. **Phase 2 (Needs Review)**: Requires code review but maintains functionality
3. **Phase 3 (Needs Review)**: Security improvements that may affect integration
4. **Phase 4 (Optional)**: Enhancement features that can be done incrementally

## Files Requiring Immediate Attention

### Critical
- `api/unipay-callback.js` - Security and logging issues
- `api/unipay-create-order.js` - Function length and validation
- Duplicate folder cleanup

### Important  
- `vercel.json` - Missing callback endpoint configuration
- `config.js` - Environment detection improvements
- All HTML files - Formatting consistency

### Optional
- Documentation updates
- Test infrastructure
- Monitoring setup

## Testing Strategy

After cleanup:
1. **Manual testing**: Verify payment flow still works
2. **API testing**: Test all endpoints with various inputs
3. **Security testing**: Verify CORS and input validation
4. **Integration testing**: Test with UniPay sandbox (if available)
5. **Performance testing**: Check response times after changes

## Success Criteria

- [ ] No duplicate code or files
- [ ] Consistent formatting and style
- [ ] Security vulnerabilities addressed
- [ ] All functionality preserved
- [ ] Code is more maintainable and readable
- [ ] Documentation is complete and accurate