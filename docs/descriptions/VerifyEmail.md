# Verify Email

## Overview

The Verify Email page handles email verification for new accounts. It can verify a token, show pending verification status, or allow resending the verification email.

## Components

- Eve logo
- Verification status states:
  - Verifying spinner
  - Success with sign in button
  - Error with resend option
  - Pending with resend button
  - Resent confirmation

## User Flow

1. User clicks verification link from email
2. Page loads and verifies token automatically
3. On success: Shows confirmation, clicks Sign in
4. On failure: Shows error, can request new email
5. Alternative: User goes to page without token
6. Shows pending state with resend option

---

# AI Section (AI Will Edit This Section Only)

## Q&A

Question: Answer (DD/MM/YY)

## Edge Cases

- Expired token: Shows error with resend option
- Invalid token: Shows error with resend option
- Already verified: Still shows success
- No token or email: Shows generic error
- Resend success: Shows confirmation message

## Components (AI)

- Button (from @/components/ui)
- Spinner (from @/components/ui)
