# JavaFX Game Migration

## Overview

This directory contains the JavaFX-based migration of the Electron web game. The migration preserves all existing functionality while leveraging Java's performance benefits, Project Loom for virtual threads, and GraalVM for native compilation.

## Architecture Overview

### Technology Stack
- **Java 21+**: Latest LTS with Project Loom support
- **JavaFX**: Modern UI framework for desktop applications
- **GraalVM Native Image**: For native compilation and performance
- **SQLite**: Shared persistence layer with Electron version
- **Project Loom**: Virtual threads and structured concurrency
- **Gradle**: Build system with native image support

### Migration Strategy

#### Phase 1: Foundation & WebView Bridge
- Basic JavaFX application structure
- WebView integration to load existing HTML/JS UI
- SQLite database connectivity
- Shared asset loading

#### Phase 2: Core Systems Migration
- Game loop implementation with JavaFX AnimationTimer
- Input system with JavaFX event handling
- Camera and rendering pipeline
- World generation and chunk management

#### Phase 3: Canvas Rendering Migration
- Replace WebView with JavaFX Canvas
- Entity rendering system
- UI components on canvas
- Performance optimization

#### Phase 4: Advanced Features
- Project Loom integration for background tasks
- Structured concurrency for game systems
- Native image compilation
- Performance profiling and optimization

## Directory Structure

```
javafx/
├── docs/                          # Migration documentation
│   ├── requirements.md            # System requirements and architecture
│   ├── phase-1-migration.md      # Phase 1 implementation guide
│   ├── phase-2-migration.md      # Phase 2 implementation guide
│   ├── phase-3-migration.md      # Phase 3 implementation guide
│   └── phase-4-migration.md      # Phase 4 implementation guide
├── src/
│   ├── main/
│   │   ├── java/                 # Java source code
│   │   │   ├── com/game/         # Main game package
│   │   │   │   ├── core/         # Core game systems
│   │   │   │   ├── rendering/    # Rendering pipeline
│   │   │   │   ├── persistence/  # Database and persistence
│   │   │   │   ├── ui/           # User interface components
│   │   │   │   └── utils/        # Utility classes
│   │   │   └── module-info.java  # Java module definition
│   │   └── resources/            # Resources and assets
│   │       ├── assets/           # Shared game assets
│   │       ├── database/         # SQLite database files
│   │       └── ui/               # HTML/CSS/JS for WebView
│   └── test/
│       └── java/                 # Test code
├── build.gradle                  # Gradle build configuration
├── gradle.properties             # Gradle properties
└── README.md                     # This file
```

## Quick Start

### Prerequisites
- Java 21+ with GraalVM
- Gradle 8.0+
- SQLite 3.x

### Development Setup
```bash
# Navigate to JavaFX directory
cd javafx

# Build the project
./gradlew build

# Run in development mode
./gradlew run

# Build native image (requires GraalVM)
./gradlew nativeCompile
```

### Running Both Versions
```bash
# Run Electron version
npm start

# Run JavaFX version (in another terminal)
cd javafx && ./gradlew run
```

## Key Design Principles

### Object-Oriented Philosophy
- **Prefer composition over inheritance** for flexible entity systems
- **Use interfaces and strategy patterns** for polymorphic behavior
- **Avoid deep class hierarchies** that complicate generics
- **Leverage Java records** for simple data structures
- **Use Map<String, Object>** for heterogeneous collections when appropriate

### Performance Considerations
- **Virtual threads** for I/O operations (database, file loading)
- **Structured concurrency** for coordinated background tasks
- **Native image compilation** for startup performance
- **Canvas rendering** for optimal graphics performance
- **Chunk-based world loading** for memory efficiency

### Migration Guidelines
- **Preserve existing behavior** during migration
- **Maintain shared database schema** for compatibility
- **Reference Electron code** for implementation details
- **Test both versions** to ensure feature parity
- **Incremental migration** with working checkpoints

## Build Profiles

### Development Profile
```bash
./gradlew run -Pprofile=dev
```
- Full logging enabled
- Hot reload support
- Debug information displayed
- Development database

### Production Profile
```bash
./gradlew run -Pprofile=prod
```
- Optimized performance
- Minimal logging
- Production database
- Release configuration

### Native Profile
```bash
./gradlew nativeCompile -Pprofile=native
```
- GraalVM native image compilation
- Optimized for startup time
- Reduced memory footprint
- Platform-specific binaries

## Testing Strategy

### Unit Tests
- Core game logic validation
- Database operations testing
- Rendering pipeline verification
- Input system validation

### Integration Tests
- End-to-end game flow testing
- Database migration testing
- Asset loading verification
- Performance benchmarking

### Compatibility Tests
- Feature parity with Electron version
- Database schema compatibility
- Asset format compatibility
- UI behavior consistency

## Performance Targets

### Startup Time
- **Development**: < 5 seconds
- **Production**: < 3 seconds
- **Native**: < 1 second

### Memory Usage
- **Development**: < 512MB
- **Production**: < 256MB
- **Native**: < 128MB

### Frame Rate
- **Target**: 60 FPS stable
- **Minimum**: 30 FPS under load
- **Peak**: 120 FPS with vsync

## Troubleshooting

### Common Issues
1. **GraalVM not found**: Install GraalVM and set JAVA_HOME
2. **Native compilation fails**: Check GraalVM version compatibility
3. **Database connection errors**: Verify SQLite file permissions
4. **Asset loading issues**: Check resource paths and file existence

### Debug Commands
```bash
# Enable debug logging
./gradlew run -Dorg.slf4j.simpleLogger.defaultLogLevel=debug

# Profile memory usage
./gradlew run -Dcom.sun.management.jmxremote

# Run with specific JVM options
./gradlew run -Djava.vm.options="-Xmx2g -XX:+UseG1GC"
```

## Contributing

### Development Workflow
1. **Create feature branch** from main
2. **Implement changes** following migration phases
3. **Test thoroughly** with both Electron and JavaFX versions
4. **Update documentation** for any architectural changes
5. **Submit pull request** with detailed description

### Code Standards
- **Java 21+ syntax** and features
- **Consistent naming conventions**
- **Comprehensive error handling**
- **Javadoc documentation** for public APIs
- **Unit test coverage** for critical paths

## Future Enhancements

### Planned Features
- **3D rendering** with JavaFX 3D
- **Multiplayer support** with networking
- **Plugin system** for extensibility
- **Advanced AI** for NPCs and world events
- **Modding support** with dynamic loading

### Performance Optimizations
- **GPU acceleration** for rendering
- **Memory pooling** for objects
- **Background compilation** for JIT optimization
- **Predictive loading** for world chunks
- **Caching strategies** for assets and data 