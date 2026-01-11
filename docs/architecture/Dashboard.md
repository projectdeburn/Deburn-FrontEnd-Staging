# Dashboard

## Functions

### getGreeting

- **Inputs:**
  - None (uses `user` from AuthContext and current time)
- **Outputs:** (string) Localized greeting message with user's first name
- **Description:** Returns a time-based greeting (morning/afternoon/evening) with the user's first name

### getTodayDate

- **Inputs:** None
- **Outputs:** (string) Formatted date string (e.g., "Saturday, January 11")
- **Description:** Returns today's date formatted for display in the hero section

### getTrendIcon

- **Inputs:**
  - `change` (number): The percentage change value
  - `metric` (string): The metric type ('mood', 'energy', 'stress')
- **Outputs:** (JSX.Element) React component for trend icon
- **Description:** Returns appropriate trend icon (TrendingUp, TrendingDown, or Minus) based on change value. For stress, inverts the logic (down is positive)

### getTrendClass

- **Inputs:**
  - `change` (number): The percentage change value
  - `metric` (string): The metric type ('mood', 'energy', 'stress')
- **Outputs:** (string) Tailwind CSS class for text color
- **Description:** Returns color class based on whether the trend is positive or negative

### loadDashboardData

- **Inputs:** None (async function)
- **Outputs:** (void) Updates component state
- **Description:** Fetches dashboard data and trends from API in parallel, updates state with results

---

## State

- `isLoading` (boolean): Loading state for data fetch
- `dashboardData` (object|null): Contains todaysCheckin, streak, insightsCount, todaysFocus, nextCircle
- `trends` (object|null): Contains moodChange, energyChange, stressChange, moodValues, energyValues, stressValues

---

## API Calls

- `GET /api/dashboard` - Fetches dashboard overview data
- `GET /api/checkin/trends?period=7` - Fetches 7-day trend data
