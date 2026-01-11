# Dashboard

## Overview

The Dashboard is the main landing page users see after logging in. It provides a personalized overview of their wellbeing journey, including daily check-in status, weekly trends, and quick access to key features.

## Components

- Hero section with personalized greeting and date
- Check-in action card with streak badge
- Today's Focus card with learning progress
- Week at a Glance trend charts (mood, energy, stress)
- Quick Access cards (Insights, Learning, Next Circle)

## User Flow

1. User lands on Dashboard after login
2. Sees personalized greeting based on time of day
3. Views check-in card status (completed or pending)
4. Reviews weekly wellbeing trends at a glance
5. Accesses other features via quick access cards

---

# AI Section (AI Will Edit This Section Only)

## Q&A

Question: Answer (DD/MM/YY)

## Edge Cases

- No check-in data: Shows default flat trend lines
- New user with no streak: Displays "0 day streak"
- API failure: Shows loading state, then falls back gracefully

## Components (AI)

- ActionCard (from @/components/ui)
- QuickCard (from @/components/ui)
- Card (from @/components/ui)
- Badge (from @/components/ui)
- LoadingOverlay (from @/components/ui)
- Hero image (from @/assets/images/hero-nordic-calm.jpg)
