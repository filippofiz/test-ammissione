# Edge Cases Documentation

Comprehensive catalog of edge cases and testing strategies.

---

## 🔬 Edge Case Categories

### 1. Input Edge Cases
- [ ] Empty string (`""`)
- [ ] Only whitespace (`"   "`)
- [ ] Very long string (1MB+)
- [ ] Emojis and special characters (`🔥💀👻`)
- [ ] SQL injection attempts (`'; DROP TABLE--`)
- [ ] XSS attempts (`<script>alert()</script>`)
- [ ] Unicode characters (`Ä`ç`ñ`ü`)
- [ ] Null bytes (`\0`)
- [ ] Negative numbers where positive expected
- [ ] Very large numbers (exceeds INT_MAX)
- [ ] Floating point precision issues

### 2. Timing Edge Cases
- [ ] Submit immediately (0.1s - bot detection)
- [ ] Session timeout (72+ hours)
- [ ] Daylight saving time changes
- [ ] Leap seconds
- [ ] Client clock in the future/past
- [ ] Concurrent operations (race conditions)

### 3. User Behavior Edge Cases
- [ ] Double-click submit button
- [ ] Back button after submit
- [ ] Refresh during operation
- [ ] Multiple tabs same user
- [ ] Offline mid-operation
- [ ] Network interruption
- [ ] Very slow connection (2G)

### 4. Device Edge Cases
- [ ] Tiny screen (280px - Galaxy Fold)
- [ ] Huge screen (8K - 7680px)
- [ ] Low RAM (512MB)
- [ ] Old browsers (IE11 - if supported)
- [ ] Touch + mouse simultaneously
- [ ] Screen rotation (mobile)
- [ ] Zoom levels (50% - 200%)

### 5. Database Edge Cases
- [ ] Connection pool exhausted
- [ ] Transaction timeout
- [ ] Unique constraint violation
- [ ] Foreign key violation
- [ ] Deadlocks
- [ ] Out of disk space

### 6. Test-Specific Edge Cases
- [ ] Student exits fullscreen (GMAT/SAT requirement)
- [ ] Timer reaches 0 during answer selection
- [ ] Network drops during answer submit
- [ ] Adaptive algorithm edge cases (all wrong, all correct)
- [ ] Question with no correct answer (data error)
- [ ] Missing PDF for PDF-based test
- [ ] LaTeX rendering failure

---

## 🧪 Testing Strategy

### For Each Edge Case:
1. **Identify** - Document the edge case
2. **Reproduce** - Create test that triggers it
3. **Handle** - Implement graceful handling
4. **Test** - Verify handling works
5. **Monitor** - Track if it happens in production

### Example: Empty Input Handling
```typescript
// Test
it('handles empty email gracefully', () => {
  const result = validateEmail('');
  expect(result.valid).toBe(false);
  expect(result.error).toBe('Email is required');
});

// Implementation
function validateEmail(email: string) {
  if (!email || email.trim() === '') {
    return { valid: false, error: 'Email is required' };
  }
  // ... rest of validation
}
```

---

## 💡 AI Edge Case Discovery

### 💡 AI IDEA: AI-powered edge case generation
```bash
# Use AI to analyze code and generate edge cases
# AI can think of scenarios humans might miss
# Example: "What if user has emoji in their name?"
```

### 💡 AI IDEA: Fuzzing with AI
```bash
# AI generates random inputs to test robustness
# Finds crashes and unexpected behaviors
```

---

**Last Updated**: 2025-11-14
