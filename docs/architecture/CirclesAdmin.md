# Circles Admin

> **Rebranding Note (January 2026):** "Circles" has been rebranded to **"Think Tanks"** in the user-facing application. The codebase retains the original "circles" terminology for backward compatibility.

## Functions

### checkAdminStatus

- **Inputs:** None (async function)
- **Outputs:** (boolean) Whether user is an organization admin
- **Description:** Calls `GET /api/auth/admin-status` to check if current user is an org admin. If not admin, redirects to dashboard.

### loadAdminData

- **Inputs:** None (async function)
- **Outputs:** (void) Updates pools, invitations, groups state
- **Description:** Fetches pools for organization, auto-selects first pool, loads pool invitations and groups in parallel.

### loadPoolData

- **Inputs:**
  - `poolId` (string): Pool ID to load data for
- **Outputs:** (void) Updates invitations, groups state
- **Description:** Fetches invitations and groups for a specific pool.

### parseEmails

- **Inputs:**
  - `text` (string): Raw text from textarea
- **Outputs:** (array) Array of valid email strings
- **Description:** Parses comma or newline separated emails, filters out invalid emails, returns array of valid emails.

### sendInvitations

- **Inputs:**
  - `emails` (array): Array of email strings to invite
- **Outputs:** (void) Sends invitations, shows toast, reloads invitations
- **Description:** Calls `POST /api/circles/pools/:id/invitations` with email list, displays result toast (sent/failed/duplicate counts).

### removeInvitation

- **Inputs:**
  - `invitationId` (string): Invitation ID to remove
- **Outputs:** (void) Removes invitation, reloads invitations
- **Description:** Calls `DELETE /api/circles/invitations/:id`, reloads invitation list on success.

### assignGroups

- **Inputs:** None (async function)
- **Outputs:** (void) Triggers group assignment, reloads groups
- **Description:** Calls `POST /api/circles/pools/:id/assign`, displays result toast, reloads groups list.

### moveMember

- **Inputs:**
  - `memberId` (string): Member user ID to move
  - `fromGroupId` (string): Source group ID
  - `toGroupId` (string): Target group ID
- **Outputs:** (void) Moves member, transfers availability, reloads groups
- **Description:** Calls `POST /api/circles/pools/:id/groups/:id/move-member`, also transfers member's availability to new group.

### removeMember

- **Inputs:**
  - `memberId` (string): Member user ID to remove
  - `groupId` (string): Group ID to remove from
- **Outputs:** (void) Removes member and invitation, reloads data
- **Description:** Calls `DELETE /api/circles/pools/:id/groups/:id/members/:id`, removes member from group and cancels their invitation.

### updateGroupName

- **Inputs:**
  - `groupId` (string): Group ID to update
  - `name` (string): New group name
- **Outputs:** (void) Updates group name, reloads groups
- **Description:** Calls `PATCH /api/circles/pools/:id/groups/:id` with new name.

### deleteGroup

- **Inputs:**
  - `groupId` (string): Group ID to delete
- **Outputs:** (void) Deletes group, reloads groups
- **Description:** Calls `DELETE /api/circles/pools/:id/groups/:id`, removes group and unassigns all members.

### createGroup

- **Inputs:**
  - `name` (string): New group name
- **Outputs:** (void) Creates group, reloads groups
- **Description:** Calls `POST /api/circles/pools/:id/groups` to create empty group.

---

## Components

### CirclesAdmin

- **Props:** None
- **Description:** Main admin page component. Handles admin check, data loading, and renders all admin sections.

### AdminPoolInfo

- **Props:**
  - `pool` (object): Pool data with name and status
  - `t` (function): Translation function
- **Description:** Renders pool name and status badge.

### AdminInviteForm

- **Props:**
  - `onSend` (function): Callback when send button clicked with emails array
  - `isLoading` (boolean): Whether send is in progress
  - `t` (function): Translation function
- **Description:** Renders email textarea with live email count and send button.

### AdminInvitationTable

- **Props:**
  - `invitations` (array): Array of invitation objects
  - `onRemove` (function): Callback when remove button clicked with invitation ID
  - `t` (function): Translation function
- **Description:** Renders table of invitations with email, status badge, and remove action.

### AdminGroupCard

