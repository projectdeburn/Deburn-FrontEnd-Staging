# Circles Admin

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

### updateAssignButtonVisibility

- **Inputs:** None
- **Outputs:** (void) Updates assign button visibility
- **Description:** Shows assign button only when there are enough accepted invitations (minimum 3-4 for group formation).

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
  - `t` (function): Translation function
- **Description:** Renders individual group card with member avatars and count.

### AdminGroupsSection

- **Props:**
  - `groups` (array): Array of group objects
  - `canAssign` (boolean): Whether assign button should be enabled
  - `onAssign` (function): Callback when assign button clicked
  - `isAssigning` (boolean): Whether assignment is in progress
  - `t` (function): Translation function
- **Description:** Renders groups section header with assign button and group cards grid.

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
- `POST /api/circles/pools/:id/invitations` - Send invitations
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
