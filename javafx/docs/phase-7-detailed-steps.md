# Phase 7: Detailed Implementation Steps for Rendering Fixes

## Overview

This document provides detailed implementation steps for fixing the critical rendering issues identified in Phase 7. Each issue is broken down into specific code changes with file locations and implementation details.

## Issue 1: Map Wrapping Issue - North Direction

### Problem Analysis
- **Location**: `src/modules/game/core/world.js` - `getVisibleChunks()` method
- **Root Cause**: The `getVisibleChunks()` method doesn't handle world wrapping when calculating visible chunks
- **Current Behavior**: When player approaches map boundaries, chunks outside world bounds are not loaded, causing visual artifacts

### Implementation Steps

#### Step 1.1: Add World Wrapping to getVisibleChunks()
**File**: `src/modules/game/core/world.js`
**Method**: `getVisibleChunks(cameraX, cameraY, cameraWidth, cameraHeight)`

```javascript
getVisibleChunks(cameraX, cameraY, cameraWidth, cameraHeight) {
    const chunks = new Set();
    const worldWidth = this.width;
    const worldHeight = this.height;
    
    // Calculate visible world area
    let left = cameraX - cameraWidth / 2;
    let right = cameraX + cameraWidth / 2;
    let top = cameraY - cameraHeight / 2;
    let bottom = cameraY + cameraHeight / 2;
    
    // Apply world wrapping
    left = ((left % worldWidth) + worldWidth) % worldWidth;
    right = ((right % worldWidth) + worldWidth) % worldWidth;
    top = ((top % worldHeight) + worldHeight) % worldHeight;
    bottom = ((bottom % worldHeight) + worldHeight) % worldHeight;
    
    // Convert to tile coordinates first, then to chunk coordinates
    const leftTile = Math.floor(left / this.config.tileSize);
    const rightTile = Math.floor(right / this.config.tileSize);
    const topTile = Math.floor(top / this.config.tileSize);
    const bottomTile = Math.floor(bottom / this.config.tileSize);
    
    // Convert tile coordinates to chunk coordinates
    const leftChunk = Math.floor(leftTile / this.config.chunkSize);
    const rightChunk = Math.floor(rightTile / this.config.chunkSize);
    const topChunk = Math.floor(topTile / this.config.chunkSize);
    const bottomChunk = Math.floor(bottomTile / this.config.chunkSize);
    
    // Handle wrapping in chunk coordinates
    const chunkCount = this.config.chunkCount;
    
    // Add all visible chunks with wrapping
    for (let chunkY = topChunk; chunkY <= bottomChunk; chunkY++) {
        for (let chunkX = leftChunk; chunkX <= rightChunk; chunkX++) {
            // Wrap chunk coordinates
            const wrappedChunkX = ((chunkX % chunkCount) + chunkCount) % chunkCount;
            const wrappedChunkY = ((chunkY % chunkCount) + chunkCount) % chunkCount;
            chunks.add(this.getChunkKey(wrappedChunkX, wrappedChunkY));
        }
    }
    
    return Array.from(chunks).map(key => {
        const [x, y] = key.split(',').map(Number);
        return { x, y, key };
    });
}
```

#### Step 1.2: Add World Wrapping Helper Method
**File**: `src/modules/game/core/world.js`
**Add after**: `getChunkKey()` method

```javascript
// Wrap world coordinates to world bounds
wrapWorldCoordinates(x, y) {
    const worldWidth = this.width;
    const worldHeight = this.height;
    
    return {
        x: ((x % worldWidth) + worldWidth) % worldWidth,
        y: ((y % worldHeight) + worldHeight) % worldHeight
    };
}
```

#### Step 1.3: Update renderBiomeBackgroundSync() for Wrapping
**File**: `src/modules/game/core/world.js`
**Method**: `renderBiomeBackgroundSync(ctx, chunk, biome)`

