# Phase 7: Image Rendering with Configuration System

## Overview
Implement a comprehensive image rendering system with configuration-driven sizing, proper 2.5D layering, and instance-level customization capabilities.

## Goals
- Fix 2.5D rendering order (trees rendered last for proper layering)
- Implement configuration-driven image sizing
- Support instance-level image configuration overrides
- Ensure trees always appear upright regardless of camera angle

## Current Issues
1. **2.5D Layering**: Trees not rendered last, preventing proper "behind tree" gameplay
2. **Fixed Screen Angle**: Trees don't always appear upright in screen context
3. **Size Control**: Images scaled to fit grid squares instead of using configuration
4. **Memory vs Display Size**: Large images consume memory but don't respect intended display size
5. **Lack of Customization**: No instance-level image configuration overrides

## Technical Requirements

### 1. Image Configuration System
```java
// Entity type level configuration
public class ImageConfiguration {
    private double width;           // Display width in world units
    private double height;          // Display height in world units
    private double fixedScreenAngle; // Always 0 for trees (upright)
    private RenderMode renderMode;  // GRID_FIT, CONFIGURED_SIZE, etc.
    private double opacity;         // 0.0 to 1.0
    private boolean renderLast;     // For 2.5D layering
}

public enum RenderMode {
    GRID_FIT,           // Scale to fit grid square (current behavior)
    CONFIGURED_SIZE,    // Use width/height from config (new default)
    ASPECT_RATIO_FIT,   // Maintain aspect ratio within bounds
    CUSTOM_SIZE         // Use instance-specific size
}
```

### 2. Entity Instance Configuration
```java
// Instance-level override
public class Entity {
    private ImageConfiguration imageConfig; // Overrides entity type config
    // ... existing properties
}
```

### 3. Rendering Order System
```java
// Render entities in proper 2.5D order
public class Renderer {
    private void renderEntities(List<Entity> entities) {
        // Sort entities by render order
        List<Entity> sortedEntities = entities.stream()
            .sorted(Comparator.comparing(e -> e.getImageConfig().isRenderLast()))
            .collect(Collectors.toList());
        
        // Render non-last entities first
        sortedEntities.stream()
            .filter(e -> !e.getImageConfig().isRenderLast())
            .forEach(this::renderEntity);
        
        // Render last entities (trees) after everything else
        sortedEntities.stream()
            .filter(e -> e.getImageConfig().isRenderLast())
            .forEach(this::renderEntity);
    }
}
```

## Implementation Steps

### Step 1: Create Image Configuration Classes
- [ ] Create `ImageConfiguration` class with all required properties
- [ ] Create `RenderMode` enum with different rendering strategies
- [ ] Add unit tests for configuration validation

### Step 2: Update Entity System
- [ ] Add `ImageConfiguration` property to `Entity` class
- [ ] Update `EntityConfig` to include default image configuration
- [ ] Modify entity creation to use configuration
- [ ] Add tests for entity configuration inheritance

### Step 3: Implement Configuration-Driven Sizing
- [ ] Update `Renderer` to use `ImageConfiguration` for sizing
- [ ] Implement different `RenderMode` strategies
- [ ] Change default from `GRID_FIT` to `CONFIGURED_SIZE`
- [ ] Add tests for different sizing modes

### Step 4: Fix 2.5D Rendering Order
- [ ] Implement render order sorting in `Renderer`
- [ ] Ensure trees (`renderLast=true`) are rendered after other entities
- [ ] Test player movement behind trees
- [ ] Add visual tests for proper layering

### Step 5: Fix Tree Orientation
- [ ] Set `fixedScreenAngle=0` for tree entities
- [ ] Ensure trees always face upward regardless of camera angle
- [ ] Test tree appearance at different camera angles
- [ ] Verify trees remain upright during player movement

### Step 6: Instance-Level Configuration
- [ ] Allow individual entities to override image configuration
- [ ] Implement configuration inheritance (instance → entity type → default)
- [ ] Add tests for configuration override behavior
- [ ] Create example of custom tree sizing

### Step 7: Memory Optimization
- [ ] Ensure large images are properly scaled for display
- [ ] Verify memory usage doesn't affect rendering performance
- [ ] Add tests for different image sizes
- [ ] Document memory vs display size relationship

## Testing Strategy

### Unit Tests
- [ ] `ImageConfigurationTest` - Configuration validation and defaults
- [ ] `EntityImageConfigTest` - Entity configuration inheritance
- [ ] `RendererConfigTest` - Configuration-driven rendering
- [ ] `RenderOrderTest` - 2.5D layering verification

### Integration Tests
- [ ] `TreeRenderingTest` - Trees appear behind player correctly
- [ ] `ImageSizingTest` - Different image sizes render correctly
- [ ] `ConfigurationOverrideTest` - Instance-level overrides work

### Visual Tests
- [ ] Player movement behind trees
- [ ] Tree orientation at different camera angles
- [ ] Different image sizes and configurations
- [ ] Custom tree instances with different properties

## Success Criteria
- [ ] Trees render behind player when player moves behind them
- [ ] Trees always appear upright regardless of camera angle
- [ ] Image size controlled by configuration, not file size
- [ ] Instance-level configuration overrides work correctly
- [ ] All existing tests pass
- [ ] Coverage requirements met
- [ ] Checkstyle compliance maintained

## Configuration Examples

### Default Tree Configuration
```json
{
  "imageConfig": {
    "width": 1.2,
    "height": 1.8,
    "fixedScreenAngle": 0.0,
    "renderMode": "CONFIGURED_SIZE",
    "opacity": 1.0,
    "renderLast": true
  }
}
```

### Custom Tree Instance
```java
Entity customTree = new Entity("tree", x, y);
customTree.setImageConfig(new ImageConfiguration(
    1.5,  // 25% taller
    2.0,  // 11% wider
    0.0,  // upright
    RenderMode.CONFIGURED_SIZE,
    0.8,  // 20% transparent
    true  // render last
));
```

## Dependencies
- Existing entity system
- Current rendering pipeline
- Image loading system
- Camera system for angle calculations

## Risk Mitigation
- **Performance**: Monitor rendering performance with new sorting
- **Memory**: Ensure large images don't cause memory issues
- **Compatibility**: Maintain backward compatibility with existing entities
- **Testing**: Comprehensive testing to prevent rendering regressions 