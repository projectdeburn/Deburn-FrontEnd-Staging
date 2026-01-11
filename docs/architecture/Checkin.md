# Checkin

## Functions

### isStepValid

- **Inputs:** None (uses `currentStep`, `mood`, `sleep` from state)
- **Outputs:** (boolean) Whether current step has valid data
- **Description:** Validates each step - Step 1 requires mood selection, Step 2 always valid (sliders have defaults), Step 3 requires sleep selection, Step 4 always valid

### handleNext

- **Inputs:** None (async function)
- **Outputs:** (void) Updates state or navigates
- **Description:** Advances to next step, submits check-in on step 3, navigates to dashboard on step 4

### handleBack

- **Inputs:** None
- **Outputs:** (void) Updates currentStep state
- **Description:** Goes back to previous step if currentStep > 1

### submitCheckin

- **Inputs:** None (async function, uses state values)
- **Outputs:** (void) Updates completionData and currentStep state
- **Description:** Submits check-in data to API, moves to completion step on success

---

## Components

### MoodFace

- **Props:**
  - `level` (number): Mood level 1-5
  - `selected` (boolean): Whether this option is selected
  - `onClick` (function): Click handler
- **Description:** Renders SVG face for mood selection with appropriate expression

### SleepOption

- **Props:**
  - `value` (number): Sleep quality value 1-5
  - `icon` (Component): Lucide icon component
  - `label` (string): Display label
  - `selected` (boolean): Whether this option is selected
  - `onClick` (function): Click handler
- **Description:** Renders sleep quality option button

### Slider

- **Props:**
  - `icon` (Component): Lucide icon component
  - `label` (string): Slider label
  - `value` (number): Current value
  - `onChange` (function): Value change handler
  - `min` (number): Minimum value (default: 1)
  - `max` (number): Maximum value (default: 10)
  - `lowLabel` (string): Label for low end
  - `highLabel` (string): Label for high end
- **Description:** Renders labeled range slider with min/max labels

---

## State

- `currentStep` (number): Current wizard step (1-4)
- `isSubmitting` (boolean): Form submission state
- `completionData` (object|null): Response data after submission (streak, insight, tip)
- `mood` (number|null): Selected mood (1-5)
- `physicalEnergy` (number): Physical energy slider value (1-10)
- `mentalEnergy` (number): Mental energy slider value (1-10)
- `sleep` (number|null): Selected sleep quality (1-5)
- `stress` (number): Stress slider value (1-10)

---

## API Calls

- `POST /api/checkin` - Submits check-in data
  - Body: `{ mood, physicalEnergy, mentalEnergy, sleep, stress }`
