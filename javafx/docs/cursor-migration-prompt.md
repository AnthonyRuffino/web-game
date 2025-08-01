# JavaFX Migration Prompt for Cursor

## Overview

You are tasked with helping me **migrate a browser-based Electron application** to a **JavaFX-based native desktop application**, implemented in Java and structured to support future high-performance rendering pipelines.

## Current Application Context

The existing Electron application is a 2D game with the following key features:

### Architecture
- **Main Process**: Electron main process with SQLite database management
- **Renderer Process**: HTML5 Canvas-based game rendering
- **Database**: SQLite with tables for worlds, characters, entities, inventory
- **Game Systems**: Chunk-based world generation, entity management, player movement, camera controls

### Key Components
- **Game Loop**: 60 FPS animation loop with delta time
- **Input System**: Keyboard (WASD/arrows) and mouse input handling
- **Camera System**: Multiple modes (fixed-angle, player-perspective) with zoom/rotation
- **World System**: Procedural chunk-based world generation with trees, rocks, grass
- **Entity System**: Heterogeneous entities stored in arrays with type-based processing
- **Persistence**: SQLite database with character position, inventory, world state
- **UI System**: Dynamic menu system with tabs, buttons, and callbacks

### Object-Oriented Philosophy
The current codebase uses **loose object-oriented practices**:
- Often uses plain JavaScript objects instead of classes
- Stores **heterogeneous object types in single arrays** with `type` field for behavior switching
- Relies on runtime switching logic (e.g., `switch (obj.type)`)
- **Prefer composition over inheritance** for flexible entity systems
- Use **interfaces and strategy patterns** when needed
- Avoid overly rigid inheritance hierarchies that complicate generics

## Migration Goals

### Technology Stack
1. **Language/Platform**: Java 21+ with:
   - **Project Loom** (virtual threads)
   - **Structured Concurrency APIs** (even if experimental)
2. **Native Image Compilation**:
   - **GraalVM Native Image**
   - Explore **Micronaut** or **Quarkus** if beneficial for DI/lifecycle
3. **Persistence**: **SQLite** (same schema as Electron version)
4. **UI Phases**:
   - **Phase 1**: WebView bridge (load existing HTML/JS UI)
   - **Phase 2**: Progressive JavaFX widget migration
   - **Phase 3**: Full Canvas-rendered UI using JavaFX Canvas
5. **Game Loop**: JavaFX AnimationTimer with Loom-powered background tasks

### Performance Targets
- **Startup Time**: < 3 seconds (JVM), < 1 second (native)
- **Memory Usage**: < 256MB (JVM), < 128MB (native)
- **Frame Rate**: 60 FPS stable, 30 FPS minimum under load

## Migration Strategy

### Phase-Based Approach
Create a **phased migration plan** that makes sense based on architectural complexity:

1. **Phase 1**: Foundation & WebView Bridge
   - Basic JavaFX application structure
   - WebView integration to load existing HTML/JS UI
   - SQLite database connectivity with virtual threads
   - Shared asset loading

2. **Phase 2**: Core Systems Migration
   - Game loop with JavaFX AnimationTimer
   - Input system with JavaFX events
   - Camera and rendering pipeline
   - World generation and chunk management

3. **Phase 3**: Canvas Rendering Migration
   - Replace WebView with JavaFX Canvas
   - Entity rendering system
   - UI components on canvas
   - Performance optimization

4. **Phase 4**: Advanced Features
   - Project Loom integration for background tasks
   - Structured concurrency for game systems
   - Native image compilation
   - Performance profiling and optimization

## Implementation Requirements

### Directory Structure
```
javafx/
├── docs/                          # Migration documentation
├── src/
│   ├── main/
│   │   ├── java/com/game/         # Java source code
│   │   │   ├── core/              # Core game systems
│   │   │   ├── rendering/         # Rendering pipeline
│   │   │   ├── persistence/       # Database and persistence
│   │   │   ├── ui/                # User interface components
│   │   │   └── utils/             # Utility classes
│   │   └── resources/             # Resources and assets
│   └── test/java/                 # Test code
├── build.gradle                   # Gradle build configuration
└── README.md                      # Migration overview
```

### Build System
- **Gradle** with native image support
- **Build profiles**: dev, prod, native
- **GraalVM integration** with proper reflection configuration
- **Multi-platform support** (Windows, macOS, Linux)

### Key Design Principles