```javascript
renderBiomeBackgroundSync(ctx, chunk, biome) {
    const chunkSize = this.config.chunkSize * this.config.tileSize; // 2048 pixels
    
    // Calculate wrapped chunk position
    const wrappedPos = this.wrapWorldCoordinates(chunk.worldX, chunk.worldY);
    
    // Try to load the biome background image from asset manager
    if (window.game && window.game.assetManager) {
        const cacheKey = `image:background:${biome}`;
        const biomeImage = window.game.assetManager.imageCache.get(cacheKey);
        
        if (biomeImage && biomeImage.image) {
            const img = biomeImage.image;
            
            if (img.complete && img.naturalWidth > 0) {
                // Draw the biome image at wrapped position
                ctx.drawImage(img, wrappedPos.x, wrappedPos.y, chunkSize, chunkSize);
                return;
            }
        }
    }
    
    // Fallback to procedural rendering if asset manager is not available
    this.renderBiomeBackgroundFallback(ctx, chunk, biome, chunkSize, wrappedPos);
}
```

#### Step 1.4: Update renderBiomeBackgroundFallback() for Wrapping
**File**: `src/modules/game/core/world.js`
**Method**: `renderBiomeBackgroundFallback(ctx, chunk, biome, chunkSize)`

```javascript
renderBiomeBackgroundFallback(ctx, chunk, biome, chunkSize, wrappedPos) {
    const tileSize = this.config.tileSize; // 32 pixels
    
    ctx.save();
    
    // Set biome-specific colors and patterns
    if (biome === 'plains') {
        this.renderPlainsBackground(ctx, chunk, chunkSize, tileSize, wrappedPos);
    } else if (biome === 'desert') {
        this.renderDesertBackground(ctx, chunk, chunkSize, tileSize, wrappedPos);
    }
    
    ctx.restore();
}
```

#### Step 1.5: Update Background Rendering Methods
**File**: `src/modules/game/core/world.js`
**Methods**: `renderPlainsBackground()` and `renderDesertBackground()`

Update both methods to use `wrappedPos` instead of `chunk.worldX` and `chunk.worldY`:

```javascript
renderPlainsBackground(ctx, chunk, chunkSize, tileSize, wrappedPos) {
    // Fill entire chunk with base grass color
    ctx.fillStyle = '#8FBC8F';
    ctx.fillRect(wrappedPos.x, wrappedPos.y, chunkSize, chunkSize);
    
    // Add grass pattern variation across entire chunk
    for (let tileY = 0; tileY < this.config.chunkSize; tileY++) {
        for (let tileX = 0; tileX < this.config.chunkSize; tileX++) {
            const worldTileX = chunk.x * this.config.chunkSize + tileX;
            const worldTileY = chunk.y * this.config.chunkSize + tileY;
            
            // Use hash for deterministic variation
            const hash = this.simpleHash(`${this.config.seed}-${worldTileX}-${worldTileY}`);
            
            if (hash % 4 === 0) {
                // Add darker grass patches
                ctx.fillStyle = '#7CB342';
                const x = wrappedPos.x + tileX * tileSize;
                const y = wrappedPos.y + tileY * tileSize;
                ctx.fillRect(x + 4, y + 4, tileSize - 8, tileSize - 8);
            }
        }
    }
}
```

## Issue 2: Background Rotation Issue - South Direction

### Problem Analysis
- **Location**: `src/modules/game/index.js` - `renderGameContent()` method
- **Root Cause**: Background rendering in world chunks doesn't account for camera rotation in player-perspective mode
- **Current Behavior**: Background chunks render in world space without camera rotation transformation

### Implementation Steps

#### Step 2.1: Update World Render Method for Camera Rotation
**File**: `src/modules/game/core/world.js`
**Method**: `render(ctx, cameraX, cameraY, viewportWidth, viewportHeight, player)`

