# Learning

## Overview

The Learning page displays available learning modules for leadership development. Users can browse modules, see their progress, and continue where they left off.

## Components

- Hero section with page title
- Continue Learning section (in-progress modules)
- All Modules grid
- ModuleCard with thumbnail, title, description, duration, progress

## User Flow

1. User navigates to Learning page
2. If modules in progress, sees Continue Learning section
3. Browses all available modules in grid
4. Sees progress badges (New, X% complete)
5. Clicks module card to view/continue module
6. Completes lessons within module

---

# AI Section (AI Will Edit This Section Only)

## Q&A

Question: Answer (DD/MM/YY)

## Edge Cases

- No modules available: Shows empty state with message
- Module loading failure: Shows error state
- Mixed content types: Different icons for video/audio/article/exercise

## Components (AI)

- ModuleCard (internal component)
- Card (from @/components/ui)
- Button (from @/components/ui)
- Badge (from @/components/ui)
- LoadingOverlay (from @/components/ui)
- Hero image (from @/assets/images/hero-learning.jpg)
