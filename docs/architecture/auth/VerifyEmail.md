# VerifyEmail

## Functions

### verifyToken

- **Inputs:** None (async function, uses token from URL)
- **Outputs:** (void) Updates status state
- **Description:** Sends verification token to API, updates status to success or error

### resendVerification

- **Inputs:** None (async function)
- **Outputs:** (void) Updates status to 'resent' or shows error
- **Description:** Requests new verification email to be sent

---

## State

- `status` (string): Current state ('verifying', 'success', 'error', 'resent')
- `error` (string): Error message
- `isResending` (boolean): Resend request state

---

## URL Parameters

- `token` (string): Email verification token
- `email` (string): User's email (for pending/resend state)

---

## API Calls

- `POST /api/auth/verify-email` - Verifies email with token
  - Body: `{ token }`
  - Response: `{ success: true }`
- `POST /api/auth/resend-verification` - Resends verification email
  - Body: `{ email }`
  - Response: `{ success: true }`
