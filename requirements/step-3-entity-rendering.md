# Step 3: Entity Rendering, Sprites, and Hitboxes

## Overview

This step introduces a flexible, per-entity rendering system for the game world. Each entity (player, tree, rock, grass, etc.) can be rendered as a shape or a sprite (PNG), with configurable hitboxes and support for pre-rendering shapes for performance. The player character will support custom PNG uploads, and the groundwork will be laid for dynamic equipment visuals in the future.

---

## Progress Checklist (as of current implementation)

- [x] Per-entity render mode (no global RENDER_MODE)
- [x] Pre-rendering/caching for shapes and sprites
- [x] Skins UI for managing cached images, uploading, deleting, exporting/importing, and setting per-entity render mode preferences
- [x] Dynamic switching of render mode and skin at runtime
- [x] Cache key hashing for compact storage
- [x] Async initialization and preloading of all entity images/canvases (in-memory + localStorage)
- [x] Metadata support in cache (size, angle, offsets, etc.)
- [x] Tab-based UI for Skins (preferences, sprite skins, shape skins)
- [~] Hitbox/collision decoupling (partial: some entities have collision, but not a full hitbox system)
- [ ] Player PNG upload (not started)
- [ ] Clickable areas for grass (not started)
- [ ] Fixed-angle (screen-relative) rendering for entities (planned)
- [ ] Skin image auto-resize and metadata (planned)

---

## New/Extended Requirements (not in original doc)

### Skin Image Auto-Resize and Metadata
- [ ] When a user uploads a new skin in the Skins UI, the image should be automatically resized to match the intended size for the entity (e.g., tile size for grass, tree, etc.).
- [x] The cache format must store not just the image, but also metadata: `size`, and any other relevant config.
- [x] When drawing, always use the cached `size` for that skin, so custom images and procedural art are always aligned.
- [~] The Skins UI should show a preview at the correct size and allow the user to adjust before saving.
- [~] When exporting/importing skins, include all metadata.

### Fixed-Angle (Screen-Relative) Rendering for Entities
- [~] Add a property like `fixedScreenAngle` (null or a number in degrees/radians) to entities and to the skin cache.
- [~] If `fixedScreenAngle` is set, always render the entity at that angle relative to the screen, ignoring world/camera rotation.
- [x] Add `drawOffsetX` and `drawOffsetY` properties to allow fine-tuning of the rendered image's position.
- [~] The Skins UI should allow editing these properties for each cache entry.
- [x] The cache (in localStorage and in-memory) should store all relevant metadata: size, fixed angle, offsets, etc.
- [x] `getCachedImage` and `getCachedCanvas` should return an object with `{ image, size, fixedScreenAngle, drawOffsetX, drawOffsetY, ... }`.
- [x] The draw method should use these properties for correct rendering and alignment.

---

## Summary Table

| Feature/Requirement                | Status      | Notes/Next Steps |
|------------------------------------|-------------|------------------|
| Per-entity render mode             | Complete    |                  |
| Pre-rendering/caching              | Complete    |                  |
| Skins UI                           | Complete    | Needs metadata/resize/angle support |
| Hitbox decoupling                  | Partial     | Needs full hitbox/interaction system |
| Player PNG upload                  | Not started |                  |
| Clickable areas for grass          | Not started |                  |
| Fixed-angle rendering              | Partial     | Add metadata, draw logic, UI support |
| Skin image auto-resize             | Partial     | Add metadata, resize on upload, UI preview |

---

## Implementation Order (Updated)
1. **Step 1** (Entity Rendering Refactor) - Foundation for all other changes
2. **Step 3** (Hitbox System) - Required for proper collision detection
3. **Step 2** (Pre-rendering System) - Performance optimization
4. **Step 4** (Player PNG Upload) - User-facing feature
5. **Step 5** (Clickable Areas) - Interaction system
6. **Step 6** (Documentation and Testing) - Final polish
7. **New**: Skin image auto-resize and metadata support
8. **New**: Fixed-angle (screen-relative) rendering and offset support

---

## Technical Debt & Refactor Opportunities
- Entities (grass, trees, rocks) are not proper classes; extending behavior is not DRY
- Some logic is duplicated across files
- Some files are too long and need splitting/modularization
- UI components (inventory, macro, skins) could be more modular and reusable
- No automated tests; all testing is manual

---

## Success Criteria (Updated)
- [x] All entities can be rendered as shapes or sprites independently
- [~] Hitboxes are configurable and decoupled from visual representation (partial)
- [x] Pre-rendering improves performance for shape-based entities
- [ ] Player can upload and use custom PNG sprites
- [ ] Non-blocking entities (grass) have clickable areas for future interactions
- [x] All systems work correctly in both perspective modes
- [x] Performance remains acceptable (60 FPS) with new rendering system
- [~] Skins UI supports image auto-resize, metadata, and fixed-angle/offset editing 