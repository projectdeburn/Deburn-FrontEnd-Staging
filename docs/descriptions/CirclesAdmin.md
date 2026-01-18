# Circles Admin

## Overview

The Circles Admin page enables **organization administrators** to manage circle pools, send invitations, and assign groups. This is the administrative interface for the Leadership Circles feature, accessible only to users with org admin privileges.

**Route:** `/circles/admin`
**Access:** Organization administrators only (checked via `GET /api/auth/admin-status`)

## Design Philosophy

Follows Deburn's **Scandinavian Minimalism** design:
- Clean, minimal interface with warm neutral colors
- Card-based layout with subtle 1px borders (no drop shadows)
- Font: Inter (400, 500, 600 weights)
- Primary color: #2D4A47 (Deep Forest)
- Background: #F8F7F4 (Warm White)

## Layout Structure

### Header (Hero Section)
- **Title:** "Admin Panel" (hero-greeting class)
- **Tagline:** "Manage circle invitations" (hero-tagline class)
- Hero image: hero-circles.jpg with overlay

### Pool Info Section
Displays the current pool information:
- **Pool Name** (section title)
- **Status Badge** showing pool status:
  - `draft` - Gray badge
  - `inviting` - Blue badge
  - `active` - Green badge
  - `completed` - Gray badge
  - `cancelled` - Red badge

### Send Invitations Section
Form for sending new invitations:

**Structure:**
```
┌─────────────────────────────────────────────────┐
│ Send Invitations                                │
├─────────────────────────────────────────────────┤
│ Paste emails (comma or newline separated)       │
│ ┌─────────────────────────────────────────────┐ │
│ │ email1@example.com, email2@example.com      │ │
│ │ email3@example.com                          │ │
│ │                                             │ │
│ └─────────────────────────────────────────────┘ │
│                                                 │
│ [0 emails detected]         [Send Invitations]  │
└─────────────────────────────────────────────────┘
```

**Elements:**
- Label: "Paste emails (comma or newline separated)"
- Textarea for email input (5 rows)
- Email count indicator (auto-updates as user types)
- "Send Invitations" primary button with send icon

### Invited Users Section
Table listing all invitations for the pool:

**Structure:**
```
┌─────────────────────────────────────────────────┐
│ Invited Users (15)                              │
├─────────────────────────────────────────────────┤
│ Email              │ Status    │ Action         │
│────────────────────┼───────────┼────────────────│
│ john@example.com   │ pending   │ [trash icon]   │
│ anna@example.com   │ accepted  │ [trash icon]   │
│ erik@example.com   │ declined  │ [trash icon]   │
│ lisa@example.com   │ expired   │ [trash icon]   │
└─────────────────────────────────────────────────┘
```

**Status Badges:**
- `pending` - Yellow/amber
- `accepted` - Green
- `declined` - Gray
- `expired` - Gray
- `cancelled` - Red

**Empty State:**
- Users icon
- "No invitations yet"

### Groups Section
Displays assigned groups and provides group assignment control:

**Header:**
- Title: "Groups (3)"
- "Assign Groups" button (secondary, shown when enough accepted invitations)

**Group Cards:**
```
┌─────────────────────────────────────────────────┐
│ Group 1                                         │
├─────────────────────────────────────────────────┤
│ [Avatar] [Avatar] [Avatar] [Avatar]             │
│ Anna S., Erik L., Lisa K., Johan M.             │
│ 4 members                                       │
└─────────────────────────────────────────────────┘
```

**Empty State:**
- Users icon
- "No groups assigned yet"

---

## User Flow

1. User navigates to `/circles/admin`
2. System checks admin status via `GET /api/auth/admin-status`
3. **If not admin:** Redirects to dashboard
4. **If admin:** Loads admin data:
   - Fetches pools for organization
   - Auto-selects first pool (or creates default)
   - Loads pool invitations and groups
5. Admin can:
   - View pool status
   - Paste emails and send invitations
   - View invitation statuses
   - Remove pending invitations
   - Assign members to groups (when enough accepted)
   - View assigned groups

---

## States

### Loading State
- Centered spinner
- "Loading..." text

### Not Admin State
- Redirects to dashboard (user should not see this page)

### Error State
- Error icon
- Error message
- "Try Again" button

---

# AI Section (AI Will Edit This Section Only)

## Q&A

Question: Answer (DD/MM/YY)

## Edge Cases

- Not an org admin: Redirects to dashboard
- No pools exist: Auto-creates a default pool
- No invitations: Shows empty state with users icon
- No groups assigned: Shows empty state, hides assign button
- Not enough accepted invitations for groups: Hides assign button
- Email parse errors: Shows count of valid emails only
- Duplicate emails: Skipped during invitation send, reported in response
- Send invitations success: Shows toast with sent/failed/duplicate counts
- Assign groups success: Shows toast, refreshes groups list

## Components (AI)

### File Structure
```
src/
  pages/
    CirclesAdmin.jsx            # Main admin page component
  components/
    circles/
      AdminPoolInfo.jsx         # Pool name and status display
      AdminInviteForm.jsx       # Email textarea and send button
      AdminInvitationTable.jsx  # Table of invitations
      AdminGroupCard.jsx        # Individual group card
      AdminGroupsSection.jsx    # Groups list with assign button
  features/
    circles/
      circlesAdminApi.js        # API layer for admin endpoints
```

### Component Responsibilities (SOLID - Single Responsibility)
- **CirclesAdmin.jsx**: Main page layout, admin check, data loading, state management
- **AdminPoolInfo.jsx**: Display pool name and status badge
- **AdminInviteForm.jsx**: Email input, parsing, send action
- **AdminInvitationTable.jsx**: Render invitation list with status and remove action
- **AdminGroupCard.jsx**: Render individual group with members
- **AdminGroupsSection.jsx**: Groups list header with assign button, group cards
- **circlesAdminApi.js**: All admin API calls, centralized error handling

### Shared UI
- Hero section (existing pattern)
- Card containers with 1px borders
- Primary/secondary/danger buttons
- Status badges
- Avatar components with initials
- Loading spinner
- Toast notifications

### i18n
Full translation support using `useTranslation(['circlesAdmin', 'common'])` with keys like:
- `circlesAdmin:hero.title` = "Admin Panel"
- `circlesAdmin:hero.tagline` = "Manage circle invitations"
- `circlesAdmin:pool.status.draft` = "Draft"
- `circlesAdmin:pool.status.inviting` = "Inviting"
- `circlesAdmin:pool.status.active` = "Active"
- `circlesAdmin:invite.title` = "Send Invitations"
- `circlesAdmin:invite.placeholder` = "Paste emails..."
- `circlesAdmin:invite.emailCount` = "{count} emails detected"
- `circlesAdmin:invite.sendButton` = "Send Invitations"
- `circlesAdmin:invitations.title` = "Invited Users"
- `circlesAdmin:invitations.empty` = "No invitations yet"
- `circlesAdmin:groups.title` = "Groups"
- `circlesAdmin:groups.assignButton` = "Assign Groups"
- `circlesAdmin:groups.empty` = "No groups assigned yet"
