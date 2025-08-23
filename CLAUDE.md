# CLAUDE.md – Museum Space B10 Repository

## Project Context
- Project: Museum Space B10 (Node.js + UniPay integration)
- Key payment file: api/unipay-callback.js
- Goal: Clean, secure, maintainable codebase

---

## Coding Standards
- Use **2-space indentation** everywhere
- Remove unused imports, duplicate files, and test endpoints
- Keep file structure clean and organized
- Always show diffs when changing code

---

## Security Requirements
1. **CORS Policy**
   - Never use "*"
   - Allowed origins only: ["https://betlemi10.com", "https://www.betlemi10.com"]
   - Allow only POST requests

2. **Logging Privacy**
   - Never log sensitive data (names, emails, card numbers, payment details)
   - Only safe logs: orderId, status, timestamp

3. **Webhook Verification**
   - All UniPay webhooks must be verified with **HMAC SHA256**
   - Use `process.env.UNIPAY_SECRET`
   - Reject request with `401 Unauthorized` if signature mismatches

---

## Workflow for Claude
1. **Step 1 – Analysis**
   - Read all files, create `plan.md` with findings
   - Mark each issue as (Safe Auto), (Needs Review), (Optional)

2. **Step 2 – Cleanup**
   - Apply only (Safe Auto) changes automatically:
     * Formatting (Prettier/ESLint, Black, php-cs-fixer)
     * Unused imports removal
     * Whitespace cleanup
   - Commit with message: `chore: cleanup formatting + unused imports`

3. **Step 3 – Refactor & Security**
   - Show refactor and security fixes as diffs
   - Explain reasoning in plain language before finalizing
   - Require human approval before applying

4. **Step 4 – Deliverables**
   - `CLAUDE_REPORT.md` → summary of what changed
   - `SECURITY_IMPROVEMENTS.md` → security fixes with examples
   - `REFACTOR_SUGGESTIONS.md` → quality improvements
   - Keep Git history clean with conventional commits

---

## Rules of Engagement
- Do not break existing payment flow
- Always preserve functionality
- Never assume external domains or secrets unless provided
- Always explain what changed and why