```javascript
render(ctx, cameraX, cameraY, viewportWidth, viewportHeight, player) {
    // Get camera mode and rotation for background rendering
    const cameraMode = window.game?.inputManager?.cameraMode || 'fixed-angle';
    const cameraRotation = window.game?.camera?.rotation || 0;
    const playerAngle = window.game?.player?.angle || 0;
    
    // Get visible chunks
    const visibleChunks = this.getVisibleChunks(cameraX, cameraY, viewportWidth, viewportHeight);
    
    // Render chunk backgrounds first with proper rotation
    visibleChunks.forEach(chunkInfo => {
        const chunk = this.loadChunk(chunkInfo.x, chunkInfo.y);
        this.renderChunkBackground(ctx, chunk, cameraMode, cameraRotation, playerAngle);
    });
    
    // Render grid overlay after backgrounds, before entities
    if (this.showGrid) {
        this.renderGrid(ctx, cameraX, cameraY, viewportWidth, viewportHeight);
    }
    
    // Now render entities (excluding fixed angle entities)
    const fixedAngleEntities = visibleChunks.flatMap(chunkInfo => {
        const chunk = this.loadChunk(chunkInfo.x, chunkInfo.y);
        return this.renderChunkEntities(ctx, chunk, player, this.renderEntity);
    });

    player.render(ctx);

    const sortedFixedAngleEntities = this.sortFixedAngleEntitiesByScreenDepth(fixedAngleEntities, player);
    sortedFixedAngleEntities.forEach(fixedAngleEntity => this.renderEntity(fixedAngleEntity, ctx));
    
    // Clean up distant chunks
    const keepChunkKeys = new Set(visibleChunks.map(chunk => chunk.key));
    this.cleanupChunks(keepChunkKeys);
    
    // Return fixed angle entities for rendering after player
    return sortedFixedAngleEntities;
}
```

#### Step 2.2: Update renderChunkBackground() for Rotation
**File**: `src/modules/game/core/world.js`
**Method**: `renderChunkBackground(ctx, chunk)`

```javascript
renderChunkBackground(ctx, chunk, cameraMode, cameraRotation, playerAngle) {
    // Apply rotation transformation for background rendering
    if (cameraMode === 'player-perspective') {
        ctx.save();
        // Apply the same rotation as the camera's player perspective transform
        ctx.translate(this.camera.x, this.camera.y);
        ctx.rotate(-playerAngle);
        ctx.translate(-this.camera.x, -this.camera.y);
        
        this.renderBiomeBackgroundSync(ctx, chunk, chunk.biome);
        
        ctx.restore();
    } else {
        // Fixed-angle mode - no rotation needed for background
        this.renderBiomeBackgroundSync(ctx, chunk, chunk.biome);
    }
}
```

#### Step 2.3: Update renderBiomeBackgroundSync() for Rotation Context
**File**: `src/modules/game/core/world.js`
**Method**: `renderBiomeBackgroundSync(ctx, chunk, biome)`

```javascript
renderBiomeBackgroundSync(ctx, chunk, biome) {
    const chunkSize = this.config.chunkSize * this.config.tileSize; // 2048 pixels
    
    // Calculate wrapped chunk position
    const wrappedPos = this.wrapWorldCoordinates(chunk.worldX, chunk.worldY);
    
    // Try to load the biome background image from asset manager
    if (window.game && window.game.assetManager) {
        const cacheKey = `image:background:${biome}`;
        const biomeImage = window.game.assetManager.imageCache.get(cacheKey);
        
        if (biomeImage && biomeImage.image) {
            const img = biomeImage.image;
            
            if (img.complete && img.naturalWidth > 0) {
                // Draw the biome image at wrapped position
                // Note: ctx is already transformed if in player-perspective mode
                ctx.drawImage(img, wrappedPos.x, wrappedPos.y, chunkSize, chunkSize);
                return;
            }
        }
    }
    
    // Fallback to procedural rendering if asset manager is not available
    this.renderBiomeBackgroundFallback(ctx, chunk, biome, chunkSize, wrappedPos);
}
```

