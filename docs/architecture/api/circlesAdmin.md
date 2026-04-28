## API Description

Endpoints for organization administrators to manage circle pools, invitations, and groups. These endpoints require the user to be an organization admin (checked via `organizationMembers` collection with `role: "admin"`).

---

## GET /api/auth/admin-status

Checks if the current user is an organization admin.

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

---

## POST /api/circles/pools

Creates a new circle pool (admin only).

**Request Body:**
```json
{
  "name": "Q1 Leadership Cohort",
  "organizationId": "org_123",
  "topic": "Leadership Development",
  "description": "Monthly leadership circles for Q1",
  "targetGroupSize": 4,
  "cadence": "biweekly"
}
```

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `name` | string | Yes | Pool name |
| `organizationId` | string | Yes | Organization ID |
| `topic` | string | No | Discussion topic/theme |
| `description` | string | No | Pool description |
| `targetGroupSize` | int | No | Target members per group (3-6, default: 4) |
| `cadence` | string | No | Meeting frequency: `weekly` or `biweekly` (default: biweekly) |

**Response:**
```json
{
  "success": true,
  "data": {
    "pool": {
      "id": "pool_123",
      "name": "Q1 Leadership Cohort",
      "topic": "Leadership Development",
      "status": "draft",
      "targetGroupSize": 4,
      "cadence": "biweekly",
      "organizationId": "org_123",
      "createdAt": "2026-01-18T10:00:00Z"
    }
  }
}
```

---

## GET /api/circles/pools

Fetches pools for the user's organization. Auto-detects organization if user is admin of one org.

**Query Parameters:**
- `status` (optional): Filter by pool status (`draft`, `inviting`, `active`, `completed`, `cancelled`)

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

