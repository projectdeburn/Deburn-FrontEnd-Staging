## API Description

Endpoints for organization administrators to manage circle pools, invitations, and groups. These endpoints require the user to be an organization admin.

---

## GET /api/auth/admin-status

Checks if the current user is an organization admin.

**Frontend Input** (src/features/circles/circlesAdminApi.js):
No request body.

**Response:**
```json
{
  "success": true,
  "data": {
    "isAdmin": true,
    "organizations": [
      {
        "id": "org_123",
        "name": "Acme Corp",
        "role": "admin"
      }
    ]
  }
}
```

**Error Response (not admin):**
```json
{
  "success": true,
  "data": {
    "isAdmin": false,
    "organizations": []
  }
}
```

---

## GET /api/circles/pools

Fetches pools for the user's organization. Auto-detects organization if user is admin of one org.

**Frontend Input** (src/features/circles/circlesAdminApi.js):
No request body. Optional query parameter `?status=inviting` to filter by status.

**Response:**
```json
{
  "success": true,
  "data": {
    "pools": [
      {
        "id": "pool_123",
        "name": "Default",
        "topic": "Leadership Development",
        "status": "inviting",
        "targetGroupSize": 4,
        "cadence": "biweekly",
        "stats": {
          "totalInvited": 15,
          "totalAccepted": 8,
          "totalDeclined": 2,
          "pending": 5
        },
        "createdAt": "2026-01-10T10:00:00Z"
      }
    ]
  }
}
```

---

## GET /api/circles/pools/:poolId

Fetches pool details.

**Frontend Input** (src/features/circles/circlesAdminApi.js):
```typescript
// Path parameter
poolId: string  // Pool ID
```
No request body.

**Response:**
```json
{
  "success": true,
  "data": {
    "pool": {
      "id": "pool_123",
      "name": "Default",
      "topic": "Leadership Development",
      "description": "Monthly leadership circles",
      "status": "inviting",
      "targetGroupSize": 4,
      "cadence": "biweekly",
      "organizationId": "org_123",
      "createdBy": "user_456",
      "createdAt": "2026-01-10T10:00:00Z",
      "updatedAt": "2026-01-15T10:00:00Z"
    }
  }
}
```

---

## POST /api/circles/pools/:poolId/invitations

Sends invitations to the specified emails.

**Frontend Input** (src/features/circles/circlesAdminApi.js):
```typescript
// Path parameter
poolId: string  // Pool ID

// Request body
{
  invitees: Array<{
    email: string,        // Email address (required)
    firstName?: string,   // Optional first name
    lastName?: string     // Optional last name
  }>
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "sent": [
      { "email": "john@example.com", "token": "abc123..." },
      { "email": "anna@example.com", "token": "def456..." }
    ],
    "failed": [
      { "email": "invalid-email", "reason": "Invalid email format" }
    ],
    "duplicate": [
      { "email": "existing@example.com" }
    ]
  }
}
```

---

## GET /api/circles/pools/:poolId/invitations

Lists all invitations for a pool (admin only).

**Frontend Input** (src/features/circles/circlesAdminApi.js):
```typescript
// Path parameter
poolId: string  // Pool ID
```
No request body.

**Response:**
```json
{
  "success": true,
  "data": {
    "invitations": [
      {
        "id": "inv_123",
        "email": "john@example.com",
        "firstName": "John",
        "lastName": "Doe",
        "status": "pending",
        "invitedBy": {
          "id": "user_456",
          "email": "admin@example.com",
          "firstName": "Admin",
          "lastName": "User"
        },
        "invitedAt": "2026-01-15T10:00:00Z",
        "acceptedAt": null,
        "declinedAt": null,
        "expiresAt": "2026-01-29T10:00:00Z"
      }
    ],
    "count": 15
  }
}
```

---

## DELETE /api/circles/invitations/:invitationId

Cancels/removes an invitation (admin only).

**Frontend Input** (src/features/circles/circlesAdminApi.js):
```typescript
// Path parameter
invitationId: string  // Invitation ID
```
No request body.

**Response:**
```json
{
  "success": true,
  "data": {
    "message": "Invitation cancelled successfully"
  }
}
```

---

## POST /api/circles/pools/:poolId/assign

Triggers group assignment for accepted members (admin only). Requires minimum number of accepted invitations.

**Frontend Input** (src/features/circles/circlesAdminApi.js):
```typescript
// Path parameter
poolId: string  // Pool ID
```
No request body.

**Response:**
```json
{
  "success": true,
  "message": "Successfully created 2 groups with 8 members",
  "data": {
    "groups": [
      {
        "id": "grp_123",
        "name": "Group 1",
        "members": [
          {
            "id": "user_1",
            "email": "john@example.com",
            "firstName": "John",
            "lastName": "Doe"
          }
        ],
        "memberCount": 4
      }
    ],
    "totalMembers": 8
  }
}
```

---

## GET /api/circles/pools/:poolId/groups

Lists groups for a pool (admin only).

**Frontend Input** (src/features/circles/circlesAdminApi.js):
```typescript
// Path parameter
poolId: string  // Pool ID
```
No request body.

**Response:**
```json
{
  "success": true,
  "data": {
    "groups": [
      {
        "id": "grp_123",
        "name": "Group 1",
        "members": [
          {
            "id": "user_1",
            "email": "john@example.com",
            "firstName": "John",
            "lastName": "Doe"
          }
        ],
        "memberCount": 4,
        "createdAt": "2026-01-18T10:00:00Z"
      }
    ],
    "count": 2
  }
}
```

---

## Error Responses

All endpoints may return error responses:

```json
{
  "success": false,
  "error": {
    "code": "ERROR_CODE",
    "message": "Human-readable error message"
  }
}
```

**Common Error Codes:**
| Code | HTTP Status | Description |
|------|-------------|-------------|
| `NOT_ADMIN` | 403 | User is not an organization admin |
| `ACCESS_DENIED` | 403 | User does not have access to this resource |
| `POOL_NOT_FOUND` | 404 | Pool does not exist |
| `INVITATION_NOT_FOUND` | 404 | Invitation does not exist |
| `NO_INVITEES` | 400 | No valid invitees provided |
| `INSUFFICIENT_MEMBERS` | 400 | Not enough accepted members for group assignment |
