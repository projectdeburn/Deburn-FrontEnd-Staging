# Refactor Log - Legal Pages

## 11/01/25 - Legal Pages Refactor

Updated all legal pages to replace "Eve" branding with "Deburn".

---

## Changes Made

### All Files: Branding Update
- **Before:** "Eve" used throughout
- **After:** "Deburn" used throughout
- **Reason:** Match brand name across the application

---

## Files Modified

| File | Occurrences Changed |
|------|---------------------|
| `src/pages/legal/PrivacyPolicy.jsx` | 3 (logo, intro text, back link) |
| `src/pages/legal/TermsOfService.jsx` | 7 (logo, multiple body references, back link) |
| `src/pages/legal/CookiePolicy.jsx` | 3 (logo, body text, back link) |

---

## Note

Email addresses still reference `@eve.app` domain (e.g., `privacy@eve.app`, `legal@eve.app`). These may need to be updated separately when the actual domain is confirmed.