- **Props:**
  - `group` (object): Group data with name and members
  - `allGroups` (array): All groups for move dropdown
  - `onMoveMember` (function): Callback for move member action
  - `onRemoveMember` (function): Callback for remove member action
  - `onEditName` (function): Callback to open edit name modal
  - `onDeleteGroup` (function): Callback to delete group
  - `t` (function): Translation function
- **Description:** Renders individual group card with:
  - Group name with edit button (always visible)
  - Member list with action dropdowns
  - Move member dropdown (shows other groups)
  - Remove member option
  - Delete group button

### AdminGroupsSection

- **Props:**
  - `groups` (array): Array of group objects
  - `canAssign` (boolean): Whether assign button should be enabled
  - `onAssign` (function): Callback when assign button clicked
  - `isAssigning` (boolean): Whether assignment is in progress
  - `t` (function): Translation function
- **Description:** Renders groups section header with assign button and group cards grid.

### EditGroupModal

- **Props:**
  - `isOpen` (boolean): Whether modal is visible
  - `onClose` (function): Callback to close modal
  - `group` (object): Group being edited
  - `onSave` (function): Callback with new name
  - `isSaving` (boolean): Whether save is in progress
- **Description:** Modal dialog for editing group name with text input and save/cancel buttons.

---

## State

- `isLoading` (boolean): Loading state for initial data fetch
- `isAdmin` (boolean): Whether current user is an org admin
- `pools` (array): Array of pool objects for the organization
- `currentPool` (object): Currently selected pool
- `invitations` (array): Array of invitation objects for current pool
- `groups` (array): Array of group objects for current pool
- `isSending` (boolean): Whether invitation send is in progress
- `isAssigning` (boolean): Whether group assignment is in progress
- `emailInput` (string): Raw email textarea value
- `parsedEmails` (array): Array of valid parsed emails

### Modal State

- `editGroupModal` (object|null): `{ group }` when edit modal open
- `moveModal` (object|null): `{ member, fromGroup, toGroup }` when move confirmation open
- `removeModal` (object|null): `{ member, group }` when remove confirmation open
- `deleteGroupModal` (object|null): `{ group }` when delete confirmation open

---

## API Calls

### Admin Status
- `GET /api/auth/admin-status` - Check if user is org admin
  - Response: `{ success, data: { isAdmin: boolean, organizations: [...] } }`

### Pool Management
- `GET /api/circles/pools` - Fetches pools for organization (auto-detects org)
  - Response: `{ success, data: { pools: [...] } }`

- `GET /api/circles/pools/:id` - Fetches pool details with stats
  - Response: `{ success, data: { pool: {...}, stats: {...} } }`

### Invitation Management
- `POST /api/circles/pools/:id/invitations` - Send invitations (batch)
  - Request: `{ invitees: [{ email: string }] }`
  - Response: `{ success, data: { sent: number, failed: number, duplicate: number, details: {...} } }`

- `GET /api/circles/pools/:id/invitations` - List all invitations
  - Response: `{ success, data: { invitations: [...], count: number } }`

- `DELETE /api/circles/invitations/:id` - Cancel/remove invitation
  - Response: `{ success, data: { message: string } }`

### Group Management
- `POST /api/circles/pools/:id/assign` - Assign members to groups
  - Response: `{ success, data: { groups: [...], totalMembers: number } }`

- `GET /api/circles/pools/:id/groups` - List groups for pool
  - Response: `{ success, data: { groups: [...], count: number } }`

- `PATCH /api/circles/pools/:id/groups/:id` - Update group name
  - Request: `{ name: string }`
  - Response: `{ success, data: { group: {...} } }`

- `DELETE /api/circles/pools/:id/groups/:id` - Delete group
  - Response: `{ success, data: { message: string } }`

- `POST /api/circles/pools/:id/groups` - Create new group
  - Request: `{ name: string }`
  - Response: `{ success, data: { group: {...} } }`

### Member Management
- `POST /api/circles/pools/:id/groups/:id/move-member` - Move member between groups
  - Request: `{ memberId: string, toGroupId: string }`
  - Response: `{ success, data: { message: string } }`
  - **Note:** Also transfers member's availability to new group

- `DELETE /api/circles/pools/:id/groups/:id/members/:id` - Remove member from group
  - Response: `{ success, data: { message: string } }`

- `POST /api/circles/pools/:id/groups/:id/members` - Add unassigned member to group
  - Request: `{ memberId: string }`
  - Response: `{ success, data: { group: {...} } }`