**Request Body:**
```json
{
  "invitees": [
    {
      "email": "john@example.com",
      "firstName": "John",
      "lastName": "Doe"
    }
  ]
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "sent": [
      { "email": "john@example.com", "token": "abc123..." }
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

Deletes an invitation and updates pool stats (admin only). Works for invitations in any status (pending, accepted, declined).

**Response:**
```json
{
  "success": true,
  "data": {
    "message": "Invitation deleted successfully"
  }
}
```

**Side Effects:**
- Invitation record is deleted from `circleinvitations` collection
- Pool stats are decremented based on invitation status:
  - Pending: `totalInvited` decremented
  - Accepted: `totalInvited` and `totalAccepted` decremented
  - Declined: `totalInvited` and `totalDeclined` decremented

---

## POST /api/circles/pools/:poolId/assign

Triggers group assignment for accepted members (admin only).

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

## POST /api/circles/pools/:poolId/groups/:groupId/move-member

Moves a member from one group to another (admin only).

**Request Body:**
```json
{
  "memberId": "user_123",
  "toGroupId": "grp_456"
}
```

**Frontend Usage:**
```javascript
// src/features/circles/circles-adminApi.js
circlesAdminApi.moveMember(poolId, fromGroupId, memberId, toGroupId)
```

**Response:**
```json
{
  "success": true,
  "data": {
    "message": "Member moved successfully",
    "fromGroup": {
      "id": "grp_123",
      "name": "Circle A",
      "memberCount": 4
    },
    "toGroup": {
      "id": "grp_456",
      "name": "Circle B",
      "memberCount": 5
    },
    "movedMember": {
      "id": "user_123",
      "name": "John Doe"
    }
  }
}
```

---

## POST /api/circles/pools/:poolId/groups/:groupId/delete

Deletes a circle group (admin only).

**Frontend Usage:**
```javascript
// src/features/circles/circles-adminApi.js
circlesAdminApi.deleteGroup(poolId, groupId)
```

**Response:**
```json
{
  "success": true,
  "data": {
    "message": "Group deleted successfully",
    "deletedGroup": {
      "id": "grp_123",
      "name": "Circle A",
      "memberCount": 4
    }
  }
}
```

---

## POST /api/circles/pools/:poolId/groups/:groupId/add-member

Adds a latecomer to an existing group (admin only). Used for users who accepted an invitation after groups were already assigned.

**Request Body:**
```json
{
  "userId": "user_123"
}
```

**Frontend Usage:**
```javascript
// src/features/circles/circles-adminApi.js
circlesAdminApi.addMemberToGroup(poolId, groupId, userId)
```

**Response:**
```json
{
  "success": true,
  "data": {
    "message": "Member added successfully",
    "group": {
      "id": "grp_123",
      "name": "Circle A",
      "memberCount": 5
    },
    "addedMember": {
      "id": "user_123",
      "name": "John Doe"
    }
  }
}
```

**Errors:**
- `GROUP_FULL` (400): Group already has 6 members
- `ALREADY_MEMBER` (400): User is already in this group
- `USER_NOT_FOUND` (404): User does not exist

---

## POST /api/circles/pools/:poolId/groups/:groupId/remove-member

Removes a member from a group AND deletes their invitation (admin only). Effectively makes it as if they were never invited.

**Request Body:**
```json
{
  "userId": "user_123"
}
```

**Frontend Usage:**
```javascript
// src/features/circles/circles-adminApi.js
circlesAdminApi.removeMemberFromGroup(poolId, groupId, userId)
```

**Response:**
```json
{
  "success": true,
  "data": {
    "message": "Member removed successfully",
    "group": {
      "id": "grp_123",
      "name": "Circle A",
      "memberCount": 4
    },
    "removedMember": {
      "id": "user_123",
      "name": "John Doe"
    }
  }
}
```

**Side Effects:**
- Member is removed from the group's `members` array in `circlegroups` collection
- Member's invitation is deleted from `circleinvitations` collection

**Errors:**
- `NOT_GROUP_MEMBER` (400): User is not a member of this group

---

## POST /api/circles/pools/:poolId/groups

Creates a new empty group in a pool (admin only).

**Request Body:**
```json
{
  "name": "Circle D"
}
```

**Frontend Usage:**
```javascript
// src/features/circles/circles-adminApi.js
circlesAdminApi.createGroup(poolId, name)
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "grp_456",
    "name": "Circle D",
    "memberCount": 0
  }
}
```

---

## Error Responses

```json
{
  "success": false,
  "error": {
    "code": "ERROR_CODE",
    "message": "Human-readable error message"
  }
}
```

| Code | HTTP Status | Description |
|------|-------------|-------------|
| `NOT_ADMIN` | 403 | User is not an organization admin |
| `ACCESS_DENIED` | 403 | User does not have access to this resource |
| `POOL_NOT_FOUND` | 404 | Pool does not exist |
| `INVITATION_NOT_FOUND` | 404 | Invitation does not exist |
| `NO_INVITEES` | 400 | No valid invitees provided |
| `INSUFFICIENT_MEMBERS` | 400 | Not enough accepted members for group assignment |

---

---

## Implementation Status

All endpoints have been implemented and tested.

| Endpoint | Status | Frontend File |
|----------|--------|---------------|
| `GET /api/auth/admin-status` | ✅ Complete | `src/features/circles/circles-adminApi.js` |
| `POST /api/circles/pools` | ✅ Complete | `src/features/circles/circles-adminApi.js` |
| `GET /api/circles/pools` | ✅ Complete | `src/features/circles/circles-adminApi.js` |
| `GET /api/circles/pools/:id` | ✅ Complete | `src/features/circles/circles-adminApi.js` |
| `POST /api/circles/pools/:id/invitations` | ✅ Complete | `src/features/circles/circles-adminApi.js` |
| `GET /api/circles/pools/:id/invitations` | ✅ Complete | `src/features/circles/circles-adminApi.js` |
| `DELETE /api/circles/invitations/:id` | ✅ Complete | `src/features/circles/circles-adminApi.js` |
| `POST /api/circles/pools/:id/assign` | ✅ Complete | `src/features/circles/circles-adminApi.js` |
| `GET /api/circles/pools/:id/groups` | ✅ Complete | `src/features/circles/circles-adminApi.js` |
| `POST /api/circles/pools/:id/groups/:groupId/move-member` | ✅ Complete | `src/features/circles/circles-adminApi.js` |
| `POST /api/circles/pools/:id/groups/:groupId/delete` | ✅ Complete | `src/features/circles/circles-adminApi.js` |
| `POST /api/circles/pools/:id/groups` | ✅ Complete | `src/features/circles/circles-adminApi.js` |
| `POST /api/circles/pools/:id/groups/:groupId/add-member` | ✅ Complete | `src/features/circles/circles-adminApi.js` |
| `POST /api/circles/pools/:id/groups/:groupId/remove-member` | ✅ Complete | `src/features/circles/circles-adminApi.js` |

### Key Implementation Notes

1. **ObjectId Handling**: All endpoints convert user IDs to ObjectId before querying MongoDB to avoid type mismatch issues.

2. **Datetime Serialization**: Datetime fields are serialized with robust handling using `isoformat()` with fallback to string conversion.

3. **Delete Invitation**: Completely removes the invitation record and updates pool stats accordingly.

4. **Admin Authorization**: Each endpoint verifies the user is an organization admin via the `organizationmembers` collection.

### Frontend Files

| File | Description |
|------|-------------|
| `src/features/circles/circles-adminApi.js` | API client for all admin endpoints |
| `src/pages/CirclesAdmin.jsx` | Admin page component with pool, invitation, and group management |
| `src/components/ui/Modal.jsx` | Reusable modal component used for move/delete confirmations |

### API Methods

```javascript
// src/features/circles/circles-adminApi.js

circlesAdminApi.getAdminStatus()
circlesAdminApi.getPools(status?)
circlesAdminApi.getPool(poolId)
circlesAdminApi.sendInvitations(poolId, invitees)
circlesAdminApi.getPoolInvitations(poolId)
circlesAdminApi.cancelInvitation(invitationId)
circlesAdminApi.assignGroups(poolId)
circlesAdminApi.getPoolGroups(poolId)
circlesAdminApi.createGroup(poolId, name)
circlesAdminApi.moveMember(poolId, fromGroupId, memberId, toGroupId)
circlesAdminApi.deleteGroup(poolId, groupId)
circlesAdminApi.addMemberToGroup(poolId, groupId, userId)
circlesAdminApi.removeMemberFromGroup(poolId, groupId, userId)
```

### Translations

| Namespace | Key | Description |
|-----------|-----|-------------|
| `circlesAdmin` | `groups.moveTo` | "Move to..." dropdown label |
| `circlesAdmin` | `groups.moveTitle` | Move member modal title |
| `circlesAdmin` | `groups.moveConfirm` | Move confirmation message |
| `circlesAdmin` | `groups.deleteGroup` | Delete button tooltip |
| `circlesAdmin` | `groups.deleteTitle` | Delete modal title |
| `circlesAdmin` | `groups.deleteConfirm` | Delete confirmation message |
| `circlesAdmin` | `groups.deleteWarning` | Warning about members in group |

---

## Added: 2026-01-27

- Added move member functionality with dropdown per member and confirmation modal
- Added delete group functionality with trash icon and confirmation modal
- Uses reusable `Modal` component from `@/components/ui/Modal`
