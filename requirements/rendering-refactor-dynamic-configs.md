# Rendering Refactor - Dynamic Image Configs

## Problem Statement

The current rendering system has a fundamental flaw: entity rendering configuration is determined at entity creation time through `createEntityWithBoilerplate()`. This makes it impossible to dynamically change rendering properties like size, fixedScreenAngle, drawOffsetX, drawOffsetY without recreating the entire entity.

## Current Issues

1. **Static Config at Creation**: Entity render properties are locked in when `createEntityWithBoilerplate()` is called
2. **No Runtime Changes**: Cannot adjust entity size, rotation, or positioning after creation
3. **Scattered Logic**: Render logic is embedded in entity creation, making it hard to modify
4. **No Dynamic Configs**: Cannot load different configs for the same entity type at runtime

## Solution: Dynamic Rendering with Config Injection

### Core Principles

1. **Extract Render Logic**: Pull render method out of `createEntityWithBoilerplate()`
2. **Config Injection**: Pass dynamic config to render method at render time
3. **Fallback System**: Use default configs when entity-specific configs are missing
4. **Preserve Working Logic**: Keep all existing render logic, just make it dynamic

### Architecture Overview

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Config Store  │───▶│ EntityRenderer  │───▶│  Canvas Output  │
│  (localStorage) │    │  (Enhanced)     │    │                 │
└─────────────────┘    └─────────────────┘    └─────────────────┘
         │                       │                       │
         ▼                       ▼                       ▼
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│  Asset Manager  │    │  Entity Cache   │    │  Camera System  │
│  (Filesystem)   │    │  (In-Memory)    │    │  (Preserved)    │
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

## Detailed Requirements

### 1. EntityRenderer Enhancement

#### 1.1 Extract Render Method
- **Keep**: `createEntityWithBoilerplate()` for backward compatibility
- **Add**: `renderEntity(ctx, entity, config)` method
- **Extract**: All render logic from `createEntityWithBoilerplate()` into new method
- **Parameters**: 
  - `ctx`: Canvas context
  - `entity`: Entity object with x, y, type, cacheKey
  - `config`: Dynamic config object with size, fixedScreenAngle, drawOffsetX, drawOffsetY

#### 1.2 Render Method Signature
```javascript
// New method to add to EntityRenderer
static renderEntity(ctx, entity) {
  // Extract the render logic from createEntityWithBoilerplate
  // Use entity.x, entity.y, entity.type
  // Get config automatically: entity.imageConfig || AssetManager.getEntityTypeConfig(entity.type)
  // Get cached image using entity.imageCacheKey || default cache key for entity type
  // Handle camera mode, rotation, and fixed screen angles
  // Apply config properties for rendering
}
```

#### 1.3 Config Loading Strategy
```javascript
// Priority order for config loading:
// 1. Entity-specific imageConfig (if entity has imageConfig property) - OPTIONAL
// 2. Entity type default config (from AssetManager) - PRIMARY FALLBACK
// 3. Hardcoded fallback config (size: 32, fixedScreenAngle: null, etc.) - FINAL FALLBACK
```

### 2. AssetManager Config Management

#### 2.1 Config Storage
- **localStorage Key**: `"entityTypeConfigs"`
- **Memory Cache**: `AssetManager.entityTypeConfigs` Map
- **Format**: `{ "entity:tree": { size: 24, fixedScreenAngle: 0, drawOffsetY: -42 } }`
- **Purpose**: Store default configs for each entity type, loaded at startup

#### 2.2 Config Methods
```javascript
// Add to AssetManager
initImageConfigs() // Load configs at startup
ensureAllEntityTypeConfigs() // Create defaults for missing entities and then persist to localStorage
getEntityTypeConfig(entityType) // Get config for entity type
updateEntityTypeConfig(entityType, config) // Update config
saveEntityTypeConfig(entityType, config) // Persist to localStorage
```

#### 2.3 Entity Type Default Configs
```javascript
const entityTypeDefaultConfigs = {
  "entity:grass": { size: 32, fixedScreenAngle: null, drawOffsetX: 0, drawOffsetY: 0 },
  "entity:tree": { size: 24, fixedScreenAngle: 0, drawOffsetX: 0, drawOffsetY: -42 },
  "entity:rock": { size: 20, fixedScreenAngle: null, drawOffsetX: 0, drawOffsetY: 0 }
};
```
- **Purpose**: These configs are loaded at startup and provide the primary fallback for all entity instances
- **Coverage**: All entity types must have default configs to ensure rendering works

### 3. Entity System Updates

#### 3.1 Entity Properties (Optional)
- **Add**: `imageCacheKey` property for entity-specific images (optional)
- **Add**: `imageConfig` property for entity-specific configs (optional)
- **Format**: `"image:entity:{entityType}"` (e.g., "image:entity:tree")
- **Purpose**: Enable per-entity customization (not required for basic functionality)
- **Note**: Most entities will use entity type defaults, these are for special cases

