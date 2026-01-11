# Progress

## Functions

### loadProgressData

- **Inputs:** None (async function, uses `period` from state)
- **Outputs:** (void) Updates stats, trends, insights state
- **Description:** Fetches progress stats, trends, and insights from API in parallel

### getTrendBadge

- **Inputs:**
  - `change` (number|undefined): Percentage change
  - `metric` (string): Metric type ('mood', 'energy', 'stress')
- **Outputs:** (JSX.Element) Badge with trend icon and percentage
- **Description:** Renders trend badge with appropriate icon and color based on change direction

### generateChartPath

- **Inputs:**
  - `values` (array): Array of numeric values
  - `height` (number): Chart height (default: 80)
- **Outputs:** (string) SVG path d attribute
- **Description:** Generates SVG polyline path from values for trend chart

### generateFillPath

- **Inputs:**
  - `values` (array): Array of numeric values
  - `height` (number): Chart height (default: 80)
- **Outputs:** (string) SVG path d attribute for fill area
- **Description:** Generates SVG path for gradient fill area under the chart line

---

## State

- `isLoading` (boolean): Loading state
- `period` (number): Selected time period in days (7, 30, or 90)
- `stats` (object): Stats object `{ streak, checkins, lessons, sessions }`
- `trends` (object|null): Trend data with values and changes
- `insights` (array): Array of insight objects `{ title, description }`

---

## API Calls

- `GET /api/progress/stats` - Fetches user statistics
- `GET /api/checkin/trends?period={period}` - Fetches trend data for specified period
- `GET /api/progress/insights` - Fetches AI-generated insights
