# Progress

## Overview

The Progress page shows users their wellbeing journey over time with statistics, trend charts, and AI-generated insights. Users can adjust the time period to see different trend ranges.

## Components

- Hero section with page title
- Stats grid (Streak, Check-ins, Lessons, Sessions)
- Wellbeing Trends section with period selector
- Mood trend chart with gradient fill
- Stress trend chart with gradient fill
- Key Insights list from AI analysis

## User Flow

1. User navigates to Progress page
2. Views summary statistics at top
3. Reviews wellbeing trend charts
4. Toggles time period (7, 30, or 90 days)
5. Charts update with new data
6. Scrolls to see AI-generated insights
7. Takes action based on insight recommendations

---

# AI Section (AI Will Edit This Section Only)

## Q&A

Question: Answer (DD/MM/YY)

## Edge Cases

- No check-in data: Shows flat trend lines
- No insights: Shows empty state with prompt to check in more
- Period with sparse data: Charts still render with available points
- API failure: Shows cached data if available

## Components (AI)

- StatCard (from @/components/ui)
- Card (from @/components/ui)
- LoadingOverlay (from @/components/ui)
- Hero image (from @/assets/images/hero-progress.jpg)
- SVG trend charts (inline)
