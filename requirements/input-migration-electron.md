# Input Handling Migration for Electron Version

## Overview
Migrate advanced input handling features from the browser (core/ui/input.js) to the Electron version of the game. This ensures feature parity and a consistent user experience across both versions.

## Requirements

1. **Grid Cell Hover and Click Tracking**
   - Track the currently hovered grid cell under the mouse cursor and expose it for rendering (e.g., highlight the cell).
   - On canvas click, log the canvas, world, and cell coordinates, and log any entities present at the clicked cell.
   - Correctly handle camera transforms, zoom, and player/camera rotation for accurate world/cell mapping.

2. **Input State Reset on Window Blur/Focus**
   - When the Electron window loses or regains focus, reset the input state to prevent stuck keys or actions (e.g., when opening dev tools).

3. **Input Blocking for Text Fields**
   - Block player movement and keybindings when the user is focused in a text input, number input, or textarea.
   - Unblock input when focus leaves these elements.

## Implementation Notes
- Integrate these features into the Electron input system, ensuring compatibility with the existing InputManager and game loop.
- Expose hovered cell state for use in rendering overlays or debug info.
- Ensure all event listeners are properly cleaned up if needed. 