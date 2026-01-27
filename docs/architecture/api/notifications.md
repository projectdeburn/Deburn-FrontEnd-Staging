## API Description

Endpoints for managing user notifications. The frontend uses a NotificationContext to manage notification state and display them in a dropdown from the header.

---

## GET /api/notifications

Fetches notifications for the current user with pagination.

**Frontend Usage:**
```javascript
// src/features/notifications/notificationApi.js
notificationApi.getNotifications(limit, offset)
```

**Response:**
```json
{
  "success": true,
  "data": {
    "notifications": [
      {
        "id": "notif_123",
        "type": "group_assignment",
        "title": "Assigned to Circle A",
        "message": "You have been assigned to Circle A in the Q1 Leadership pool.",
        "metadata": {
          "poolId": "pool_123",
          "groupId": "grp_123"
        },
        "read": false,
        "readAt": null,
        "createdAt": "2026-01-27T10:30:00Z"
      }
    ],
    "total": 15,
    "hasMore": true
  }
}
```

---

## GET /api/notifications/count

Gets the count of unread notifications for the current user.

**Frontend Usage:**
```javascript
// src/features/notifications/notificationApi.js
notificationApi.getUnreadCount()
```

**Response:**
```json
{
  "success": true,
  "data": {
    "unread": 3
  }
}
```

---

## POST /api/notifications/:notificationId/read

Marks a single notification as read.

**Frontend Usage:**
```javascript
// src/features/notifications/notificationApi.js
notificationApi.markAsRead(notificationId)
```

**Response:**
```json
{
  "success": true,
  "data": {
    "message": "Notification marked as read"
  }
}
```

---

## POST /api/notifications/read-all

Marks all notifications as read for the current user.

**Frontend Usage:**
```javascript
// src/features/notifications/notificationApi.js
notificationApi.markAllAsRead()
```

**Response:**
```json
{
  "success": true,
  "data": {
    "message": "All notifications marked as read",
    "count": 5
  }
}
```

---

## Notification Types

| Type | Description | Icon |
|------|-------------|------|
| `invitation` | User accepted a circle invitation | - |
| `group_assignment` | User was assigned to a group | - |
| `meeting_scheduled` | A meeting was scheduled | - |
| `meeting_reminder` | Reminder for upcoming meeting | - |
| `user_moved` | User was moved to a different group | - |

---

## Frontend Implementation

### Files

| File | Description |
|------|-------------|
| `src/features/notifications/notificationApi.js` | API client for notification endpoints |
| `src/context/NotificationContext.jsx` | React context for notification state management |
| `src/components/notifications/NotificationDropdown.jsx` | Bell icon with badge and dropdown list |
| `src/components/layout/Header.jsx` | Header component that includes NotificationDropdown |

### Context Usage

```jsx
// Wrap app with provider (in App.jsx)
import { NotificationProvider } from '@/context/NotificationContext';

<NotificationProvider>
  <App />
</NotificationProvider>

// Use in components
import { useNotifications } from '@/context/NotificationContext';

const { notifications, unreadCount, markAsRead, refresh } = useNotifications();
```

### NotificationDropdown Component

The dropdown displays:
- Bell icon with unread count badge
- List of recent notifications
- Unread indicator (blue dot)
- Click to mark as read
- Relative timestamps ("2 hours ago")

---

## Translations

| Namespace | Key | English | Swedish |
|-----------|-----|---------|---------|
| `common` | `notifications.title` | Notifications | Notiser |
| `common` | `notifications.empty` | No notifications | Inga notiser |
| `common` | `notifications.markAllRead` | Mark all as read | Markera alla som lästa |

---

## Implementation Status

| Endpoint | Status | Frontend File |
|----------|--------|---------------|
| `GET /api/notifications` | ✅ Complete | `src/features/notifications/notificationApi.js` |
| `GET /api/notifications/count` | ✅ Complete | `src/features/notifications/notificationApi.js` |
| `POST /api/notifications/:id/read` | ✅ Complete | `src/features/notifications/notificationApi.js` |
| `POST /api/notifications/read-all` | ✅ Complete | `src/features/notifications/notificationApi.js` |

---

## Added: 2026-01-27

Implemented as part of the Think Tanks notification system feature.
