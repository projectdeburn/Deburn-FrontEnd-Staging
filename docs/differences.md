# Styling & Feature Differences: Deburn-FrontEnd vs deburnalpha Prototype

This document outlines the differences between the main frontend (`src/`) and the prototype at `/Users/christopher/Documents/Deburn/deburnalpha/public/`.

---

## Summary Table

### Feature Differences
| Item | Prototype | React Frontend | Status |
|------|-----------|----------------|--------|
| Profile - Coach Preferences | Voice selection + Preview | IMPLEMENTED | DONE |
| Profile - Legal section | Has links to Privacy/Terms | IMPLEMENTED | DONE |
| Profile - Max file size | 5MB | 5MB | DONE |
| Registration - Country field | Has country dropdown | VERIFIED EXISTS | DONE |
| Registration - Consent checkboxes | 4 checkboxes (3 required, 1 optional) | VERIFIED EXISTS | DONE |
| Admin - Email Diagnostics | Has test email feature | IMPLEMENTED | DONE |
| Mobile Navigation | Bottom nav bar | VERIFIED MATCHES | DONE |
| Audio Modal | Visualizer, seek, skip controls, rating | VERIFIED MATCHES | DONE |
| Article Modal | Title, meta, content, rating, close | VERIFIED MATCHES | DONE |
| Hero Images | Updated images | UPDATED | DONE |
| Feedback page | No hero section | Has hero section | KEPT (React version looks good) |

### Hero Images Status
| Image | Status |
|-------|--------|
| hero-coach.jpg | UPDATED - Copied newer version from prototype |
| hero-admin.jpg | ADDED - Was missing, copied from prototype |
| hero-circles.jpg | MATCHES |
| hero-learning.jpg | MATCHES |
| hero-nordic-calm.jpg | MATCHES |
| hero-progress.jpg | MATCHES |

### Text/Translation Status
| Item | Status |
|------|--------|
| Progress translation keys | FIXED - Added alias keys |
| Admin translations | CREATED - admin.json (EN/SV) |
| CirclesAdmin diagnostics translations | ADDED |
| Profile Coach Preferences translations | ADDED |
| Profile Legal translations | ADDED |

### Styling (All Match)
| Item | Prototype | React Frontend | Status |
|------|-----------|----------------|--------|
| Dashboard chart stroke | 2px | 2px | MATCHES |
| Progress chart stroke | 2.5px | 2.5px | MATCHES |

---

## Completed Changes

### 1. Profile Page - Coach Preferences Section (COMPLETED)

Added to `src/pages/Profile.jsx`:
- Voice selection dropdown with High/Low pitch options
- Preview button to test voice
- Saves preference to localStorage (`coachVoice`)

Added translations to `profile.json` (EN/SV):
```json
"coachPreferences": {
  "title": "Coach Preferences",
  "voice": "Voice",
  "voiceDescription": "Choose the voice Eve uses when reading messages aloud",
  "previewVoice": "Preview Voice",
  "previewDescription": "Listen to a sample of the selected voice",
  "preview": "Preview",
  "highPitch": "High Pitch",
  "lowPitch": "Low Pitch"
}
```

### 2. Profile Page - Legal Section (COMPLETED)

Added to `src/pages/Profile.jsx`:
- Privacy Policy link (opens `/legal/privacy-policy.html`)
- Terms of Service link (opens `/legal/terms-of-service.html`)

Added translations to `profile.json` (EN/SV):
```json
"legal": {
  "title": "Legal",
  "privacy": "Privacy Policy",
  "terms": "Terms of Service"
}
```

### 3. Profile Picture Max Size (COMPLETED)

Updated in `profile.json` (EN/SV):
- Changed from 1MB to 5MB to match prototype

### 4. Progress Translation Keys (COMPLETED)

Added missing/alias keys to `progress.json` (EN/SV):
```json
{
  "stats": {
    "streak": "Day Streak",
    "lessons": "Lessons Completed",
    "sessions": "Coach Sessions"
  },
  "trends": {
    "last": "Last",
    "days": "Days",
    "mood": "Overall Mood",
    "stress": "Stress Levels"
  },
  "insights": {
    "noInsights": "No insights yet",
    "prompt": "Complete a few check-ins to start seeing personalized insights..."
  }
}
```

### 5. Admin Translation File (COMPLETED)

Created `src/locales/en/admin.json` and `src/locales/sv/admin.json` with all Admin page translations.
Registered namespace in `src/utils/i18n.js`.

### 6. CirclesAdmin - Email Diagnostics (COMPLETED)

Added to `src/pages/CirclesAdmin.jsx`:
- Email diagnostics form with recipient, subject, message fields
- Send test email functionality
- Success/error result display

