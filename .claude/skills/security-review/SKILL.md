---
description: Security-focused code review. Use for ANY change touching auth, user input, database queries, or external APIs. Separate from general code review.
user-invocable: true
---

# Security Review

Dedicated security analysis separate from general code review.

## Scope

Review for OWASP Top 10 and common vulnerabilities:

1. **Injection**: SQL, NoSQL, command, LDAP injection
2. **Broken Auth**: Session handling, token validation, password policies
3. **Sensitive Data Exposure**: Logging secrets, unencrypted storage, response leaks
4. **XXE / XSS**: XML parsing, DOM manipulation, unsanitized output
5. **Broken Access Control**: Missing auth checks, IDOR, privilege escalation
6. **Security Misconfiguration**: Default creds, verbose errors, missing headers
7. **Insecure Deserialization**: Untrusted data parsing
8. **Vulnerable Dependencies**: Known CVEs in packages
9. **Insufficient Logging**: Missing audit trails for sensitive operations
10. **SSRF**: Unvalidated URLs, internal network access

## Checklist

For each file changed:

- [ ] All user input validated with Zod at boundary
- [ ] No raw SQL (parameterized queries only)
- [ ] Auth checked before any data access
- [ ] No secrets in logs or error messages
- [ ] Rate limiting on public endpoints
- [ ] CORS configured correctly
- [ ] No eval() or dynamic code execution
- [ ] Dependencies checked for known vulnerabilities

## Output Format

```
## Security Review: [scope]

### Critical (block merge)
- [file:line] Issue description → Fix

### High (fix before deploy)
- [file:line] Issue description → Fix

### Medium (fix soon)
- [file:line] Issue description → Fix

### Recommendations
- Suggestions for hardening

### Verified Safe
- Areas reviewed with no issues found
```

## Failure Behavior

- If ANY critical issue found → block merge, no exceptions
- If unable to determine auth flow → flag as "needs manual security review"
- If external API called without validation → treat as high severity
- If unsure about a pattern → err on side of caution, flag for review
- If dependencies cannot be checked → note as gap, recommend `npm audit`
