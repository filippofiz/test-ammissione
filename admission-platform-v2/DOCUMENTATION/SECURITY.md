# Security Documentation

Security policies and best practices for Admission Platform v2.

---

## 🔐 Security Checklist

- [x] No hardcoded API keys ✅
- [x] RLS enabled on all tables ✅
- [x] Input validation (Email & Password regex) ✅
- [x] Multi-layer authorization (Route + Page + RLS) ✅
- [x] HTTPS only (Supabase enforced) ✅
- [x] Secure session management (Supabase Auth) ✅
- [x] Password change enforcement on first login ✅
- [x] RPC functions with SECURITY DEFINER for privileged operations ✅
- [ ] HTML sanitization (DOMPurify) - TODO when rendering rich content
- [ ] Zod schemas for comprehensive validation - TODO
- [ ] Rate limiting - TODO
- [ ] CSRF protection - TODO
- [ ] Content Security Policy - TODO

---

## 🛡️ Security Measures

### 1. Secrets Management
- **Environment Variables**: All secrets in `.env.local` (never committed)
- **Supabase Vault**: API keys stored securely for Edge Functions
- **No Client Secrets**: Service role key NEVER exposed to frontend

### 2. Authentication
- Supabase Auth (JWT tokens)
- Session management via httpOnly cookies
- Password requirements: min 6 chars (TODO: increase to 12+)
- Must change password on first login (security flag)
- Protected routes with ProtectedRoute component

### 3. Authorization (Multi-Layer Security)

#### Layer 1: Route Protection
All routes except `/login` use `ProtectedRoute` component:
```typescript
<Route path="/test-selection" element={
  <ProtectedRoute requiredRoles={['STUDENT']}>
    <TestSelectionPage />
  </ProtectedRoute>
} />
```

#### Layer 2: Page-Level Validation
Each page validates:
- User authentication status
- User roles match page requirements
- User has necessary data (e.g., multiple tests for test selection)
- Redirects unauthorized users automatically

#### Layer 3: Database RLS
- RLS policies on every table
- Role-based access (STUDENT, TUTOR, ADMIN)
- Tutors can only see assigned students
- Students can only see their own data
- RPC functions with SECURITY DEFINER for login/password change

#### Navigation Security Flow
1. Login → Check `must_change_password` flag
2. Change Password → Sign out → Re-login
3. Role Check:
   - **Single Role (STUDENT)**: Check tests count
     - 1 test → Home
     - Multiple tests → Test Selection (STUDENT role verified)
     - 0 tests → Error message
   - **Single Role (TUTOR/ADMIN)** → Dashboard
   - **Multiple Roles** → Role Selection screen
4. Role Selection → Verify user has selected role → Navigate
5. Test Selection → Verify STUDENT role → Verify multiple tests → Navigate

**Security Features**:
- Unauthorized users redirected to login
- Wrong roles redirected to appropriate page
- Users can't access pages they shouldn't be on
- All checks happen on both client AND server (RLS)

### 4. Input Validation (Implemented)
✅ **Email Validation**: Regex pattern for valid email format
✅ **Password Validation**: Minimum 6 characters (client-side)
✅ **Sanitization**: Ready for DOMPurify integration

**Current Implementation**:
```typescript
// Email validation in LoginPage
const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
if (!emailPattern.test(email)) {
  setError('Please enter a valid email address');
  return;
}

// Password validation
if (password.length < 6) {
  setError('Password must be at least 6 characters');
  return;
}
```

**TODO**: Integrate Zod schemas for comprehensive validation

### 5. XSS Prevention
- DOMPurify on all user input
- No `dangerouslySetInnerHTML` without sanitization
- CSP headers (TODO)

### 6. SQL Injection Prevention
- Supabase uses parameterized queries
- No raw SQL from user input

---

## 🚨 Security Incidents

### Reporting
- Email: security@uptoten.it
- Response time: <4 hours

### Procedure
1. Enable maintenance mode
2. Revoke compromised credentials
3. Audit logs
4. Fix vulnerability
5. Security review
6. Post-mortem

---

## 🤖 AI Security Assistant

### 💡 AI IDEA: Automated Security Scanning
```bash
# Use AI to scan code for vulnerabilities
# - Hardcoded secrets
# - SQL injection patterns
# - XSS vulnerabilities
# - Insecure dependencies
```

### 💡 AI IDEA: AI-Powered Code Review
```bash
# Before every commit, AI reviews for:
# - Missing input validation
# - Insecure API calls
# - Exposed secrets
```

---

**Last Updated**: 2025-11-15
