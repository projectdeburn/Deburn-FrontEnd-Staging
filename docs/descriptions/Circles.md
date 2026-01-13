# Circles

## Overview

The Circles page enables peer support through **Leadership Circles** - groups of peers who meet regularly to discuss leadership challenges. Users can view their circles, manage invitations, set their availability for meetings, and schedule/join video calls.

**Route:** `/circles`
**Access:** Authenticated users only

## Design Philosophy

Follows Deburn's **Scandinavian Minimalism** design:
- Clean, minimal interface with warm neutral colors
- Card-based layout with subtle 1px borders (no drop shadows)
- Font: Inter (400, 500, 600 weights)
- Primary color: #2D4A47 (Deep Forest)
- Background: #F8F7F4 (Warm White)

## Layout Structure

### Header (Hero Section)
- **Title:** "Leadership Circles" (hero-greeting class)
- **Tagline:** "Connect with peers who understand" (hero-tagline class)
- Hero image: hero-circles.jpg with overlay

### Availability Banner
Prominent banner below hero showing availability status:

**When availability NOT set:**
- Calendar icon
- Title: "Set Your Availability"
- Description: "Mark when you're free to meet with your circle. This helps find times that work for everyone."
- Primary button: "Set Availability"

**When availability IS set:**
- Check-circle icon (green)
- Title: "Availability Set"
- Description: "You've marked X time slots as available."
- Ghost button: "Edit"

### Pending Invitations Section
Only shown when user has pending invitations.

**Invitation Card:**
- Mail icon
- Pool/Circle name (e.g., "Leadership Circle")
- Description: "You've been invited to join a leadership circle"
- Expiration date: "Expires: [date]"
- Actions: "Accept" (primary) | "Decline" (ghost)

### Your Circles Section
- Section title: "Your Circles"
- Grid of circle cards

**Circle Card Structure:**
```
┌─────────────────────────────────────────────────┐
│ ┌─────────────────────┐  ┌──────────────────┐  │
│ │ Circle Name         │  │ 📅 Next meeting  │  │
│ │ 6 members · Bi-weekly│  │    Jan 15, 3pm   │  │
│ └─────────────────────┘  └──────────────────┘  │
│                                                 │
│ [Avatar] [Avatar] [Avatar] [Avatar] [Avatar]   │
│                                                 │
│ Discussion topic                                │
│ Managing remote team dynamics                   │
│                                                 │
│ [Join Video Call]  [View Details]              │
│ (or [Schedule Meeting] if no upcoming meeting) │
└─────────────────────────────────────────────────┘
```

**Circle Card Elements:**
- Circle name (h3)
- Meta info: member count + meeting cadence
- Next meeting badge (if scheduled) with calendar icon
- Member avatars (up to 6, with initials, colored backgrounds)
- Discussion topic (if set by pool)
- Action buttons:
  - "Join Video Call" (primary, if meeting has link) OR "Schedule Meeting" (primary, if no meeting)
  - "View Details" (ghost)

### Empty States

**No circles (with pending invitation):**
- Shows pending invitations section
- Then shows waiting state or empty state

**No circles (invitation accepted, waiting for group):**
- Check icon
- "Invitation accepted for: [Pool Name]"
- "You'll be notified when your circle group is formed."

**No circles at all:**
- Users icon
- Title: "No circles yet"
- Description: "You haven't been assigned to any leadership circles yet. When your organization admin creates a circle and assigns groups, you'll see your circle here."

**Not logged in:**
- Users icon
- Title: "Sign in to view your circles"
- Description: "Log in to see your leadership circles and connect with your peers."
- "Sign In" button

---

## Modals

### Availability Picker Modal
Weekly grid for selecting available time slots.

**Structure:**
- Header: "Set Your Availability" + close button
- Body: 7-day grid (Mon-Sun) with hourly slots (9am-6pm typical)
- Time slots can be toggled on/off
- Visual indication of selected slots
- Footer: "Cancel" | "Save Availability"

### Group Details Modal
Shows full circle information when "View Details" clicked.

**Structure:**
- Header: Circle name + close button
- Body:
  - Member list with avatars and names
  - Meeting history/upcoming meetings
  - Common availability display
- Footer: "Schedule Meeting" | "Close"

### Schedule Meeting Modal
For scheduling a new circle meeting.

