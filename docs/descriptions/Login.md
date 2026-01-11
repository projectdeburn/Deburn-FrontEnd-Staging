# Login

## Overview

The Login page allows existing users to authenticate and access the application. It includes email/password form, remember me option, and links to registration and password recovery.

## Components

- Eve logo and subtitle
- Login form card
- Email input field
- Password input field
- Remember me checkbox
- Forgot password link
- Sign in button
- Sign up link
- Legal links footer (Privacy Policy, Terms)

## User Flow

1. User arrives at Login page
2. Enters email address
3. Enters password
4. Optionally checks "Remember me"
5. Clicks Sign in button
6. On success, redirected to Dashboard
7. On failure, shows error message

---

# AI Section (AI Will Edit This Section Only)

## Q&A

Question: Answer (DD/MM/YY)

## Edge Cases

- Invalid credentials: Shows error message
- Already authenticated: Redirects to Dashboard
- Empty fields: Form validation prevents submit
- Network error: Shows connection error message

## Components (AI)

- Button (from @/components/ui)
- Input (from @/components/ui)
- Checkbox (from @/components/ui)
- AuthContext (for login function)
