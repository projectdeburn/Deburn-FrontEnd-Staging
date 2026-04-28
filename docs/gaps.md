# Deployment Gaps Analysis

## Overview

This document identifies potential gaps and issues when deploying the Deburn frontend and backend on separate Render instances.

---

## Critical Issues

### 1. CORS Configuration

**Current State:** The backend `api.py` uses environment-based CORS:
```python
# api.py lines 112-117
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.get_cors_origins(),  # Reads from CORS_ORIGINS env var
    allow_credentials=settings.CORS_ALLOW_CREDENTIALS,
    allow_methods=["*"],
    allow_headers=["*"],
)
```

**Default:** `CORS_ORIGINS="*"` (allows all origins - works but not secure for production)

**Recommendation:**
- Set `CORS_ORIGINS` environment variable in Render to your specific frontend URL
- Example: `CORS_ORIGINS=https://deburn-frontend.onrender.com`
- For multiple origins: `CORS_ORIGINS=https://frontend.com,https://www.frontend.com`

---

### 2. Frontend Environment Variables Point to Localhost

**Problem:** The `.env` file contains:
```
VITE_ENDPOINT=http://localhost:5002
```

**Impact:** All API calls will fail in production as they'll attempt to reach localhost.

**Solution:**
- Set in Render environment variables:
  ```
  VITE_API_URL=https://deburn-backend.onrender.com
  VITE_ENDPOINT=https://deburn-backend.onrender.com
  ```

**Note:** There are TWO different env vars used inconsistently:
- `VITE_API_URL` - Used by `getApiBaseUrl()` in `/src/utils/api.js`
- `VITE_ENDPOINT` - Used directly by all feature API clients (authApi, coachApi, hubApi, circlesApi)

**Recommendation:** Set both to the same value, or refactor to use a single variable.

---

### 3. Hardcoded Frontend URL in Backend

**Problem:** In `app/config.py` line 70:
```python
FRONTEND_URL: str = "http://localhost:3000"
```

**Impact:**
- Password reset emails will contain localhost links
- Email verification links will be invalid
- Any redirect URLs will fail

**Solution:**
- Set `FRONTEND_URL` environment variable in Render:
  ```
  FRONTEND_URL=https://deburn-frontend.onrender.com
  ```

---

### 4. Cookie/Credentials Handling Across Origins

**Problem:** Frontend uses `credentials: 'include'` for all API requests:
```javascript
// src/utils/api.js
const defaultOptions = {
  credentials: 'include',
};
```

**Impact:** When frontend and backend are on different domains:
- Cookies won't be sent by default due to SameSite restrictions
- Session-based auth may fail

**Solution:**
Backend must set proper headers:
```python
# Ensure these are set in CORS middleware
allow_credentials=True
# And cookies must have:
SameSite=None
Secure=True
```

---

### 5. In-Memory Token Storage Won't Scale

**Problem:** Backend stores tokens in memory (`jwt_auth.py`):
```python
# Line 92-96
_revoked_tokens: Set[str] = set()
_password_reset_tokens: Dict[str, PasswordResetToken] = {}
_email_verification_tokens: Dict[str, EmailVerificationToken] = {}
```

**Impact:**
- If Render scales to multiple instances, each instance has different token state
- Password reset tokens created on instance A won't be recognized by instance B
- Token revocation won't work across instances

**Solution:**
- Implement Redis for token storage
- Or use database-backed token storage
- Or accept limitation and use single instance

---

## Medium Priority Issues

### 6. Development Proxy Won't Work in Production

**Problem:** Vite config has development proxy:
```javascript
// vite.config.js
proxy: {
  '/api': {
    target: 'http://localhost:5001',
    changeOrigin: true,
  },
}
```

**Impact:** None in production (proxy only affects dev server), but developers should understand this.

**Solution:** No action needed - just awareness that production relies entirely on `VITE_ENDPOINT`.

---

### 7. API Documentation Exposure

**Problem:** OpenAPI docs at `/docs` and `/redoc` are conditionally enabled:
```python
docs_url="/docs" if settings.is_development() else None
```

**Impact:** If `ENVIRONMENT` is not set to `production`, docs will be exposed.

**Solution:**
- Ensure `ENVIRONMENT=production` is set in Render
- Or explicitly set `DOCS_ENABLED=false`

---

