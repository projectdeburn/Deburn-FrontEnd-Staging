# Refactor Log - Remaining Auth Pages

## 11/01/25 - Auth Pages Branding Update

Updated remaining auth pages to use "Deburn" branding.

---

## Changes Made

### ForgotPassword.jsx
- **Line 47:** `Eve` → `Deburn` (logo text)

### ResetPassword.jsx
- **Line 130:** `Eve` → `Deburn` (logo text)

### VerifyEmail.jsx
- **No changes needed** - doesn't display logo text

---

## Files Modified

| File | Changes |
|------|---------|
| `src/pages/auth/ForgotPassword.jsx` | Logo text |
| `src/pages/auth/ResetPassword.jsx` | Logo text |

---

## Note on "Ask Eve"

The Coach feature uses "Ask Eve" as the AI coach's name. This is intentional and separate from the brand name "Deburn":
- Brand name: **Deburn**
- AI Coach name: **Eve** (hence "Ask Eve")

No changes made to Coach.jsx or Sidebar navigation - "Ask Eve" is correct.
