## API Description

Authentication endpoints for login, registration, password reset, and email verification.

---

## POST /api/auth/login

Authenticates user and creates session.

**Request:**
```json
{
  "email": "user@example.com",
  "password": "securepassword",
  "rememberMe": true
}
```

**Frontend Input** (src/features/auth/authApi.js → src/pages/auth/Login.jsx):
```json
{
  "email": "user@example.com",
  "password": "securepassword",
  "rememberMe": false
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "user": {
      "id": "usr_123",
      "email": "user@example.com",
      "firstName": "John",
      "lastName": "Doe",
      "isAdmin": false
    }
  }
}
```

---

## POST /api/auth/register

Creates new user account.

**Request:**
```json
{
  "firstName": "John",
  "lastName": "Doe",
  "email": "user@example.com",
  "password": "securepassword",
  "passwordConfirm": "securepassword",
  "organization": "Acme Corp",
  "country": "SE",
  "consents": {
    "terms": true,
    "privacy": true
  }
}
```

**Frontend Input** (src/features/auth/authApi.js → src/pages/auth/Register.jsx):
```json
{
  "firstName": "John",
  "lastName": "Doe",
  "email": "user@example.com",
  "password": "securepassword",
  "passwordConfirm": "securepassword",
  "organization": "Acme Corp",
  "country": "SE",
  "consents": {
    "termsOfService": true,
    "privacyPolicy": true,
    "dataProcessing": true,
    "marketing": false
  }
}
```

**Response:**
```json
{
  "success": true,
  "message": "Registration successful. Please verify your email."
}
```

---

## POST /api/auth/forgot-password

Initiates password reset flow.

**Request:**
```json
{
  "email": "user@example.com"
}
```

**Frontend Input** (src/pages/auth/ForgotPassword.jsx):
```json
{
  "email": "user@example.com"
}
```

**Response:**
```json
{
  "success": true
}
```

---

## POST /api/auth/reset-password

Resets password with token.

**Request:**
```json
{
  "token": "reset_token_abc123",
  "password": "newsecurepassword"
}
```

**Frontend Input** (src/pages/auth/ResetPassword.jsx):
```json
{
  "token": "reset_token_abc123",
  "password": "newsecurepassword"
}
```

**Note:** authApi.js also supports `passwordConfirm` field but ResetPassword.jsx does not send it.

**Response:**
```json
{
  "success": true
}
```

**Error Codes:**
- `TOKEN_EXPIRED` - Reset token has expired
- `TOKEN_INVALID` - Reset token is invalid

---

## POST /api/auth/verify-email

Verifies email with token.

**Request:**
```json
{
  "token": "verify_token_abc123"
}
```

**Frontend Input** (src/pages/auth/VerifyEmail.jsx):
```json
{
  "token": "verify_token_abc123"
}
```

**Response:**
```json
{
  "success": true
}
```

---

## POST /api/auth/resend-verification

Resends verification email.

**Request:**
```json
{
  "email": "user@example.com"
}
```

**Frontend Input** (src/pages/auth/VerifyEmail.jsx):
```json
{
  "email": "user@example.com"
}
```

**Response:**
```json
{
  "success": true
}
```

---

## POST /api/auth/logout

Logs out user and destroys session.

**Request:** None

**Frontend Input** (src/features/auth/authApi.js):
```json
{}
```

**Response:**
```json
{
  "success": true
}
```

---

## GET /api/auth/session

Gets current session info.

**Frontend Input** (src/features/auth/authApi.js):
No request body.

**Response:**
```json
{
  "success": true,
  "data": {
    "user": { ... }
  }
}
```

---

## GET /api/auth/sessions

Gets all active sessions for the user.

**Frontend Input** (src/features/auth/authApi.js):
No request body.

---

## DELETE /api/auth/sessions/:sessionId

Revokes a specific session.

**Frontend Input** (src/features/auth/authApi.js):
No request body.

---

## DELETE /api/auth/sessions

Revokes all other sessions.

**Frontend Input** (src/features/auth/authApi.js):
No request body.

---

## GET /api/auth/data-export

Exports user data (GDPR).

**Frontend Input** (src/features/auth/authApi.js):
No request body.

---

## POST /api/auth/delete-account

Requests account deletion (GDPR).

**Frontend Input** (src/features/auth/authApi.js):
```json
{
  "reason": "optional reason string or null"
}
```

---

## POST /api/auth/refresh

Refreshes access token.

**Frontend Input** (src/features/auth/authApi.js):
```json
{}
```
