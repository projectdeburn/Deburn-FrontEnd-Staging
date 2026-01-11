# Admin

## Functions

### loadAdminStats

- **Inputs:** None (async function)
- **Outputs:** (void) Updates stats state
- **Description:** Fetches admin statistics from API

---

## Components

### StatCard

- **Props:**
  - `icon` (Component): Lucide icon component
  - `label` (string): Stat label
  - `value` (number|string): Stat value
- **Description:** Renders a stat card with icon, value, and label

### HealthItem

- **Props:**
  - `label` (string): Service name
  - `status` (string): Status ('healthy', 'warning', 'error')
- **Description:** Renders system health status item with icon and label

---

## State

- `isLoading` (boolean): Loading state
- `stats` (object): Stats object `{ totalUsers, activeUsers, totalCheckins, totalSessions }`

---

## API Calls

- `GET /api/admin/stats` - Fetches admin statistics (requires admin role)
  - Response: `{ success, data: { totalUsers, activeUsers, totalCheckins, totalSessions } }`
