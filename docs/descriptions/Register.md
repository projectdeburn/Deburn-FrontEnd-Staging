# Register

## Overview

The Register page allows new users to create an account. It collects personal information, credentials, and consent acknowledgments before creating the account.

## Components

- Eve logo and subtitle
- Registration form card
- Name fields (First, Last)
- Email input
- Password and confirm password inputs
- Organization field (optional)
- Terms acceptance checkbox
- Privacy policy acceptance checkbox
- Create account button
- Sign in link
- Success state with email verification prompt

## User Flow

1. User clicks Sign up from Login page
2. Fills in first and last name
3. Enters email address
4. Creates and confirms password
5. Optionally enters organization
6. Accepts Terms of Service
7. Accepts Privacy Policy
8. Clicks Create account
9. Sees success message to check email
10. Receives verification email

---

# AI Section (AI Will Edit This Section Only)

## Q&A

Question: Answer (DD/MM/YY)

## Edge Cases

- Password mismatch: Field validation error
- Existing email: API returns error
- Missing consent: Submit button disabled
- Weak password: Shows password requirements

## Components (AI)

- Button (from @/components/ui)
- Input (from @/components/ui)
- Checkbox (from @/components/ui)
- Select (from @/components/ui)
- AuthContext (for register function)
