# SVG Generator Module

This module provides SVG-to-image rendering capabilities for the game engine using JavaFX WebView.

## Overview

The SVG Generator module consists of two main implementations:

1. **SvgGeneratorWebView.java** - Primary implementation using JavaFX WebView
2. **SvgGenerator.java** - Fallback implementation using pure Java2D

## Features

### SvgGeneratorWebView (Recommended)

- ✅ Full SVG specification support
- ✅ High-quality rendering with anti-aliasing
- ✅ Complex SVG features (gradients, filters, text, etc.)
- ✅ Security features (SVG sanitization)
- ✅ Thread-safe operation
- ✅ PNG file output

### SvgGenerator (Fallback)

- ✅ Lightweight and fast
- ✅ No external dependencies
- ✅ Basic shape support (rect, circle, ellipse)
- ✅ Works in headless environments

## Quick Start

### Basic Usage

```java
import com.game.graphics.svg.SvgGeneratorWebView;
import java.nio.file.Path;
import java.nio.file.Paths;

// Simple SVG rendering
String svg = "<svg width='64' height='64'><circle cx='32' cy='32' r='20' fill='red'/></svg>";
BufferedImage image = SvgGeneratorWebView.svgToImage(svg, 64, 64);

// Save to PNG file
Path outputPath = Paths.get("output.png");
SvgGeneratorWebView.svgToPngFile(svg, outputPath, 64, 64);
```

### Game Asset Generation

```java
// Generate predefined game assets
BufferedImage treeImage = SvgGeneratorWebView.generateTreeImage(64);
BufferedImage rockImage = SvgGeneratorWebView.generateRockImage(64);
BufferedImage grassImage = SvgGeneratorWebView.generateGrassImage(64);
```

### Security (Player Content)

```java
// Sanitize user-provided SVG content
String playerSvg = "<svg><script>alert('malicious')</script><circle/></svg>";
String sanitized = SvgGeneratorWebView.sanitizeSvg(playerSvg);
BufferedImage safeImage = SvgGeneratorWebView.svgToImage(sanitized, 64, 64);
```

## API Reference

### SvgGeneratorWebView

#### Core Methods

- `svgToImage(String svgContent, int width, int height)` - Render SVG to BufferedImage
- `svgToPngFile(String svgContent, Path outputPath, int width, int height)` - Save SVG as PNG
- `sanitizeSvg(String svgContent)` - Remove potentially malicious content

#### Asset Generation

- `generateTreeImage(int size)` - Generate tree asset
- `generateRockImage(int size)` - Generate rock asset  
- `generateGrassImage(int size)` - Generate grass asset

#### Utilities

- `imageToBytes(BufferedImage image)` - Convert image to byte array
- `bytesToImage(byte[] bytes)` - Convert byte array to image

### SvgGenerator (Fallback)

#### Core Methods

- `svgToImage(String svg, int size)` - Render SVG to BufferedImage
- `generateTreeImage(int size)` - Generate tree asset
- `generateRockImage(int size)` - Generate rock asset
- `generateGrassImage(int size)` - Generate grass asset

## Threading Considerations

### JavaFX Application Thread

The WebView implementation must run on the JavaFX application thread. The API handles this automatically:

```java
// This works regardless of current thread
BufferedImage image = SvgGeneratorWebView.svgToImage(svg, 64, 64);
```

### Performance

- **WebView**: Slower startup, full SVG support
- **Pure Java**: Fast startup, limited SVG support
- **Recommendation**: Use WebView for complex SVGs, pure Java for simple shapes

## Security Features

### SVG Sanitization

The sanitization process removes:

- `<script>` tags and content
- Event handlers (`onclick`, `onload`, etc.)
- JavaScript protocol URLs
- External resource references

### Best Practices

1. **Always sanitize** user-provided SVG content
2. **Limit file size** to prevent resource exhaustion
3. **Validate SVG structure** before rendering
4. **Use content security policies** in WebView

## Examples

### Complex SVG with Gradients

```java
String complexSvg = """
    <svg width="128" height="128" xmlns="http://www.w3.org/2000/svg">
        <defs>
            <linearGradient id="grad1" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" style="stop-color:#ff6b6b;stop-opacity:1" />
                <stop offset="100%" style="stop-color:#ee5a24;stop-opacity:1" />
            </linearGradient>
        </defs>
        <ellipse cx="64" cy="64" rx="40" ry="32" fill="url(#grad1)"/>
    </svg>
    """;

BufferedImage image = SvgGeneratorWebView.svgToImage(complexSvg, 128, 128);
```

### Player Avatar Generation

```java
public class PlayerAvatarGenerator {
    public static BufferedImage generateAvatar(String playerName, String color) {
        String avatarSvg = String.format("""
            <svg width="64" height="64" xmlns="http://www.w3.org/2000/svg">
                <circle cx="32" cy="32" r="24" fill="%s" stroke="black" stroke-width="2"/>
                <text x="32" y="38" text-anchor="middle" fill="white" font-size="12" font-weight="bold">%s</text>
            </svg>
            """, color, playerName.substring(0, 1).toUpperCase());
        
        try {
            return SvgGeneratorWebView.svgToImage(avatarSvg, 64, 64);
        } catch (Exception e) {
            // Fallback to simple shape
            return SvgGenerator.generateTreeImage(64);
        }
    }
}
```

## Testing

Run the demo to see examples:

```bash
cd javafx
./gradlew run -PmainClass=com.game.graphics.svg.SvgGeneratorDemo
```

Run tests:

```bash
cd javafx
./gradlew test --tests "com.game.graphics.svg.SvgGeneratorWebViewTest"
```

## Dependencies

### Required

- JavaFX Web module (`org.openjfx:javafx-web:21`)
- SLF4J for logging
- JUnit 5 for testing

### Optional

- No additional dependencies for basic functionality

## Troubleshooting

### Common Issues

1. **JavaFX not initialized**: Ensure JavaFX runtime is available
2. **Threading errors**: Use the provided API methods (they handle threading)
3. **Memory issues**: Limit SVG complexity and size
4. **Security warnings**: Always sanitize user content

### Performance Tips

1. **Cache rendered images** for frequently used assets
2. **Use appropriate image sizes** (don't render large images for small displays)
3. **Batch operations** when generating multiple assets
4. **Consider fallback** to pure Java implementation for simple shapes

## Future Enhancements

- [ ] Asset caching system
- [ ] Batch rendering capabilities
- [ ] More predefined game assets
- [ ] Player asset management system
- [ ] SVG editor integration
- [ ] Performance optimizations 