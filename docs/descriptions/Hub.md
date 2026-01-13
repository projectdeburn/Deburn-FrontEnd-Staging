# Hub

## Overview

The Hub is the **Global Administration** panel for the Deburn platform. It is accessible only to authorized Hub Admins and provides comprehensive management capabilities for the entire platform including organizations, AI coaching configuration, content library, and GDPR compliance.

**Route:** `/hub`
**Access:** Hub Admins only (role-based access control)

## Design Philosophy

The Hub follows Deburn's **Scandinavian Minimalism** design:
- Clean, minimal interface with warm neutral colors
- Card-based layout with subtle 1px borders (no drop shadows)
- Maximum width of 1200px, centered
- Font: Inter (400, 500, 600 weights)
- Primary color: #2D4A47 (Deep Forest)
- Background: #F8F7F4 (Warm White)

## Layout Structure

### Header
- **Title:** "Hub" (28px, 600 weight)
- **Subtitle:** "Global Administration" (14px, secondary color)
- **User info:** "Signed in as [email]" (right-aligned)
- Horizontal divider below header

### Tab Navigation
Five primary tabs:
1. **Hub Admins** (default)
2. **Organizations**
3. **Ask Eve**
4. **Content Library**
5. **Compliance**

Active tab has colored border-bottom with primary color.

---

## Tab 1: Hub Admins

**Purpose:** Manage users with global Hub admin access.

### Components
- **Card: Hub Administrators**
  - Subtitle: "Users with access to this global admin section"
  - Form to add new admin (email input + "Add Admin" button)
  - Table with columns: EMAIL | ADDED BY | ADDED | ACTIONS
  - Remove button (red) for each admin except current user
  - Current user shows "Current user" label instead of remove button

### Functionality
- Add hub admin by email
- Remove hub admin (with confirmation)
- Cannot remove yourself

---

## Tab 2: Organizations

**Purpose:** Create and manage organizations and their administrators.

### Components

#### Card 1: Create Organization
- Subtitle: "Add a new organization to the platform"
- Form fields:
  - Organization Name (required)
  - Domain (optional)
- "Create Organization" button
- **Existing Organizations** grid below showing:
  - Organization name (bold)
  - Domain (link style)
  - Member count

#### Card 2: Organization Administrators
- Subtitle: "Users who can manage organizations and circles"
- Form to add org admin:
  - Email input
  - Organization dropdown (select from existing orgs)
  - "Add Admin" button
- Table with columns: USER | ORGANIZATIONS
- Organizations shown as removable badges (click X to remove)

---

## Tab 3: Ask Eve

**Purpose:** Configure the AI leadership coach (Eve).

### Components

#### Card 1: Conversation Limits
- Subtitle: "Daily message limits for Ask Eve"
- Number input: "Daily exchanges per user" (min: 1, max: 100, default: 15)
- Save button
- Helper text: "Users will see a message when they reach their daily limit..."

#### Card 2: Coach Configuration
- Subtitle: "Current AI model and topic detection settings"
- Display grid:
  - AI MODEL (e.g., claude-sonnet-4-5-20250929)
  - MAX TOKENS (e.g., 1024)
  - TEMPERATURE (e.g., 0.7)
- **Coaching Methodology:**
  - Primary: EMCC
  - Ethical Standards: ICF
  - Scientific Frameworks (badges): SDT, JD-R, CBC, ACT, Positive Psychology, EQ, Systems Thinking
- **Supported Topics** (12 badges): delegation, stress, team_dynamics, communication, leadership, time_management, conflict, burnout, motivation, decision_making, mindfulness, resilience
- **Crisis Keywords** (Level 3 - Stop Coaching): Red text, expandable
- **Soft Escalation Keywords** (Level 1 - Caution): Orange/warning text, expandable
- **Hard Boundaries** (Never Provide): List of forbidden advice types

#### Card 3: System Prompts
- Subtitle: "Coach personality and behavior prompts by language"
- Organized by language (EN, SV)
- Each prompt shows:
  - Prompt name (e.g., base-coach, safety-rules, tone-guidelines)
  - Edit button
  - Preview text (truncated to ~200 chars)
- Edit opens modal with full textarea editor

#### Card 4: Content Recommendations
- Subtitle: "Content the coach recommends based on conversation topics"
- Instructions for linking content to coach
- Display of available topics (same 12 as above)

---

## Tab 4: Content Library

**Purpose:** Manage all microlearning content items.

### Components

#### Header Section
- Title: "Content Library"
- Subtitle: "Microlearning courses and resources"
- "+ Add Content" button (opens create modal)

#### Filters Row
Three dropdowns:
- **Category:** All Categories, Featured, Leadership, Breath Techniques, Meditation, Burnout, Wellbeing, Other
- **Content Type:** All Types, Text Article, Audio Article, Audio Exercise, Video Link
- **Status:** All Statuses, Draft, In Review, Published, Archived

#### Content List
Grouped by category with count (e.g., "Leadership (31)")

Each content card displays:
- **Type badge** (uppercase, small): TEXT, AUDIO, EXERCISE, VIDEO
- **Status** (colored): Published (green), Draft (gray), etc.
- **Title** (bold)
- **Description/Purpose** (truncated)
- **Coach Topics** (badges, max 4 shown + "+N more")
- **Duration** (e.g., "12 min")
- **Actions:** Edit | Delete buttons

### Create/Edit Content Modal
Large modal (900px) with sections:
- Content type, category, status dropdowns
- Title fields (English & Swedish)
- Length (minutes), related framework
- Purpose and outcome textareas
- Coach topics checkboxes (grid)
- Coach priority slider (0-10)
- Enable for recommendations checkbox
- Type-specific fields:
  - Text: Content textareas (EN/SV)
  - Audio: File upload, voiceover script, TTS settings
  - Video: URL, embed code, language availability