Added to `src/features/circles/circles-adminApi.js`:
```javascript
sendDiagnosticEmail({ to, subject, message }) {
  return post(`${CIRCLES_BASE}/admin/diagnostic-email`, { to, subject, message });
}
```

Added translations to `circlesAdmin.json` (EN/SV):
```json
"diagnostics": {
  "title": "Email Diagnostics",
  "recipientEmail": "Recipient Email",
  "recipientPlaceholder": "test@example.com",
  "subject": "Subject",
  "subjectPlaceholder": "Test Email Subject",
  "message": "Message",
  "messagePlaceholder": "Enter your test message here...",
  "sendButton": "Send Test Email",
  "sending": "Sending...",
  "noRecipient": "Please enter a recipient email",
  "success": "Test email sent successfully!",
  "error": "Failed to send test email"
}
```

### 7. Hero Images (COMPLETED)

Updated hero images to match prototype:

**hero-coach.jpg** - Copied newer version from prototype (19KB vs 44KB)
- Used by: `Coach.jsx`, `Feedback.jsx`

**hero-admin.jpg** - Added (was missing from React)
- Copied from prototype (33KB)
- Updated `CirclesAdmin.jsx` to use `hero-admin.jpg` instead of `hero-circles.jpg`

Other hero images already matched and were unchanged.

---

## Verified Features (No Changes Needed)

### Mobile Navigation (VERIFIED - MATCHES)

`src/components/layout/Layout.jsx` has bottom mobile navigation with:
- Home (Dashboard)
- Check-in
- Eve (Coach)
- Learn
- Circles
- Feedback
- Admin (conditional for admin users)

### Learning Modals (VERIFIED - MATCHES)

`src/components/learning/AudioModal.jsx`:
- Meditative visualization with SVG orbs
- Progress bar with seek functionality
- Play/pause, skip -10/+10 buttons
- SmileyRating component for thumbs up/down

`src/components/learning/ArticleModal.jsx`:
- Title with icon
- Meta info (reading time)
- Formatted article content
- SmileyRating component
- Close button

### Registration Page (VERIFIED - EXISTS)

- Country dropdown field exists
- Consent checkboxes exist (Terms, Privacy, Data processing, Marketing optional)

### Pages That Match (No Changes Needed)

**Dashboard**
- Hero section: OK
- Check-in card with streak: OK
- Today's Focus card: OK
- Week at a Glance (3 trends): OK
- Quick Access (3 cards): OK
- Chart stroke-width: 2px (matches)

**Progress**
- Hero section: OK
- Stats grid (4 cards): OK
- Period selector (7/30/90 days): OK
- Chart stroke-width: 2.5px (matches)
- Insights section: OK

**Check-in**
- 4-step flow: OK
- Mood faces: OK
- Energy sliders: OK
- Sleep options: OK
- Completion screen: OK

**Coach (Ask Eve)**
- Hero section: OK
- Chat interface: OK
- Conversation starters: OK
- Voice input button: OK
- Clear history link: OK

**Learning**
- Hero section: OK
- Dynamic content grid: OK
- Audio/Article modals: OK

**Circles**
- Hero section: OK
- Availability banner: OK
- Dynamic content: OK

---

## Minor Differences (Low Priority - Optional)

### Coach Welcome Greeting

| Location | Text |
|----------|------|
| **Prototype** | "Hello! I'm **your AI Leadership Coach**..." |
| **React** | "Hello! I'm **Eve, your leadership coach**..." |

**Decision:** Keep React version - "Eve" provides more personality

---

## Files Modified

### Translation Files
1. `src/locales/en/progress.json` - Added missing/alias keys
2. `src/locales/sv/progress.json` - Added missing/alias keys
3. `src/locales/en/profile.json` - Added Coach Preferences, Legal, updated file size
4. `src/locales/sv/profile.json` - Added Coach Preferences, Legal, updated file size
5. `src/locales/en/admin.json` - CREATED NEW FILE
6. `src/locales/sv/admin.json` - CREATED NEW FILE
7. `src/locales/en/circlesAdmin.json` - Added diagnostics translations
8. `src/locales/sv/circlesAdmin.json` - Added diagnostics translations

### Component Files
1. `src/pages/Profile.jsx` - Added Coach Preferences and Legal sections
2. `src/pages/CirclesAdmin.jsx` - Added Email Diagnostics section, updated hero image to hero-admin.jpg
3. `src/features/circles/circles-adminApi.js` - Added sendDiagnosticEmail function
4. `src/utils/i18n.js` - Registered admin namespace

### Image Files
1. `src/assets/images/hero-coach.jpg` - Updated from prototype (newer version)
2. `src/assets/images/hero-admin.jpg` - Added from prototype (was missing)
