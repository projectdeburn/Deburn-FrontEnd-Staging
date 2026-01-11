# Circles

## Overview

The Circles page enables peer support through groups and scheduled meetings. Users can view their groups, manage invitations, and see upcoming circle meetings.

## Components

- Hero section with page title
- Pending Invitations section
- Upcoming Meetings list
- My Groups grid with GroupCard
- Create Group button
- Empty state for no groups

## User Flow

1. User navigates to Circles page
2. Reviews any pending group invitations
3. Accepts or declines invitations
4. Views upcoming scheduled meetings
5. Browses their circle groups
6. Clicks group to view details/members
7. Can create new circle group

---

# AI Section (AI Will Edit This Section Only)

## Q&A

Question: Answer (DD/MM/YY)

## Edge Cases

- No groups: Shows empty state with create prompt
- No invitations: Section hidden
- No upcoming meetings: Section hidden
- Group without members: Shows just group info

## Components (AI)

- GroupCard (internal component)
- Card (from @/components/ui)
- Button (from @/components/ui)
- Badge (from @/components/ui)
- Avatar (from @/components/ui)
- LoadingOverlay (from @/components/ui)
- Hero image (from @/assets/images/hero-circles.jpg)
