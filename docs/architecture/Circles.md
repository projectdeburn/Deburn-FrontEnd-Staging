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

### AvailabilityBanner

- **Props:**
  - `availability` (array): Array of availability slot objects `[{ date, hour }, ...]`
  - `onSaveAvailability` (function): Callback when user saves availability
  - `isSaving` (boolean): Whether save is in progress
  - `isExpanded` (boolean): External control for expanded state
  - `onToggleExpanded` (function): External callback for toggle
- **Description:** Collapsible banner for setting availability with monthly calendar grid and hour selection chips

#### Helper Functions

| Function | Description |
|----------|-------------|
| `formatDateKey(date)` | Formats Date object as "YYYY-MM-DD" string |
| `getTodayKey()` | Returns today's date as "YYYY-MM-DD" |
| `formatHour(hour)` | Formats 0-23 hour as "12am", "3pm", etc. |
| `getCalendarDays(year, month)` | Returns array of date objects for calendar grid |

#### Calendar Grid Features

- Monthly view with 7-column grid
- Click date to expand hour selection (24 chips)
- Visual indicators for dates with slots
- Month navigation (prev/next arrows)
- Past dates disabled and grayed out
- Today highlighted with border
- Current month dates only (no padding dates)

### ScheduleMeetingModal

- **Props:**
  - `isOpen` (boolean): Whether modal is visible
  - `onClose` (function): Callback to close modal
  - `group` (object): Group data
  - `onSchedule` (function): Callback when meeting scheduled
  - `onMeetingCancelled` (function): Callback when meeting cancelled
- **Description:** Modal for scheduling group meetings, shows available time slots based on member availability

#### Helper Functions

| Function | Description |
|----------|-------------|
| `filterAndSortSlots(slots)` | Filters past dates and low-attendance slots, sorts by date |
| `formatSlotDate(slot)` | Formats slot date for display |
| `formatHour(hour)` | Formats hour for display (e.g., "2:00 PM") |
| `getBookedMeeting(slot)` | Returns existing meeting if slot is booked |

---

## State

- `isLoading` (boolean): Loading state for data fetch
- `groups` (array): Array of group objects
- `invitations` (array): Array of pending invitation objects
- `upcomingMeetings` (array): Array of upcoming meeting objects

### AvailabilityBanner State

- `internalExpanded` (boolean): Internal expanded state
- `viewYear` (number): Currently viewed year
- `viewMonth` (number): Currently viewed month (0-11)
- `selectedDate` (string|null): Selected date key ("YYYY-MM-DD")
- `selectedSlots` (Set): Set of selected slot keys ("YYYY-MM-DD-HH")
- `hasChanges` (boolean): Whether unsaved changes exist

---

## API Calls

- `GET /api/circles/groups` - Fetches user's circle groups
  - Response: `{ success, data: { groups: [...], upcomingMeetings: [...] } }`
- `GET /api/circles/invitations` - Fetches pending invitations
  - Response: `{ success, data: { invitations: [...] } }`
- `PUT /api/circles/availability` - Updates user's availability
  - Request: `{ groupId, slots: [{ date: "YYYY-MM-DD", hour: 0-23 }] }`
  - Response: `{ success, data: { ... } }`
- `GET /api/circles/groups/:id/common-availability` - Fetches group availability for scheduling
  - Response: `{ success, data: { totalMembers, members, slots: [{ date, hour, availableCount, availableMembers }] } }`
