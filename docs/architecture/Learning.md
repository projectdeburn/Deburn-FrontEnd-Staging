# Learning

> **Rebranding Note (January 2026):** "Learnings" has been rebranded to **"Micro-Courses"** in the user-facing application. The codebase retains the original "learning" terminology for backward compatibility.

## Functions

### loadLearningContent

- **Inputs:** None (async function)
- **Outputs:** (void) Updates modules state
- **Description:** Fetches learning modules from API, updates state with module list

### formatDuration

- **Inputs:**
  - `minutes` (number): Duration in minutes
- **Outputs:** (string) Formatted duration string
- **Description:** Formats minutes into readable string (e.g., "45 min", "1h 30m")

---

## Components

### ModuleCard

- **Props:**
  - `module` (object): Module data object
  - `formatDuration` (function): Duration formatter function
  - `t` (function): Translation function
- **Description:** Renders a learning module card with thumbnail/icon, title, description, duration, progress badge, and progress bar

---

## State

- `isLoading` (boolean): Loading state for data fetch
- `modules` (array): Array of module objects
- `activeModule` (object|null): Currently selected module (for future detail view)

---

## API Calls

- `GET /api/learning/modules` - Fetches list of learning modules
  - Response: `{ success, data: { modules: [...] } }`