#### Object-Oriented Philosophy
- **Prefer composition over inheritance** for flexible entity systems
- **Use interfaces and strategy patterns** for polymorphic behavior
- **Avoid deep class hierarchies** that complicate generics
- **Leverage Java records** for simple data structures
- **Use Map<String, Object>** for heterogeneous collections when appropriate
- **Maintain type safety** where beneficial

#### Performance Considerations
- **Virtual threads** for I/O operations (database, file loading)
- **Structured concurrency** for coordinated background tasks
- **Native image compilation** for startup performance
- **Canvas rendering** for optimal graphics performance
- **Chunk-based world loading** for memory efficiency

#### Migration Guidelines
- **Preserve existing behavior** during migration
- **Maintain shared database schema** for compatibility
- **Reference Electron code** for implementation details
- **Test both versions** to ensure feature parity
- **Incremental migration** with working checkpoints

## Deliverables

### Documentation
1. **Requirements Document**: System architecture, goals, technical specifications
2. **Phase-by-Phase Migration Guides**: Step-by-step implementation instructions
3. **Architecture Documentation**: Design patterns and system interactions
4. **Performance Guides**: Optimization strategies and benchmarks

### Code Implementation
1. **JavaFX Application Structure**: Main application with proper module system
2. **Database Integration**: SQLite with virtual thread I/O operations
3. **Game Systems**: Core game loop, input, camera, world generation
4. **Rendering Pipeline**: Canvas-based rendering with JavaFX GraphicsContext
5. **Advanced Features**: Project Loom integration, structured concurrency
6. **Build System**: Gradle configuration with native image support

### Testing Strategy
1. **Unit Tests**: Core game logic validation
2. **Integration Tests**: End-to-end system testing
3. **Performance Tests**: Frame rate and memory usage testing
4. **Compatibility Tests**: Feature parity with Electron version

## Specific Implementation Notes

### Database Schema Compatibility
Maintain identical SQLite schema to ensure data sharing between Electron and JavaFX versions:
- `worlds` table: World configuration and metadata
- `characters` table: Player state and position
- `entity_types` table: Entity type definitions
- `cell_changes` table: World modification tracking
- `cell_entities` table: Entity storage by cell
- `inventory` table: Player inventory management

### Entity System Design
Given the heterogeneous nature of the current entity system:
- Use **composition patterns** for entity behavior
- Implement **strategy patterns** for different entity types
- Consider **Map<String, Object>** for flexible entity data
- Use **Java records** for simple entity structures
- Avoid forcing everything into rigid class hierarchies

### Performance Optimization
- **Virtual threads** for all I/O operations
- **Structured concurrency** for coordinated background tasks
- **Efficient rendering** with proper culling and batching
- **Memory management** with proper cleanup and pooling
- **Native compilation** for startup and runtime performance

## Success Criteria

### Functional Success
- **Feature Parity**: 100% feature parity with Electron version
- **Performance**: Equal or better performance metrics
- **Stability**: Zero crashes during normal operation
- **Compatibility**: Full data compatibility between versions

### Technical Success
- **Native Compilation**: Successful GraalVM native image compilation
- **Virtual Threads**: Effective use of Project Loom features
- **Memory Efficiency**: Reduced memory usage compared to Electron
- **Startup Performance**: Faster startup times than Electron

### User Experience Success
- **Smooth Gameplay**: Consistent 60 FPS gameplay
- **Responsive UI**: Responsive user interface interactions
- **Intuitive Controls**: Natural and intuitive control scheme
- **Visual Quality**: High-quality visual presentation

## Additional Considerations

### Framework Evaluation
Evaluate whether **Micronaut** or **Quarkus** would be beneficial for:
- Dependency injection and lifecycle management
- GraalVM native image preparation
- Application structure and configuration
- Only include if they provide clear benefits

### Experimental Features
- Use **structured concurrency scopes** if available and beneficial
- Explore **experimental Loom features** for context management
- Make all experimental features **toggleable** via profiles or system properties

### Development Workflow
- **Parallel Development**: Ability to develop both versions simultaneously
- **Shared Assets**: Common asset files and resources
- **Shared Database**: Common database schema and data
- **Testing Strategy**: Comprehensive testing of both versions

## Execution Instructions

1. **Analyze the existing Electron codebase** to understand the architecture
2. **Create the phased migration plan** based on complexity and dependencies
3. **Implement each phase** with working checkpoints
4. **Maintain compatibility** with the existing Electron version
5. **Test thoroughly** to ensure feature parity and performance
6. **Document the migration** for future reference and maintenance

The goal is to create a **production-ready JavaFX application** that maintains all existing functionality while leveraging Java's performance benefits, Project Loom for virtual threads, and GraalVM for native compilation. 