## Issue 3: Player Direction Indicator Issue - Fixed-Angle Mode

### Problem Analysis
- **Location**: `src/modules/game/core/character.js` - `render()` method
- **Root Cause**: Player direction indicator doesn't account for camera rotation in fixed-angle mode
- **Current Behavior**: Direction indicator shows movement direction in world space, not relative to camera

### Implementation Steps

#### Step 3.1: Update Player Render Method for Camera Rotation
**File**: `src/modules/game/core/character.js`
**Method**: `render(ctx)`

```javascript
render(ctx) {
    ctx.save();

    // Get camera mode and rotation
    const cameraMode = window.game?.inputManager?.cameraMode || 'fixed-angle';
    const cameraRotation = window.game?.camera?.rotation || 0;

    // Draw player as triangle pointing in facing direction
    const size = this.size;
    let angle = this.angle;

    // Adjust angle based on camera mode
    if (cameraMode === 'fixed-angle') {
        // In fixed-angle mode, show direction relative to camera rotation
        angle = this.angle - cameraRotation;
    }
    // In player-perspective mode, angle is already correct (0 = north)

    // Calculate triangle points
    const frontX = this.x + Math.sin(angle) * size / 2;
    const frontY = this.y - Math.cos(angle) * size / 2;
    const leftX = this.x + Math.sin(angle - Math.PI * 2/3) * size / 2;
    const leftY = this.y - Math.cos(angle - Math.PI * 2/3) * size / 2;
    const rightX = this.x + Math.sin(angle + Math.PI * 2/3) * size / 2;
    const rightY = this.y - Math.cos(angle + Math.PI * 2/3) * size / 2;

    // Draw player body
    ctx.fillStyle = this.colliding ? '#ff0000' : '#00ff00';
    ctx.beginPath();
    ctx.moveTo(frontX, frontY);
    ctx.lineTo(leftX, leftY);
    ctx.lineTo(rightX, rightY);
    ctx.closePath();
    ctx.fill();

    // Draw player border
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 2;
    ctx.stroke();

    // Draw direction indicator (always visible)
    ctx.strokeStyle = '#ffff00';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(this.x, this.y);
    ctx.lineTo(frontX, frontY);
    ctx.stroke();

    ctx.restore();
}
```

#### Step 3.2: Update Player Movement Angle Calculation
**File**: `src/modules/game/core/character.js`
**Method**: `updateFixedAngleMode(input, deltaTime, collisionSystem)`

```javascript
updateFixedAngleMode(input, deltaTime, collisionSystem) {
    // Fixed-angle mode: WASD moves in fixed directions, arrow keys rotate camera
    let moveX = 0;
    let moveY = 0;

    // Get camera rotation to make controls relative to camera
    const cameraRotation = window.game?.camera?.rotation || 0;
    
    // Movement relative to camera rotation
    if (input.forward) {
        moveX += Math.sin(cameraRotation);
        moveY -= Math.cos(cameraRotation);
    }
    if (input.backward) {
        moveX -= Math.sin(cameraRotation);
        moveY += Math.cos(cameraRotation);
    }
    if (input.left) {
        moveX -= Math.cos(cameraRotation);
        moveY -= Math.sin(cameraRotation);
    }
    if (input.right) {
        moveX += Math.cos(cameraRotation);
        moveY += Math.sin(cameraRotation);
    }
    if (input.strafeLeft) {
        moveX -= Math.cos(cameraRotation);
        moveY -= Math.sin(cameraRotation);
    }
    if (input.strafeRight) {
        moveX += Math.cos(cameraRotation);
        moveY += Math.sin(cameraRotation);
    }

    // Normalize movement vector to ensure consistent speed
    const magnitude = Math.sqrt(moveX * moveX + moveY * moveY);
    if (magnitude > 0) {
        moveX /= magnitude;
        moveY /= magnitude;
    }

    // Calculate new position
    const newX = this.x + moveX * this.speed * (deltaTime / 1000);
    const newY = this.y + moveY * this.speed * (deltaTime / 1000);

    // Check collision before moving
    if (collisionSystem) {
        const collisionResponse = collisionSystem.getCollisionResponse(
            this.x, this.y, newX, newY, this.collisionRadius
        );
        
        if (!collisionResponse.blocked) {
            this.x = collisionResponse.x;
            this.y = collisionResponse.y;
        }
    } else {
        this.x = newX;
        this.y = newY;
    }

    // Update movement state
    this.isMoving = moveX !== 0 || moveY !== 0;
    
    // Update player angle based on movement direction (in world space)
    if (this.isMoving) {
        // Calculate world-space movement direction
        this.angle = Math.atan2(moveX, -moveY);
    }
}
```

