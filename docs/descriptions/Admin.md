# Admin

## Overview

The Admin page provides platform administrators with statistics, quick actions for management tasks, and system health monitoring. Only accessible to users with admin role.

## Components

- Header with admin badge
- Platform Statistics grid
- Quick Actions cards (Manage Users, Settings, Content, Sync)
- System Health status list

## User Flow

1. Admin user navigates to Admin page
2. Non-admins are redirected to Dashboard
3. Views platform-wide statistics
4. Clicks quick action cards for management tasks
5. Reviews system health status
6. Takes administrative actions as needed

---

# AI Section (AI Will Edit This Section Only)

## Q&A

Question: Answer (DD/MM/YY)

## Edge Cases

- Non-admin access: Redirects to Dashboard
- API failure: Shows cached stats if available
- System health warning: Shows amber indicator
- System health error: Shows red indicator with alert

## Components (AI)

- StatCard (internal component)
- HealthItem (internal component)
- Card (from @/components/ui)
- Button (from @/components/ui)
- LoadingOverlay (from @/components/ui)
