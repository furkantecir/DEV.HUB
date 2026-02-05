
# 🛠️ Project Changelog

## [2026-02-03] - Global Settings Integration

### 1. Centralized Settings System (settings.js)
- **Global Settings Engine:** Created a unified Javascript engine (`settings.js`) that manages User Preferences across all pages.
- **Dynamic Theming:** 
    - Implemented CSS Custom Properties (`--color-primary`) to allow instant color switching without page reloads.
    - Connected Tailwind Config to use this dynamic variable.
    - Settings are persisted to `localStorage` (Key: `app_accent_color`).
- **Language Support (i18n):**
    - Built a lightweight internationalization system.
    - Supports dynamic text switching between English (US) and Turkish (TR).
    - Persists language preference (Key: `app_language`).

### 2. Settings Page Redesign (settings.html)
- **Visual Overhaul:** Recreated the Settings page to match the "Web Tool Hub" Sidebar design exactly as requested.
- **Interactive UI:**
    - Sidebar navigation is now visually consistent.
    - Color picker buttons now actively update the application theme instantly.
    - Dark/Light mode toggles are fully functional.
    - Language selector instantly translates interface elements.

### 3. Dashboard Integration (utilities.html)
- **Script Injection:** Added `settings.js` to the dashboard to enable global theme persistence.
- **Dynamic Colors:** Dashboard icons, buttons, and highlights now respect the globally selected Accent Color.

### 4. FocusTime Updates
- **Link Correction:** Restored correct navigation links between FocusTime, Global Settings, and Pixel Art Settings.
- **Tune Button:** Now correctly routes to the dedicated Pixel Art configuration modal.

## [2026-02-03] - Component Updates (Previous)
... (See previous logs for module library and focustime feature details)
