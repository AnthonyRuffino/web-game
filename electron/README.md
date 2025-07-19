# Web Game - Electron Migration

## Overview
This is the Electron version of the web game, migrated from browser-based script loading to a proper desktop application with ES6 modules.

## Current Status: Phase 1 Complete ✅

### What's Working
- ✅ Basic Electron app structure
- ✅ Main process and renderer process setup
- ✅ Canvas initialization and responsive sizing
- ✅ Basic game loop with FPS counter
- ✅ Window resize handling
- ✅ Debug information display

### Features Implemented
1. **Electron Foundation**
   - Main process (`main.js`) with proper window management
   - Preload script for secure IPC communication
   - Renderer process with ES6 module support
   - Responsive canvas that scales with window size

2. **Canvas System**
   - CanvasManager class for handling canvas operations
   - Responsive sizing that maintains aspect ratio
   - Basic rendering utilities (rectangles, circles, text)
   - Window resize event handling

3. **Game Loop**
   - Proper timing system with delta time
   - FPS counter and performance monitoring
   - Debug information display
   - Basic rendering pipeline

## How to Run

### Prerequisites
- Node.js (v18 or higher)
- npm

### Installation
```bash
cd electron
npm install
```

### Development
```bash
npm start
```

### Development with DevTools
```bash
npm run dev
```

## Project Structure
```
electron/
├── package.json          # Electron dependencies and scripts
├── main.js              # Main Electron process
├── preload.js           # Preload script for security
├── src/
│   ├── index.html       # Main HTML file
│   ├── styles/
│   │   └── main.css     # Basic styles
│   └── modules/
│       └── game/
│           ├── index.js # Game entry point
│           └── canvas.js # Canvas management
└── assets/
    └── images/          # Game assets (future)
```

## Next Steps: Phase 2 - Character System

### Planned Features
1. **Player Character**
   - Simple circle/square representation
   - Position tracking
   - Basic movement system

2. **Input Handling**
   - Keyboard input (WASD/Arrow keys)
   - Movement validation
   - Smooth movement

### Implementation Plan
- Create Player class with position and movement
- Add InputManager for keyboard handling
- Integrate input with character movement
- Add visual feedback for movement

## Migration Strategy

### Phase-by-Phase Approach
1. **Phase 1**: ✅ Electron Foundation (Complete)
2. **Phase 2**: Character System with Input
3. **Phase 3**: Rendering System with Dots/Particles
4. **Phase 4**: World System with Chunks
5. **Phase 5**: Entity System (Rocks, Trees, Grass)
6. **Phase 6**: Game Loop and State Management
7. **Phase 7**: UI System (Console, Menus)
8. **Phase 8**: Persistence (Save/Load)
9. **Phase 9+**: Advanced Features

### Code Organization
- **ES6 Modules**: Proper import/export syntax
- **Class-based**: Organized into focused classes
- **Separation of Concerns**: Independent modules
- **TypeScript Ready**: Structure for future TypeScript conversion

## Development Guidelines

### Code Style
- Use ES6+ features (classes, arrow functions, destructuring)
- Follow consistent naming conventions
- Add proper error handling
- Include JSDoc comments for complex functions

### Testing
- Test each iteration thoroughly
- Verify feature parity with original game
- Monitor performance at each step
- Test with actual gameplay scenarios

### Debugging
- Use Electron DevTools for debugging
- Check console output for errors
- Monitor FPS and performance metrics
- Use debug info panel for real-time data

## Troubleshooting

### Common Issues
1. **Canvas not rendering**: Check if canvas element exists in HTML
2. **Module import errors**: Verify file paths and ES6 module syntax
3. **Window not opening**: Check main.js for proper window creation
4. **Performance issues**: Monitor FPS counter and optimize rendering

### Debug Commands
- Open DevTools: `Ctrl+Shift+I` (or `Cmd+Option+I` on Mac)
- Reload app: `Ctrl+R` (or `Cmd+R` on Mac)
- Force quit: `Ctrl+Q` (or `Cmd+Q` on Mac)

## Future Enhancements

### Planned Features
- TypeScript migration
- Hot reloading for development
- Build system for distribution
- Performance profiling tools
- Automated testing framework

### Integration Possibilities
- Native file system access
- System tray integration
- Auto-update system
- Cross-platform packaging
- Advanced debugging tools 