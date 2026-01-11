# ForgotPassword

## Functions

### handleSubmit

- **Inputs:**
  - `e` (Event): Form submit event
- **Outputs:** (void) Updates success state or shows error
- **Description:** Submits forgot password request, shows success message on completion

---

## State

- `email` (string): Email input value
- `error` (string): Error message
- `isLoading` (boolean): Form submission state
- `success` (boolean): Whether email was sent successfully

---

## API Calls

- `POST /api/auth/forgot-password` - Requests password reset email
  - Body: `{ email }`
  - Response: `{ success: true }`
