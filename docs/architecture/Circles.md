# Circles

> **Rebranding Note (January 2026):** "Circles" has been rebranded to **"Think Tanks"** in the user-facing application. The codebase retains the original "circles" terminology for backward compatibility.

## Functions

### loadCirclesData

- **Inputs:** None (async function)
- **Outputs:** (void) Updates groups, invitations, upcomingMeetings state
- **Description:** Fetches groups and invitations from API in parallel, updates state

### formatMeetingDate

- **Inputs:**
  - `dateString` (string): ISO date string
- **Outputs:** (string) Formatted date (e.g., "Sat, Jan 11, 3:00 PM")
- **Description:** Formats meeting date for display

---

## Components

### GroupCard

- **Props:**
  - `group` (object): Group data object
  - `t` (function): Translation function
- **Description:** Renders a circle group card with icon, name, member count, member avatars, and next meeting info

---

## State

- `isLoading` (boolean): Loading state for data fetch
- `groups` (array): Array of group objects
- `invitations` (array): Array of pending invitation objects
- `upcomingMeetings` (array): Array of upcoming meeting objects

---

## API Calls

- `GET /api/circles/groups` - Fetches user's circle groups
  - Response: `{ success, data: { groups: [...], upcomingMeetings: [...] } }`
- `GET /api/circles/invitations` - Fetches pending invitations
  - Response: `{ success, data: { invitations: [...] } }`
