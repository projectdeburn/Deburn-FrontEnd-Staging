# Forgot Password

## Overview

The Forgot Password page allows users to request a password reset link. Users enter their email and receive instructions to reset their password.

## Components

- Eve logo and subtitle
- Instructions text
- Email input field
- Send reset link button
- Back to login link
- Success state with confirmation

## User Flow

1. User clicks "Forgot password?" from Login page
2. Enters email address
3. Clicks Send reset link
4. Sees success message
5. Checks email for reset link
6. Clicks link to go to Reset Password page

---

# AI Section (AI Will Edit This Section Only)

## Q&A

Question: Answer (DD/MM/YY)

## Edge Cases

- Non-existent email: Still shows success (security)
- Empty email: Form validation prevents submit
- Rate limiting: API may throttle requests
- Already logged in: Can still access this page

## Components (AI)

- Button (from @/components/ui)
- Input (from @/components/ui)
