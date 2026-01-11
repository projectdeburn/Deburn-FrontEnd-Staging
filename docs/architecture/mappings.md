# Page Mappings: Original → React

This document maps the original vanilla JavaScript frontend (`public-backup/`) to the React frontend (`src/`) for reference during refactoring.

---

## How the Original App Works

The original frontend is a **single-page application (SPA)** built with vanilla JavaScript:

```
public-backup/
├── index.html          ← Contains ALL app screens as <div> elements
├── hub.html            ← Separate page for Hub admin
├── prototype.js        ← Main app logic, navigation, screen switching
├── prototype.css       ← Main styles
├── styles.css          ← Additional styles
├── hub.css             ← Hub-specific styles
├── js/
│   ├── authClient.js   ← Authentication API calls
│   ├── coachClient.js  ← Coach/AI chat API calls
│   ├── hubClient.js    ← Hub admin API calls
│   └── i18nClient.js   ← Internationalization
└── legal/
    ├── privacy-policy.html
    ├── terms-of-service.html
    └── cookie-policy.html
```

### Key Concept: Screens in index.html

Inside `index.html`, there are **15 screens** as `<div>` elements:

```html
<div id="screen-login" class="screen auth-screen">...</div>
<div id="screen-register" class="screen auth-screen">...</div>
<div id="screen-dashboard" class="screen active">...</div>
<!-- etc. -->
```

- Only **one screen has `.active`** class at a time (making it visible)
- Navigation calls `showScreen('dashboard')` which:
  1. Removes `.active` from current screen
  2. Adds `.active` to target screen
- This creates the illusion of page navigation without actual page loads

---

## How the React App Works

The React app uses **React Router** for real URL-based routing:

```
src/
├── App.jsx                    ← Routes defined here
├── pages/
│   ├── Dashboard.jsx          ← Each screen is its own file
│   ├── Checkin.jsx
│   ├── Coach.jsx
│   ├── ...
│   └── auth/
│       ├── Login.jsx
│       └── Register.jsx
├── components/
│   ├── layout/                ← Sidebar, Header, Layout wrappers
│   └── ui/                    ← Reusable UI components
└── context/
    └── AuthContext.jsx        ← Authentication state
```

---

## Screen-to-Component Mapping

### Auth Pages

| Original (index.html) | Line # | React Route | React File |
|----------------------|--------|-------------|------------|
| `#screen-login` | 1389 | `/login` | `src/pages/auth/Login.jsx` |
| `#screen-register` | 1448 | `/register` | `src/pages/auth/Register.jsx` |
| `#screen-forgot-password` | 1656 | `/forgot-password` | `src/pages/auth/ForgotPassword.jsx` |
| `#screen-reset-password` | 1693 | `/reset-password` | `src/pages/auth/ResetPassword.jsx` |
| `#screen-reset-success` | 1750 | (merged into above) | `src/pages/auth/ResetPassword.jsx` |
| `#screen-verify-pending` | 1603 | `/verify-email` | `src/pages/auth/VerifyEmail.jsx` |
| `#screen-verify-success` | 1632 | (merged into above) | `src/pages/auth/VerifyEmail.jsx` |

### Main App Pages (requires login)

| Original (index.html) | Line # | React Route | React File |
|----------------------|--------|-------------|------------|
| `#screen-dashboard` | 20 | `/` | `src/pages/Dashboard.jsx` |
| `#screen-checkin` | 260 | `/checkin` | `src/pages/Checkin.jsx` |
| `#screen-coach` | 462 | `/coach` | `src/pages/Coach.jsx` |
| `#screen-learning` | 616 | `/learning` | `src/pages/Learning.jsx` |
| `#screen-circles` | 723 | `/circles` | `src/pages/Circles.jsx` |
| `#screen-progress` | 813 | `/progress` | `src/pages/Progress.jsx` |
| `#screen-profile` | 1017 | `/profile` | `src/pages/Profile.jsx` |
| `#screen-admin` | 1206 | `/admin` | `src/pages/Admin.jsx` |

### Separate Files

| Original File | React Route | React File |
|---------------|-------------|------------|
| `hub.html` | `/hub` | `src/pages/Hub.jsx` |
| `legal/privacy-policy.html` | `/privacy-policy` | `src/pages/legal/PrivacyPolicy.jsx` |
| `legal/terms-of-service.html` | `/terms-of-service` | `src/pages/legal/TermsOfService.jsx` |
| `legal/cookie-policy.html` | `/cookie-policy` | `src/pages/legal/CookiePolicy.jsx` |

---

## Branding

| Item | Original | React (current) | Action |
|------|----------|-----------------|--------|
| Logo text | `Deburn` | `Eve` | Update React to use `Deburn` |

---

## Reading the Original HTML

To view a specific screen from the original `index.html`:

| Screen | Lines |
|--------|-------|
| Login | 1389–1445 |
| Register | 1448–1600 |
| Forgot Password | 1656–1692 |
| Reset Password | 1693–1749 |
| Verify Pending | 1603–1631 |
| Verify Success | 1632–1655 |
| Dashboard | 20–259 |
| Checkin | 260–461 |
| Coach | 462–615 |
| Learning | 616–722 |
| Circles | 723–812 |
| Progress | 813–1016 |
| Profile | 1017–1205 |
| Admin | 1206–1388 |

---

## CSS Classes Reference

Both versions use the same CSS from `prototype.css`. Key classes:

### Auth Pages
```
.auth-screen          - Full-screen auth wrapper
.auth-container       - Centered card container
.auth-header          - Logo + title section
.auth-logo-text       - Logo text ("Deburn")
.auth-title           - Main heading
.auth-subtitle        - Subheading
.auth-form            - Form wrapper
.auth-alert.error     - Error message box
.auth-language-switcher - Language toggle
```

### Forms
```
.form-group           - Input wrapper
.form-label           - Label text
.form-input           - Text input
.form-select          - Dropdown select
.form-error           - Error text
.form-row             - Horizontal row
.form-row-grid        - Two-column grid
.form-link            - Link styling
.form-footer          - Bottom links
.form-submit          - Submit button
```

### Password
```
.password-wrapper     - Input + toggle container
.password-toggle      - Eye icon button
.password-strength    - Strength meter wrapper
.strength-bar         - Bar container
.strength-segment     - Individual bar segment
.strength-text        - "Weak"/"Strong" text
```

### Consent/Checkboxes
```
.consent-section      - Terms section wrapper
.consent-section-title - Section heading
.checkbox-group       - Checkbox + label wrapper
.checkbox-input       - The checkbox
.checkbox-label       - Label text
```