## Issue 4: Camera Rotation Speed Issue - Fixed-Angle Mode

### Problem Analysis
- **Location**: `src/modules/game/rendering/camera.js` - `rotationSpeed` property
- **Root Cause**: Camera rotation speed is too fast compared to player movement speed
- **Current Value**: `Math.PI * 0.8` radians per second (about 144 degrees/second)

### Implementation Steps

#### Step 4.1: Reduce Camera Rotation Speed
**File**: `src/modules/game/rendering/camera.js`
**Method**: Constructor

```javascript
constructor(width, height) {
    this.x = 0;
    this.y = 0;
    this.width = width;
    this.height = height;
    this.zoom = 1;
    this.minZoom = 0.5;
    this.maxZoom = 3.0;
    this.zoomSpeed = 0.1;
    this.followSpeed = 0.1;
    this.targetZoom = 1;
    
    // Camera mode support
    this.mode = 'fixed-angle'; // 'fixed-angle' or 'player-perspective'
    this.rotation = 0; // Camera rotation for fixed-angle mode (radians)
    this.rotationSpeed = Math.PI * 0.3; // Reduced from 0.8 to 0.3 radians per second (~54 degrees/second)
}
```

#### Step 4.2: Add Configurable Rotation Speed
**File**: `src/modules/game/rendering/camera.js`
**Add after**: `setMode()` method

```javascript
// Set camera rotation speed
setRotationSpeed(speed) {
    this.rotationSpeed = Math.max(0.1, Math.min(Math.PI, speed));
}

// Get camera rotation speed
getRotationSpeed() {
    return this.rotationSpeed;
}
```

#### Step 4.3: Update Game Update Loop for Consistent Speed
**File**: `src/modules/game/index.js`
**Method**: `update(deltaTime)`

```javascript
update(deltaTime) {
    // Update input
    this.inputManager.update?.(deltaTime);
    
    // Handle mouse wheel zoom
    const wheelDelta = this.inputManager.getMouseWheelDelta();
    if (wheelDelta !== 0) {
        this.camera.handleZoom(wheelDelta);
    }
    
    // Handle camera rotation in fixed-angle mode with consistent speed
    const input = this.inputManager.getMovementInput();
    if (this.inputManager.cameraMode === 'fixed-angle') {
        const rotationAmount = this.camera.rotationSpeed * (deltaTime / 1000);
        if (input.cameraLeft) this.camera.rotateCamera(-rotationAmount);
        if (input.cameraRight) this.camera.rotateCamera(rotationAmount);
    }
    
    // Update camera
    this.camera.update(deltaTime);
    
    // Update player with proper input and collision
    this.player.update(deltaTime, this.inputManager, this.collisionSystem);
    
    // Save player position periodically
    this.savePlayerPosition();
    
    // Update camera to follow player
    this.camera.follow(this.player.x, this.player.y);
    
    // Update other systems
    this.dotsSystem.update?.(deltaTime);
    this.world.update?.(deltaTime);
    this.collisionSystem.update(deltaTime, this.world, this.player);
    this.interactionSystem.update?.(deltaTime);
    this.worldEnhancements.update?.(deltaTime);
    
    // Update debug info
    this.updateDebugInfo();
}
```