---

## Tab 5: Compliance

**Purpose:** GDPR compliance management and security controls.

### Components

#### Card 1: Compliance Dashboard
- Subtitle: "GDPR compliance status and statistics"
- "Refresh Stats" button
- Stats grid (4 boxes):
  - TOTAL USERS
  - PENDING DELETIONS
  - AUDIT LOG ENTRIES
  - ACTIVE SESSIONS

#### Card 2: User Data Management
- Subtitle: "Search, export, and delete user data (GDPR Articles 17 & 20)"
- Search form: "Find User by Email" input + Search button
- User details section (shown after search):
  - User info grid: Email, Organization, Status, Created, Last login, Sessions, Check-ins, Consents
  - Deletion status alert (if applicable)
  - Action buttons: "Export User Data" | "Delete Account"

#### Card 3: Pending Account Deletions
- Subtitle: "Users who have requested account deletion (30-day grace period)"
- "Refresh" button
- Table: EMAIL | REQUESTED | SCHEDULED FOR | ACTIONS
- "Execute Now" button for immediate deletion

#### Card 4: Security Controls
- Subtitle: "Manual security maintenance actions"
- Buttons: "Cleanup Expired Sessions" | "View Security Config"
- Collapsible security config display (JSON)

---

## API Endpoints

All endpoints prefixed with `/api/hub/`

### Hub Admins
- `GET /admins` - List hub admins
- `POST /admins` - Add hub admin
- `DELETE /admins/:email` - Remove hub admin

### Organizations
- `GET /organizations` - List organizations
- `POST /organizations` - Create organization
- `GET /org-admins` - List org admins
- `POST /org-admins` - Add org admin
- `DELETE /org-admins/:email/:orgId` - Remove org admin from org

### Ask Eve
- `GET /coach/config` - Get coach configuration
- `GET /coach/limits` - Get conversation limits
- `PUT /coach/limits` - Update conversation limits
- `GET /coach/prompts` - Get system prompts
- `PUT /coach/prompts/:id` - Update system prompt

### Content Library
- `GET /content` - List content (with filters)
- `POST /content` - Create content
- `PUT /content/:id` - Update content
- `DELETE /content/:id` - Delete content
- `POST /content/:id/audio` - Upload audio file

### Compliance
- `GET /compliance/stats` - Get compliance statistics
- `GET /compliance/user/:email` - Get user data
- `POST /compliance/user/:email/export` - Export user data
- `DELETE /compliance/user/:email` - Delete user account
- `GET /compliance/deletions` - Get pending deletions
- `POST /compliance/deletions/:id/execute` - Execute deletion
- `POST /compliance/sessions/cleanup` - Cleanup expired sessions
- `GET /compliance/security-config` - Get security config

---

## User Flow

1. Hub Admin navigates to `/hub`
2. System verifies hub admin role (403 if unauthorized)
3. Default view shows Hub Admins tab
4. Admin switches tabs to access different features
5. All changes are persisted via API calls
6. Success/error messages displayed after operations

---

## States

### Loading State
- Centered spinner with "Checking access..." text

### Unauthorized State
- Access denied message
- "Return to Dashboard" button

### Empty States
- Hub Admins: "No administrators" (shouldn't happen)
- Organizations: "No organizations yet"
- Content Library: "No content items" with create prompt
- Pending Deletions: "No pending deletions"

---

# AI Section (AI Will Edit This Section Only)

## Q&A

Question: Answer (DD/MM/YY)

## Edge Cases

- Unauthorized access: Shows 403 state with return button
- Cannot remove yourself as hub admin
- Organization domain is optional
- Content must have at least English title
- Deletion grace period is 30 days
- Session cleanup removes expired tokens only

## Components (AI)

### File Structure
```
src/
  components/
    hub/
      HubAdminsTab.jsx       # Tab 1: Hub admin management
      OrganizationsTab.jsx   # Tab 2: Org & org admin management
      AskEveTab.jsx          # Tab 3: AI coach configuration
      ContentLibraryTab.jsx  # Tab 4: Content management
      ComplianceTab.jsx      # Tab 5: GDPR compliance
      ContentModal.jsx       # Create/edit content modal
      PromptEditModal.jsx    # Edit system prompt modal
  features/
    hub/
      hubApi.js              # API layer for all Hub endpoints
  pages/
    Hub.jsx                  # Main page, orchestrates tabs
  hub.css                    # Hub-specific styles (existing, don't modify)
```

### Component Responsibilities (SOLID - Single Responsibility)
- **Hub.jsx**: Main page layout, tab navigation, auth check
- **HubAdminsTab.jsx**: Add/remove hub admins, admin table
- **OrganizationsTab.jsx**: Create orgs, manage org admins
- **AskEveTab.jsx**: Conversation limits, coach config display, system prompts
- **ContentLibraryTab.jsx**: Content filtering, listing, CRUD operations
- **ComplianceTab.jsx**: Stats dashboard, user search, deletions, security
- **ContentModal.jsx**: Full content create/edit form with type-specific fields
- **PromptEditModal.jsx**: Textarea editor for system prompts
- **hubApi.js**: All API calls, centralized error handling

### Shared UI (from existing components)
- Card containers with 1px borders
- Form inputs with consistent styling
- Primary buttons (deep forest)
- Secondary buttons (outline)
- Danger buttons (clay red)
- Badge components for topics/status
- Table components for data display
- Modal system for editing

### i18n
Full translation support using `useTranslation(['hub', 'common'])` with keys like:
- `hub:tabs.hubAdmins`, `hub:tabs.organizations`, etc.
- `hub:admins.title`, `hub:admins.addAdmin`, etc.
- `hub:content.addContent`, `hub:content.filters.category`, etc.