#### 3.2 Entity Creation Flow
```javascript
// Keep existing way (for compatibility)
entity.create() → createEntityWithBoilerplate() → entity.render()

// Add new way (for dynamic configs)
entity.create() → simple data setup → EntityRenderer.renderEntity(ctx, entity)
// EntityRenderer.renderEntity() will automatically get config from entity type defaults
```

#### 3.3 Entity Data Structure
```javascript
{
  type: 'tree',
  x: 100,
  y: 200,
  imageCacheKey: 'image:entity:tree',  // Optional entity-specific image
  imageConfig: { size: 30, fixedScreenAngle: 45 }, // Optional entity-specific config
  // ... other entity data
}
```

### 4. Integration Points

#### 4.1 World Rendering
- **Update**: `world.js` to use new render method
- **Pass**: Entity object to render method (no config parameter needed)
- **Fallback**: EntityRenderer automatically uses entity type defaults

#### 4.2 Game Loop
- **Preserve**: All existing camera and input logic
- **Enhance**: Entity rendering to use entity type configs automatically
- **Maintain**: Performance and visual consistency

### 5. Error Handling

#### 5.1 Missing Configs
- **Strategy**: Use entity type default config (loaded at startup)
- **Logging**: No error logging for missing configs (as requested)
- **Fallback**: Hardcoded fallback config if entity type config missing

#### 5.2 Missing Images
- **Strategy**: Show error placeholder
- **Logging**: Aggregated logging to prevent spam
- **Fallback**: Red square with "?" symbol

### 6. Implementation Phases

#### Phase 1: Foundation ✅ COMPLETED
1. ✅ Add config management to AssetManager
2. ✅ Create default configs for all entity types
3. ✅ Test config loading and storage

#### Phase 2: EntityRenderer Enhancement ✅ COMPLETED
1. ✅ Extract render logic from `createEntityWithBoilerplate()`
2. ✅ Create `renderEntity(ctx, entity)` method
3. ✅ Test new render method alongside existing system

#### Phase 3: Entity Integration ✅ COMPLETED
1. ✅ Add optional `imageCacheKey` and `imageConfig` properties to entities
2. ✅ Update entity creation to support new render method
3. ✅ Test both rendering paths work (most entities use type defaults)

#### Phase 4: World Integration ✅ COMPLETED
1. ✅ Update world rendering to use new render method
2. ✅ Test all entity types use their type defaults correctly
3. ✅ Verify camera controls still work

### 7. Success Criteria

#### 7.1 Functional Requirements ✅ ALL COMPLETED
- ✅ Entity rendering uses entity type configs automatically
- ✅ Entity type config changes apply immediately without entity recreation
- ✅ Entity type default configs work for all entity types
- ✅ Camera controls preserved
- ✅ Performance maintained

#### 7.2 Technical Requirements ✅ ALL COMPLETED
- ✅ Render logic extracted from entity creation
- ✅ Entity type configs loaded at startup
- ✅ Automatic config lookup at render time
- ✅ Fallback system for missing configs
- ✅ Backward compatibility maintained

#### 7.3 Performance Requirements ✅ ALL COMPLETED
- ✅ No performance regression
- ✅ Config lookup is fast (memory cache)
- ✅ Render method efficient
- ✅ No unnecessary entity recreation

### 8. Benefits

#### 8.1 Dynamic Rendering
- **Size Changes**: Entity types can be resized at runtime
- **Rotation Control**: Fixed screen angles can be adjusted per entity type
- **Position Offsets**: Draw offsets can be modified per entity type
- **Per-Entity Configs**: Individual entities can optionally have unique configs

#### 8.2 Maintainability
- **Centralized Logic**: All render logic in one place
- **Config-Driven**: Rendering controlled by data, not code
- **Extensible**: Easy to add new config properties
- **Testable**: Render logic can be tested independently

#### 8.3 Future Features
- **Skins System**: Different visual styles for same entity type
- **Animation**: Config changes can drive animations
- **User Customization**: Players can modify entity appearances
- **Mod Support**: External configs can be loaded

## Conclusion ✅ COMPLETED

This refactor has successfully transformed the rendering system from static, creation-time configuration to dynamic, entity-type-based configuration. The key was to extract the proven render logic from `createEntityWithBoilerplate()` and make it automatically use entity type configs loaded at startup, while maintaining all existing functionality and performance.

The entity type config system now enables future features like the skins menu and user customization, while providing a solid foundation for more advanced rendering capabilities. Most entities use their type defaults, with optional per-entity customization available for special cases.

## 🎉 **RENDERING REFACTOR COMPLETE!**

All phases have been successfully implemented and tested:
- ✅ **Phase 1**: Foundation - Entity type config management
- ✅ **Phase 2**: EntityRenderer Enhancement - Dynamic render method
- ✅ **Phase 3**: Entity Integration - Optional properties
- ✅ **Phase 4**: World Integration - New rendering system

The system is now ready for the next major requirements: **Menu System with Skins** and **Loading Images for Assets**. 