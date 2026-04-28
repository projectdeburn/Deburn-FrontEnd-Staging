# API Locations

This document lists all `/api` call locations in the codebase.

## Summary

- **Directories searched:** `src`, `public`
- **Note:** `utils` directory does not exist at root level (API utilities are in `src/utils/`)
- **Note:** `public` directory contains no API calls
- **Status:** All API calls have been updated to use `${process.env.ENDPOINT}/api/...` pattern

## API Calls (Updated)

| File | Line | API Path |
|------|------|----------|
| src/pages/Circles.jsx | 72 | `${process.env.ENDPOINT}/api/circles/groups` |
| src/pages/Circles.jsx | 73 | `${process.env.ENDPOINT}/api/circles/invitations` |
| src/pages/Admin.jsx | 105 | `${process.env.ENDPOINT}/api/admin/stats` |
| src/pages/Progress.jsx | 94 | `${process.env.ENDPOINT}/api/progress/stats` |
| src/pages/Progress.jsx | 95 | `${process.env.ENDPOINT}/api/checkin/trends?period=${period}` |
| src/pages/Progress.jsx | 96 | `${process.env.ENDPOINT}/api/progress/insights` |
| src/pages/Dashboard.jsx | 91 | `${process.env.ENDPOINT}/api/dashboard` |
| src/pages/Dashboard.jsx | 92 | `${process.env.ENDPOINT}/api/checkin/trends?period=7` |
| src/pages/Hub.jsx | 112 | `${process.env.ENDPOINT}/api/hub/organization` |
| src/pages/Hub.jsx | 113 | `${process.env.ENDPOINT}/api/hub/members` |
| src/pages/Learning.jsx | 77 | `${process.env.ENDPOINT}/api/learning/modules` |
| src/pages/auth/ForgotPassword.jsx | 23 | `${process.env.ENDPOINT}/api/auth/forgot-password` |
| src/pages/auth/VerifyEmail.jsx | 31 | `${process.env.ENDPOINT}/api/auth/verify-email` |
| src/pages/auth/VerifyEmail.jsx | 54 | `${process.env.ENDPOINT}/api/auth/resend-verification` |
| src/pages/auth/ResetPassword.jsx | 47 | `${process.env.ENDPOINT}/api/auth/reset-password` |
| src/pages/Profile.jsx | 111 | `${process.env.ENDPOINT}/api/profile/avatar` |
| src/pages/Profile.jsx | 123 | `${process.env.ENDPOINT}/api/profile/avatar` |
| src/pages/Profile.jsx | 138 | `${process.env.ENDPOINT}/api/profile` |
| src/pages/Checkin.jsx | 218 | `${process.env.ENDPOINT}/api/checkin` |

## Base URL Constants (Updated)

These files define API base paths as constants:

| File | Line | API Path |
|------|------|----------|
| src/features/hub/hubApi.js | 8 | `${process.env.ENDPOINT}/api/hub` |
| src/features/coach/coachApi.js | 8 | `${process.env.ENDPOINT}/api/coach` |
| src/features/auth/authApi.js | 8 | `${process.env.ENDPOINT}/api/auth` |

## Configuration

To change the API endpoint, update the `ENDPOINT` variable in your environment file (`.env`).
