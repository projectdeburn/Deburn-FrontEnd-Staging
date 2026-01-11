# Profile

## Overview

The Profile page allows users to manage their account settings, including personal information, profile picture, language preferences, and account actions like password change and logout.

## Components

- Header with back navigation
- Profile Picture section with upload/remove
- Personal Information form
- Language toggle (English/Swedish)
- Account section (Change Password, Sign Out)

## User Flow

1. User navigates to Profile from settings or menu
2. Views current profile picture
3. Can upload new avatar or remove existing
4. Edits personal information fields
5. Saves changes with feedback
6. Toggles language preference
7. Can change password or sign out

---

# AI Section (AI Will Edit This Section Only)

## Q&A

Question: Answer (DD/MM/YY)

## Edge Cases

- Avatar upload too large: Shows error (max 1MB)
- Invalid file type: Shows error (JPG/PNG only)
- Email change: Disabled, shows helper text
- Form validation: Client-side validation before submit

## Components (AI)

- Card (from @/components/ui)
- Button (from @/components/ui)
- Input (from @/components/ui)
- Textarea (from @/components/ui)
- Avatar (from @/components/ui)
- AuthContext (for user data and logout)
