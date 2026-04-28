# Profile

## Functions

### handleAvatarUpload

- **Inputs:**
  - `e` (Event): File input change event
- **Outputs:** (void) Updates avatarUrl state, calls refreshUser
- **Description:** Validates file (size < 1MB, type JPG/PNG), uploads via FormData, updates avatar

### handleRemoveAvatar

- **Inputs:** None (async function)
- **Outputs:** (void) Clears avatarUrl state
- **Description:** Sends request to remove avatar, updates state

### handleSubmit

- **Inputs:**
  - `e` (Event): Form submit event
- **Outputs:** (void) Updates profile, shows success message
- **Description:** Submits profile form data to API, shows success feedback

### changeLanguage

- **Inputs:**
  - `lang` (string): Language code ('en' or 'sv')
- **Outputs:** (void) Changes i18n language
- **Description:** Changes the application language

### handleLogout

- **Inputs:** None (async function)
- **Outputs:** (void) Logs out and navigates to login
- **Description:** Calls logout from AuthContext, redirects to login page

### handleClearConversationHistory

- **Inputs:** None (async function)
- **Outputs:** (void) Clears conversation history
- **Description:** Shows confirmation dialog, deletes conversation history from backend via DELETE /api/conversations, clears localStorage, shows success feedback

---

## State

- `isSaving` (boolean): Form submission state
- `showSuccess` (boolean): Success message visibility
- `error` (string): Error message
- `firstName` (string): First name input
- `lastName` (string): Last name input
- `email` (string): Email (read-only)
- `organization` (string): Organization input
- `role` (string): Job title input
- `bio` (string): Bio textarea
- `avatarUrl` (string): Current avatar URL
- `isClearingHistory` (boolean): Clear history loading state
- `historyCleared` (boolean): Clear history success feedback

---

## API Calls

- `POST /api/profile/avatar` - Uploads avatar image (multipart/form-data)
- `PUT /api/profile/avatar` - Removes avatar `{ remove: true }`
- `PUT /api/profile` - Updates profile data
  - Body: `{ firstName, lastName, organization, role, bio }`
- `DELETE /api/conversations` - Clears all conversation history
