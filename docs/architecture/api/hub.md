## API Description

Organization hub endpoints for managing organization members and settings.

---

## GET /api/hub/organization

Fetches organization details.

**Frontend Input** (src/features/hub/hubApi.js):
Note: This endpoint is not implemented in the frontend API file.

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "org_123",
    "name": "Acme Corporation",
    "memberCount": 45,
    "activeUsers": 32,
    "completedLessons": 234,
    "avgEngagement": 78
  }
}
```

---

## GET /api/hub/members

Fetches organization members.

**Frontend Input** (src/features/hub/hubApi.js):
Note: This endpoint is not implemented in the frontend API file.

**Response:**
```json
{
  "success": true,
  "data": {
    "members": [
      {
        "id": "usr_123",
        "name": "John Doe",
        "email": "john@acme.com",
        "role": "admin"
      },
      {
        "id": "usr_456",
        "name": "Jane Smith",
        "email": "jane@acme.com",
        "role": "member"
      }
    ]
  }
}
```

---

## Member Roles

- `admin` - Can manage organization settings and members
- `member` - Regular organization member

---

## GET /api/hub/admins

Fetches hub admins.

**Frontend Input** (src/features/hub/hubApi.js):
No request body.

---

## POST /api/hub/admins

Adds a hub admin.

**Frontend Input** (src/features/hub/hubApi.js):
```json
{
  "email": "admin@example.com"
}
```

---

## DELETE /api/hub/admins/:email

Removes a hub admin.

**Frontend Input** (src/features/hub/hubApi.js):
No request body. Email is URL-encoded in path.

---

## GET /api/hub/org-admins

Fetches organization admins.

**Frontend Input** (src/features/hub/hubApi.js):
No request body.

---

## GET /api/hub/organizations

Fetches all organizations.

**Frontend Input** (src/features/hub/hubApi.js):
No request body.

---

## POST /api/hub/org-admins

Adds an organization admin.

**Frontend Input** (src/features/hub/hubApi.js):
```json
{
  "email": "admin@example.com",
  "organizationId": "org_123"
}
```

---

## DELETE /api/hub/org-admins/:membershipId

Removes an organization admin.

**Frontend Input** (src/features/hub/hubApi.js):
No request body.

---

## POST /api/hub/organizations

Creates a new organization.

**Frontend Input** (src/features/hub/hubApi.js):
```json
{
  "name": "Acme Corporation",
  "domain": "acme.com"
}
```

---

## GET /api/hub/settings/coach

Fetches AI coach settings.

**Frontend Input** (src/features/hub/hubApi.js):
No request body.

---

## PUT /api/hub/settings/coach

Updates AI coach settings.

**Frontend Input** (src/features/hub/hubApi.js):
```json
{
  "settings": { ... }
}
```
Note: Exact structure depends on coach configuration requirements.

---

## GET /api/hub/coach/prompts

Fetches coach prompts.

**Frontend Input** (src/features/hub/hubApi.js):
No request body.

---

## PUT /api/hub/coach/prompts/:language/:promptName

Updates a coach prompt.

**Frontend Input** (src/features/hub/hubApi.js):
```json
{
  "content": "Updated prompt content..."
}
```

---

## GET /api/hub/coach/exercises

Fetches coach exercises.

**Frontend Input** (src/features/hub/hubApi.js):
No request body.

---

## PUT /api/hub/coach/exercises

Updates coach exercises.

**Frontend Input** (src/features/hub/hubApi.js):
```json
{
  "exercises": [ ... ]
}
```

---

## GET /api/hub/coach/config

Fetches coach configuration.

**Frontend Input** (src/features/hub/hubApi.js):
No request body.

---

## GET /api/hub/content

Fetches content library items.

**Frontend Input** (src/features/hub/hubApi.js):
Query parameters:
- `contentType` (string, optional): Filter by content type
- `status` (string, optional): Filter by status
- `category` (string, optional): Filter by category

---

## GET /api/hub/content/:id

Fetches a single content item.

**Frontend Input** (src/features/hub/hubApi.js):
No request body.

---

## POST /api/hub/content

Creates new content.

**Frontend Input** (src/features/hub/hubApi.js):
```json
{
  "data": { ... }
}
```
Note: Exact structure depends on content type.

---

## PUT /api/hub/content/:id

Updates content.

**Frontend Input** (src/features/hub/hubApi.js):
```json
{
  "data": { ... }
}
```
Note: Exact structure depends on content type.

---

## DELETE /api/hub/content/:id

Deletes content.

**Frontend Input** (src/features/hub/hubApi.js):
No request body.

---

## POST /api/hub/content/:contentId/audio/:lang

Uploads audio for content.

**Frontend Input** (src/features/hub/hubApi.js):
FormData with:
- `audio` (File): Audio file

---

## DELETE /api/hub/content/:contentId/audio/:lang

Removes audio from content.

**Frontend Input** (src/features/hub/hubApi.js):
No request body.

---

## GET /api/hub/compliance/stats

Fetches compliance statistics.

**Frontend Input** (src/features/hub/hubApi.js):
No request body.

---

## GET /api/hub/compliance/user/:email

Fetches compliance info for a user.

**Frontend Input** (src/features/hub/hubApi.js):
No request body. Email is URL-encoded in path.

---

## POST /api/hub/compliance/export/:userId

Exports user data.

**Frontend Input** (src/features/hub/hubApi.js):
```json
{}
```

---

## POST /api/hub/compliance/delete/:userId

Deletes user account.

**Frontend Input** (src/features/hub/hubApi.js):
```json
{}
```

---

## GET /api/hub/compliance/pending-deletions

Fetches pending account deletions.

**Frontend Input** (src/features/hub/hubApi.js):
No request body.

---

## POST /api/hub/compliance/cleanup-sessions

Cleans up expired sessions.

**Frontend Input** (src/features/hub/hubApi.js):
```json
{}
```

---

## GET /api/hub/compliance/security-config

Fetches security configuration.

**Frontend Input** (src/features/hub/hubApi.js):
No request body.
