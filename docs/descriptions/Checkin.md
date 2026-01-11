# Check-in

## Overview

The Check-in page guides users through a 4-step daily wellness assessment. Users rate their mood, energy levels, sleep quality, and stress to track their wellbeing over time.

## Components

- Step indicator with progress dots
- Mood selector with 5 emoji faces
- Energy sliders (physical and mental)
- Sleep quality selector with icons
- Stress level slider
- Completion screen with streak celebration
- Navigation buttons (Back/Continue)

## User Flow

1. User navigates to Check-in from Dashboard
2. Step 1: Selects mood from 5 options (Struggling to Great)
3. Step 2: Adjusts physical and mental energy sliders (1-10)
4. Step 3: Selects sleep quality (Poor to Great) and adjusts stress slider
5. Step 4: Submits and sees completion screen with streak and insight
6. Returns to Dashboard or retakes check-in

---

# AI Section (AI Will Edit This Section Only)

## Q&A

Question: Answer (DD/MM/YY)

## Edge Cases

- Incomplete step: Continue button disabled until required selection made
- API submission failure: Error toast, data preserved for retry
- Already checked in today: Can retake, overwrites previous data

## Components (AI)

- MoodFace (internal SVG component)
- SleepOption (internal component)
- Slider (internal component)
- Button (from @/components/ui)
- Card (from @/components/ui)
- Spinner (from @/components/ui)