## Testing and Validation

### Test Cases for Each Issue

#### Issue 1: Map Wrapping
1. **Test North-South Wrapping**: Move player to top of map, verify smooth transition to bottom
2. **Test East-West Wrapping**: Move player to right edge of map, verify smooth transition to left
3. **Test Corner Wrapping**: Move player to map corners, verify proper wrapping in both directions
4. **Test Background Continuity**: Verify background tiles align properly at wrap boundaries

#### Issue 2: Background Rotation
1. **Test Player-Perspective Mode**: Switch to player-perspective mode, move south, verify background rotates with camera
2. **Test Fixed-Angle Mode**: Switch to fixed-angle mode, rotate camera, verify background doesn't rotate
3. **Test Transition Between Modes**: Switch between modes, verify background behavior changes appropriately
4. **Test Background Alignment**: Verify background tiles align properly in both modes

#### Issue 3: Direction Indicator
1. **Test Fixed-Angle Mode**: In fixed-angle mode, rotate camera south, move in different directions, verify indicator matches movement
2. **Test Player-Perspective Mode**: In player-perspective mode, verify indicator always points in movement direction
3. **Test Camera Rotation**: Rotate camera in fixed-angle mode, verify indicator adjusts correctly
4. **Test Movement Consistency**: Verify indicator direction always matches actual movement direction

#### Issue 4: Camera Rotation Speed
1. **Test Rotation Speed**: Use left/right arrow keys, verify rotation speed is smooth and not too fast
2. **Test Speed Consistency**: Verify rotation speed is consistent regardless of frame rate
3. **Test Player Movement Comparison**: Verify rotation speed feels appropriate compared to player movement speed
4. **Test Configurability**: Test setting different rotation speeds via console commands

### Console Commands for Testing

Add these console commands to `src/modules/game/index.js` in the `setupConsoleCommands()` method:

```javascript
case 'testwrapping':
    console.log('[Console] Testing map wrapping...');
    console.log('[Console] Move to map edges to test wrapping');
    break;

case 'testrotation':
    console.log('[Console] Testing background rotation...');
    console.log('[Console] Switch to player-perspective mode and move south');
    break;

case 'testindicator':
    console.log('[Console] Testing direction indicator...');
    console.log('[Console] Rotate camera south in fixed-angle mode and move');
    break;

case 'testcameraspeed':
    console.log('[Console] Testing camera rotation speed...');
    console.log('[Console] Use left/right arrow keys to test rotation speed');
    break;

case 'setrotationspeed':
    const speed = parseFloat(args[0]);
    if (!isNaN(speed) && speed > 0) {
        this.camera.setRotationSpeed(speed);
        console.log(`[Console] Camera rotation speed set to: ${speed}`);
    } else {
        console.log('[Console] Usage: cmd("setrotationspeed", <number>)');
    }
    break;
```

## Success Criteria

1. **Map Wrapping**: Player can move seamlessly across map boundaries without visual artifacts
2. **Background Rotation**: Background rotates properly with camera in player-perspective mode
3. **Direction Indicator**: Player direction indicator always shows correct movement direction relative to camera
4. **Camera Speed**: Camera rotation speed is smooth and appropriately paced
5. **Performance**: All fixes maintain or improve rendering performance
6. **Consistency**: All camera modes work consistently with proper coordinate transformations

## Implementation Order

1. **Issue 4** (Camera Speed) - Quick fix, low risk
2. **Issue 3** (Direction Indicator) - Medium complexity, affects player feedback
3. **Issue 1** (Map Wrapping) - High complexity, affects core world rendering
4. **Issue 2** (Background Rotation) - High complexity, depends on Issue 1 fixes

## Notes

- All coordinate transformations should be tested thoroughly to ensure they work correctly in both camera modes
- The world wrapping implementation should be efficient and not impact performance significantly
- Background rotation should be consistent with entity rendering behavior
- Camera rotation speed should feel natural and responsive to player input 