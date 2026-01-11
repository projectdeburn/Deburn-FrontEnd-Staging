# ResetPassword

## Functions

### handleSubmit

- **Inputs:**
  - `e` (Event): Form submit event
- **Outputs:** (void) Updates success state or shows error
- **Description:** Validates passwords match and length, submits reset request with token

---

## State

- `password` (string): New password input
- `passwordConfirm` (string): Confirm password input
- `error` (string): Error message
- `isLoading` (boolean): Form submission state
- `success` (boolean): Whether password was reset successfully
- `tokenValid` (boolean): Whether the reset token is valid

---

## URL Parameters

- `token` (string): Password reset token from email link

---

## API Calls

- `POST /api/auth/reset-password` - Resets password with token
  - Body: `{ token, password }`
  - Response: `{ success: true }` or error with TOKEN_EXPIRED/TOKEN_INVALID code
