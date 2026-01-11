# Reset Password

## Overview

The Reset Password page allows users to create a new password using a token from their email. It validates the token and allows setting a new password.

## Components

- Eve logo and subtitle
- New password input
- Confirm password input
- Reset password button
- Invalid token state with request new link
- Success state with sign in button

## User Flow

1. User clicks reset link from email
2. Page loads with token from URL
3. Enters new password
4. Confirms new password
5. Clicks Reset password
6. Sees success message
7. Clicks Sign in to login with new password

---

# AI Section (AI Will Edit This Section Only)

## Q&A

Question: Answer (DD/MM/YY)

## Edge Cases

- Expired token: Shows invalid state with new request option
- Invalid token: Shows invalid state
- Password mismatch: Client-side validation error
- Short password: Minimum 8 characters required

## Components (AI)

- Button (from @/components/ui)
- Input (from @/components/ui)