### 8. Health Check Configuration

**Problem:** Health endpoint exists at `/health` but Render needs to know about it.

**Solution:**
- Configure Render health check path: `/health`
- The endpoint returns database connection status which is useful for monitoring

---

### 9. Missing SMTP Configuration

**Problem:** Email functionality requires SMTP settings that are optional:
```python
SMTP_HOST: Optional[str] = None
SMTP_PORT: int = 587
SMTP_USER: Optional[str] = None
SMTP_PASSWORD: Optional[str] = None
```

**Impact:** Password reset and email verification will fail silently without SMTP.

**Solution:**
Set in Render environment:
```
SMTP_HOST=smtp.sendgrid.net
SMTP_PORT=587
SMTP_USER=apikey
SMTP_PASSWORD=your-sendgrid-api-key
SMTP_FROM_EMAIL=noreply@yourdomain.com
```

---

### 10. JWT Secret Not Set

**Problem:** `JWT_SECRET` has no default and is required:
```python
JWT_SECRET: str  # Required, no default
```

**Impact:** Application will fail to start without it.

**Solution:**
- Generate a secure random string (minimum 32 characters)
- Set in Render: `JWT_SECRET=<your-secure-random-string>`

---

## Low Priority Issues

### 11. Database Connection String

**Problem:** Default MongoDB URI is localhost:
```python
MONGODB_URI: str = "mongodb://localhost:27017"
```

**Solution:**
- Use MongoDB Atlas or other cloud MongoDB
- Set `MONGODB_URI=mongodb+srv://user:pass@cluster.mongodb.net/dbname`

---

### 12. AI Provider API Keys

**Problem:** Claude API key is required for the coach feature:
```python
CLAUDE_API_KEY: Optional[str] = None
```

**Solution:**
- Set `CLAUDE_API_KEY` in Render environment variables

---

## Render Configuration Checklist

### Frontend (Static Site)

| Setting | Value |
|---------|-------|
| Build Command | `npm run build` |
| Publish Directory | `dist` |
| Environment Variables | See below |

**Frontend Environment Variables:**
```
VITE_API_URL=https://your-backend.onrender.com
VITE_ENDPOINT=https://your-backend.onrender.com
```

### Backend (Web Service)

| Setting | Value |
|---------|-------|
| Build Command | `pip install -r requirements.txt` |
| Start Command | `uvicorn api:app --host 0.0.0.0 --port $PORT` |
| Health Check Path | `/health` |
| Environment Variables | See below |

**Backend Environment Variables (Required):**
```
ENVIRONMENT=production
MONGODB_URI=mongodb+srv://user:pass@cluster.mongodb.net/deburn
JWT_SECRET=<generate-64-char-random-string>
CLAUDE_API_KEY=<your-anthropic-api-key>
FRONTEND_URL=https://your-frontend.onrender.com
CORS_ORIGINS=https://your-frontend.onrender.com
```

**Backend Environment Variables (Optional):**
```
SMTP_HOST=smtp.sendgrid.net
SMTP_PORT=587
SMTP_USER=apikey
SMTP_PASSWORD=<your-smtp-password>
SMTP_FROM_EMAIL=noreply@yourdomain.com
```

---

## Summary of Required Fixes

| Priority | Issue | Location | Fix |
|----------|-------|----------|-----|
| Critical | CORS localhost | mock_api.py | Set CORS_ORIGINS env var |
| Critical | Frontend env vars | .env | Set VITE_ENDPOINT in Render |
| Critical | Backend FRONTEND_URL | app/config.py | Set FRONTEND_URL env var |
| Critical | Cookie SameSite | Backend CORS | Ensure proper cookie settings |
| High | In-memory tokens | jwt_auth.py | Use Redis or accept limitation |
| Medium | JWT_SECRET | config | Generate and set secure secret |
| Medium | SMTP config | config | Configure for email functionality |
| Low | MongoDB URI | config | Use cloud MongoDB |

---

## Testing Checklist

After deployment, verify:

- [ ] Frontend loads without console errors
- [ ] Login/Register works
- [ ] API calls succeed (check Network tab)
- [ ] Cookies are set correctly (check Application tab)
- [ ] Password reset email links work
- [ ] Coach AI streaming works
- [ ] Check-in flow completes
- [ ] Health endpoint returns `{"status": "ok"}`