**Structure:**
- Header: "Schedule Meeting" + close button
- Body:
  - If no common availability: Message to set availability first
  - If common availability exists:
    - Available time slots grid (based on common availability)
    - Meeting title input (default: "Circle Discussion")
- Footer: "Cancel" | "Schedule"

---

## API Endpoints

All endpoints prefixed with `/api/circles/`

### User Endpoints
- `GET /my-groups` - Get user's circle groups with next meeting info
- `GET /my-invitations` - Get pending and accepted invitations
- `GET /availability` - Get user's availability slots
- `PUT /availability` - Update user's availability slots

### Group Endpoints
- `GET /groups/:groupId` - Get group details
- `GET /groups/:groupId/meetings` - Get group's meetings
- `GET /groups/:groupId/availability` - Get group's common availability
- `POST /groups/:groupId/meetings` - Schedule a new meeting

### Invitation Endpoints
- `GET /invitations/:token` - Get invitation details
- `POST /invitations/:token/accept` - Accept invitation
- `POST /invitations/:token/decline` - Decline invitation

### Meeting Endpoints
- `POST /meetings/:meetingId/cancel` - Cancel a meeting
- `POST /meetings/:meetingId/attendance` - Update attendance

---

## User Flow

1. User navigates to `/circles`
2. System loads groups, invitations, and availability
3. **If has pending invitations:** Reviews and accepts/declines
4. **If has circles:**
   - Views availability banner, sets availability if not done
   - Browses circle cards
   - Can join video call (if meeting scheduled with link)
   - Can schedule meeting (if no upcoming meeting)
   - Can view group details
5. **If no circles:** Sees empty state with appropriate messaging

---

## States

### Loading State
- Centered spinner
- "Loading..." text

### Error State
- Error icon
- Error message
- "Try Again" button

---

# AI Section (AI Will Edit This Section Only)

## Q&A

Question: Answer (DD/MM/YY)

## Edge Cases

- No groups: Shows empty state with messaging about being assigned
- No invitations: Invitations section hidden
- No availability set: Shows "Set Your Availability" banner prominently
- Availability set: Shows "Availability Set" with edit option
- Meeting with link: Shows "Join Video Call" button
- Meeting without link: Shows meeting time only
- No upcoming meeting: Shows "Schedule Meeting" button
- Invitation accepted but no group yet: Shows waiting state
- Deep link to invitation: `/circles/invite/:token` handles invitation flow

## Components (AI)

### File Structure
```
src/
  pages/
    Circles.jsx                 # Main page component
  components/
    circles/
      CircleCard.jsx            # Individual circle card
      AvailabilityBanner.jsx    # Availability status banner
      InvitationCard.jsx        # Pending invitation card
      AvailabilityModal.jsx     # Time slot picker modal
      GroupDetailsModal.jsx     # Circle details modal
      ScheduleMeetingModal.jsx  # Meeting scheduler modal
  features/
    circles/
      circlesApi.js             # API layer for circles endpoints
```

### Component Responsibilities (SOLID - Single Responsibility)
- **Circles.jsx**: Main page layout, data loading, state management
- **CircleCard.jsx**: Render individual circle with actions
- **AvailabilityBanner.jsx**: Show/edit availability status
- **InvitationCard.jsx**: Display invitation with accept/decline
- **AvailabilityModal.jsx**: Weekly time grid for availability
- **GroupDetailsModal.jsx**: Full circle info display
- **ScheduleMeetingModal.jsx**: Meeting scheduling form
- **circlesApi.js**: All API calls, centralized error handling

### Shared UI
- Hero section (existing pattern)
- Card containers with 1px borders
- Primary/ghost/danger buttons
- Avatar components with initials
- Modal system
- Loading spinner

### i18n
Full translation support using `useTranslation(['circles', 'common'])` with keys like:
- `circles:hero.title` = "Leadership Circles"
- `circles:hero.tagline` = "Connect with peers who understand"
- `circles:availability.setTitle` = "Set Your Availability"
- `circles:availability.setDescription` = "Mark when you're free..."
- `circles:availability.doneTitle` = "Availability Set"
- `circles:groups.title` = "Your Circles"
- `circles:groups.scheduleМeeting` = "Schedule Meeting"
- `circles:groups.joinCall` = "Join Video Call"
- `circles:groups.viewDetails` = "View Details"
- `circles:invitations.title` = "Pending Invitations"
- `circles:empty.title` = "No circles yet"
