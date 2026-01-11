# Hub

## Functions

### loadHubData

- **Inputs:** None (async function)
- **Outputs:** (void) Updates organization and members state
- **Description:** Fetches organization and member data from hubApi in parallel

---

## Components

### StatsCard

- **Props:**
  - `icon` (Component): Lucide icon component
  - `value` (number|string): Stat value
  - `label` (string): Stat label
- **Description:** Renders organization stat card

### MemberRow

- **Props:**
  - `member` (object): Member data object
  - `t` (function): Translation function
- **Description:** Renders member row with avatar, name, email, role badge, and actions

---

## State

- `isLoading` (boolean): Loading state
- `activeTab` (string): Current tab ('overview', 'members', 'content', 'settings')
- `organization` (object|null): Organization data
- `members` (array): Array of member objects
- `searchQuery` (string): Member search filter

---

## Computed

- `filteredMembers`: Members filtered by searchQuery (name or email)

---

## API Calls

- `GET /api/hub/organization` - Fetches organization details (via hubApi.getOrganization)
- `GET /api/hub/members` - Fetches organization members (via hubApi.getMembers)
