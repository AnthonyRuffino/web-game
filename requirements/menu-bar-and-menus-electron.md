# Electron Menu Bar and Menu System Requirements

## 1. Menu Bar UI/UX
- Fixed bar at bottom of viewport, styled with dark theme, border, and shadow.
- Contains buttons for: Skins, Macro, Character, (future: Quests, Spells, Talents).
- Buttons highlight (active color) when their menu is open, revert when closed.
- Button click toggles menu visibility; only one instance of each menu can be open at a time.
- Menu bar manages z-index and overlays for proper stacking.

## 2. Menu Skeletons
### 2.1 Skins Menu
- Two tabs: Entities, Backgrounds.
- Each tab contains grid-style buttons populated with images from assetManager.imageCache.
- Grid buttons display image and name; clicking logs the action.
- Upload buttons present but only log (no upload logic yet).

### 2.2 Macro Menu
- Grid of macro slots (4x4), each cell can show an icon (from imageCache or placeholder) and name.
- Clicking a cell logs the action.
- Plus sign for empty slots.

### 2.3 Character Menu
- Placeholder: simple tabbed menu with character info, stats, and inventory tabs (all static, just log on button click).

## 3. Menu Manager, Overlay, and Blocking
- Menus are created and managed by menuManager.js.
- Each menu is a draggable, resizable modal with viewport-relative scaling.
- When a menu is open, an opaque black overlay blocks game input (clicking overlay does not close menu).
- Overlay is hidden when no menus are open.
- Menus have close buttons and respond to Escape key.
- onClose handlers update menu bar button state.

## 4. Tabs and Grid Buttons
- Tab system at top of menu, styled for active/inactive state.
- Tabs switch content area below.
- Grid buttons: responsive grid, each cell shows image (from imageCache), name, and supports tooltips.
- Grid cell click logs the action.

## 5. Image Integration
- All grid buttons in Skins and Macro menus use images from assetManager.imageCache if available.
- If image is missing, show a placeholder (gray box or plus sign).
- Images are scaled to fit cell size.

## 6. Event Handling
- Menu open/close updates menu bar button highlight.
- Escape key closes topmost menu.
- Menu overlay blocks all game input when visible.
- Menu drag/resize/focus follows existing menuManager patterns.
- All button callbacks log their action (no real logic yet).

## 7. Dynamic Configs and Extensibility
- Menus, tabs, and grid buttons are built from config objects.
- All layout, sizing, and content is viewport-relative and responsive.
- Easy to add new menus, tabs, or grid sections by updating config.
- Future: support for upload, config editing, and persistence.

## 8. Implementation Plan
1. Create a new menu bar component (menuBarElectron.js) styled after legacy menuBar.js.
2. Add buttons for Skins, Macro, Character; wire up to menuManager to open/close menus.
3. Implement overlay logic: show opaque black overlay when any menu is open, hide when all closed.
4. Build skeleton Skins menu: two tabs, each with grid of image buttons from assetManager.imageCache.
5. Build skeleton Macro menu: 4x4 grid, each cell shows icon/name or plus sign.
6. Build skeleton Character menu: tabs for Info, Stats, Inventory, each with static content.
7. Ensure all menus are draggable, resizable, and block input when open.
8. Implement button highlight logic in menu bar (active when menu open, inactive when closed, works with close button and Escape key).
9. All button and grid cell actions log to console.
10. Test viewport scaling, overlay, and menu stacking.

---

This requirements document synthesizes all menu, skin, macro, and overlay ideas from requirements and legacy code. The next step is to implement the menu bar and menu skeletons as described above. 