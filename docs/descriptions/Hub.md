# Hub

## Overview

The Hub page is the organization management center where admins can view organization statistics, manage members, configure content, and adjust settings.

## Components

- Header with organization name and settings button
- Tab navigation (Overview, Members, Content, Settings)
- Overview: Stats cards and quick actions
- Members: Searchable member list with roles
- Content: Content management placeholder
- Settings: Organization settings form

## User Flow

1. User navigates to Hub page
2. Sees organization overview with stats
3. Switches tabs to access different features
4. Members tab: Searches/filters members, invites new
5. Content tab: Configures learning content
6. Settings tab: Updates organization settings

---

# AI Section (AI Will Edit This Section Only)

## Q&A

Question: Answer (DD/MM/YY)

## Edge Cases

- No organization: Should redirect or show setup
- Empty member list: Shows empty state
- Search no results: Shows no results message
- Role badges: Different colors for admin vs member

## Components (AI)

- StatsCard (internal component)
- MemberRow (internal component)
- Card (from @/components/ui)
- Button (from @/components/ui)
- Input (from @/components/ui)
- Badge (from @/components/ui)
- LoadingOverlay (from @/components/ui)
- hubApi (from @/features/hub/hubApi)
