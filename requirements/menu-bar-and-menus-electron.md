# Progress Update (2024-06-09, Overlay/Menu Stack Refactor)

## Overlay/Menu Stack Requirements
- Overlay logic is managed exclusively by `@menuManager.js`.
- Overlays are only created for menus with `isBlocking: true`.
- When a blocking menu is opened, an overlay is created and inserted just below the menu in the z-index stack.
- The overlay always has a z-index one less than its parent menu, so it never covers the menu.
- When a blocking menu is closed, both the menu and its overlay are removed from the stack.
- Non-blocking menus do not get overlays and are simply added to the stack.
- Z-indexes for overlays and menus are managed dynamically based on the stack order, so overlays/menus are always above any non-modal UI/canvas.
- Only `@menuManager.js` manages overlays and z-indexes; `@menuBarElectron.js` only manages the bar/buttons.

## Implementation Plan
1. Implement a stack-based overlay/menu system in `@menuManager.js`.
2. When a blocking menu is opened, push an overlay and the menu onto the stack, assigning z-indexes accordingly.
3. When a blocking menu is closed, pop both the menu and its overlay from the stack.
4. Ensure overlays are always just below their parent menu.
5. Non-blocking menus are simply added to the stack without overlays.
6. Test with multiple menus (blocking and non-blocking) to ensure correct overlay/menu stacking and z-index behavior.

---

# Progress Update (2024-06-09, Commit: Overlay & Skeleton Menus Integration)

## What Was Achieved
- **Overlay Logic Refactored**: The opaque black overlay is now managed by the menu/modal system (`menuManager.js`), not the menu bar. It appears when any menu is open and blocks all UI/canvas below, and is hidden when all menus are closed.
- **Menu Bar Button Logic**: The menu bar now only manages button UI and highlight state. It uses `menuManager.showMenu`/`hideMenu` to open/close menus, and highlights buttons based on menu state.
- **Menu Skeletons Implemented**: When a menu is opened, `menuManager` creates a skeleton menu (Skins, Macro, Character) with placeholder content, tabs, and grid buttons. All actions log to the console.
- **onClose Handlers**: Menus have onClose handlers that update the overlay and button highlight state, whether closed by button or Escape key.
- **Single Overlay Instance**: Only one overlay is created and managed, regardless of how many menus are open.
- **All UI is Viewport-Relative**: Menus and overlay use viewport-relative sizing and positioning.

## What Remains
- Refine menu skeleton UI and placeholder content for better visual feedback.
- Add more realistic placeholder images/icons for grid buttons if desired.
- Prepare for future implementation of real menu logic (upload, config editing, etc).

## Testing
- Clicking a menu bar button opens the correct menu, shows the overlay, and blocks input.
- Closing a menu (via close button or Escape) hides the overlay if no menus are open and updates the button highlight.
- Menu skeletons display placeholder content, tabs, and grid buttons as described.

---

# Progress Update (2024-06-09)

## Current Status
- **Menu Bar UI**: Complete. The menu bar is styled, fixed at the bottom, and buttons highlight when toggled.
- **Button Logic**: Buttons toggle their active state and log actions.
- **Overlay (Prototype)**: An opaque black overlay appears when a menu is toggled, but is currently implemented in menuBarElectron.js (not correct per requirements).

## Outstanding Tasks
- **Menu Skeletons**: Skins, Macro, and Character menus are not yet implemented. Clicking a button does not open a menu.
- **Overlay Integration**: The blocking overlay should be part of the menu/modal system (menuManager/menus), not the menu bar. It must block all UI and the canvas below when any menu is open.
- **Menu Open/Close**: Actual menus should open/close via menuManager, and overlay should only appear when a menu is open.
- **onClose Handlers**: Closing a menu (via close button or Escape) should update the menu bar button state and hide the overlay if no menus are open.

## Next Steps
1. Move overlay logic from menuBarElectron.js into the menu/modal system (menuManager/menus).
2. Implement skeleton menus for Skins, Macro, and Character, using menuManager for creation and management.
3. Ensure overlay blocks all UI/canvas below when any menu is open, and is hidden when all menus are closed.
4. Wire up menu bar buttons to open/close menus via menuManager, and update highlight state accordingly.
5. Implement onClose handlers for menus to update menu bar state and overlay.
6. All menu content is placeholder/skeleton for now; all actions log to console.

---

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