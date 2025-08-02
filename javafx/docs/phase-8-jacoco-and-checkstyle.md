# Phase 8: Comprehensive Testing and Code Quality Enforcement

## Overview

This phase implements a robust testing and code quality framework using JaCoCo for test coverage enforcement and Checkstyle for code conventions. This ensures the codebase maintains high quality standards and comprehensive test coverage.

## Objectives

1. **Test Coverage Enforcement**: Implement JaCoCo to enforce minimum test coverage requirements
2. **Code Quality Standards**: Implement Checkstyle to enforce consistent code conventions
3. **Automated Quality Gates**: Integrate quality checks into the build process
4. **Comprehensive Test Suite**: Expand test coverage to meet quality standards

## JaCoCo Test Coverage Configuration

### Build Configuration

```gradle
jacoco {
    toolVersion = "0.8.8"
}

def jacocoInclusions = [
    '**/com/game/**'
];

jacocoTestReport {
    dependsOn test
    reports {
        xml.required = true
        csv.required = false
        html.outputLocation = layout.buildDirectory.dir('jacocoHtml')
    }
    getExecutionData().setFrom(fileTree(buildDir).include('/jacoco/*.exec'));
    afterEvaluate {
        classDirectories.from = files(classDirectories.files.collect {
            fileTree(dir: it, include: jacocoInclusions)
        })
    }
}

jacocoTestCoverageVerification {
    dependsOn jacocoTestReport
    afterEvaluate {
        classDirectories.from = files(classDirectories.files.collect {
            fileTree(dir: it, include: jacocoInclusions)
        })
    }
    violationRules {
        rule {
            enabled = true
            failOnViolation = true
            limit {
                counter = 'LINE'
                value = 'COVEREDRATIO'
                minimum = 0.90  // 90% line coverage
            }
        }
        rule {
            enabled = true
            failOnViolation = true
            limit {
                counter = 'BRANCH'
                value = 'COVEREDRATIO'
                minimum = 0.85  // 85% branch coverage
            }
        }
        rule {
            enabled = true
            failOnViolation = true
            limit {
                counter = 'METHOD'
                value = 'COVEREDRATIO'
                minimum = 0.95  // 95% method coverage
            }
        }
    }
}
```

### Coverage Requirements

- **Line Coverage**: Minimum 90%
- **Branch Coverage**: Minimum 85%
- **Method Coverage**: Minimum 95%
- **Class Coverage**: Minimum 90%

### Exclusions

- Generated code
- Main application entry points
- Configuration classes
- Exception classes (if they only contain constructors)

## Checkstyle Code Conventions

### Build Configuration

```gradle
checkstyle {
    configFile = project(':').file('config/checkstyle/checkstyle.xml')
    configProperties = ["suppressionFile": project(':').file('config/checkstyle/suppressions.xml')]
}

tasks.withType(Checkstyle) {
    reports {
        xml.required = false
        html.required = true
    }
    dependsOn(tasks.compileJava)
    dependsOn(tasks.jacocoTestCoverageVerification)
}
```

### Checkstyle Configuration

Create `config/checkstyle/checkstyle.xml` with the following rules:

#### Naming Conventions
- Class names: PascalCase
- Method names: camelCase
- Variable names: camelCase
- Constants: UPPER_SNAKE_CASE
- Package names: lowercase

#### Code Style
- Indentation: 4 spaces (no tabs)
- Line length: Maximum 120 characters
- Braces: K&R style (opening brace on same line)
- Import organization: Alphabetical order
- No unused imports

#### Documentation
- Public classes must have JavaDoc
- Public methods must have JavaDoc
- Package-level documentation

#### Code Quality
- No magic numbers (use constants)
- No empty catch blocks
- Proper exception handling
- No redundant modifiers

### Suppressions File

Create `config/checkstyle/suppressions.xml` for legitimate exceptions:

```xml
<?xml version="1.0"?>
<!DOCTYPE suppressions PUBLIC
    "-//Checkstyle//DTD SuppressionFilter Configuration 1.2//EN"
    "https://checkstyle.org/dtds/suppressions_1_2.dtd">

<suppressions>
    <!-- Suppress specific rules for generated code -->
    <suppress checks=".*" files=".*Generated.*"/>
    
    <!-- Suppress specific rules for test files if needed -->
    <suppress checks="MagicNumber" files=".*Test\.java"/>
</suppressions>
```

## Test Suite Expansion

### Testing Strategy Overview

The testing approach will use multiple complementary techniques:

1. **GameLogger Integration Testing**: Use GameLogger as a testing hook to capture execution traces
2. **Mockito for Mocking**: Mock external dependencies and verify interactions
3. **WireMock for HTTP Testing**: Mock external HTTP services when needed
4. **TestContainers for Integration**: Containerized testing for database and external services
5. **Asynchronous Testing**: CountDownLatch and CompletableFuture patterns for testing concurrent operations

### GameLogger as Testing Hook

The GameLogger system provides a powerful way to test complex operations by capturing execution traces:

```java
@Test
void testWorldGenerationWithLogging() {
    // Arrange
    GameLogger testLogger = new GameLogger(() -> true); // Always enable debug
    World world = new World(testLogger, worldConfig);
    
    // Act
    world.generateChunk(0, 0);
    
    // Assert
    List<LogEntry> logs = testLogger.getLogs();
    assertThat(logs).anyMatch(log -> 
        log.message().contains("Chunk generated") && 
        log.level() == LogLevel.INFO
    );
    assertThat(logs).anyMatch(log -> 
        log.message().contains("Entities created") && 
        log.level() == LogLevel.DEBUG
    );
}
```

**Benefits of GameLogger Testing:**
- Captures execution flow without modifying production code
- Verifies complex multi-step operations
- Tests debug vs info logging behavior
- Provides execution context for debugging test failures

### Unit Tests

#### Core Game Logic
- [ ] World generation and chunk management (with GameLogger verification)
- [ ] Player movement and collision detection
- [ ] Entity interaction and harvesting
- [ ] Camera system and coordinate transformations
- [ ] Input handling and key bindings
- [ ] World coordinate wrapping and chunk calculations

#### Rendering System
- [ ] Canvas rendering and graphics context
- [ ] Entity rendering and positioning
- [ ] Background rendering and rotation
- [ ] Grid highlighting system
- [ ] UI element rendering
- [ ] Log window rendering and interaction

#### Asset Management
- [ ] Asset loading and caching
- [ ] SVG generation and image conversion
- [ ] File system operations
- [ ] Memory management
- [ ] Image generation testing (SVG to BufferedImage conversion)

#### Persistence System
- [ ] Database operations
- [ ] World state persistence
- [ ] Entity state management
- [ ] Change tracking

### Integration Tests

- [ ] Game initialization and startup
- [ ] Asset loading workflow
- [ ] Player movement and world interaction
- [ ] Camera system integration
- [ ] UI system integration
- [ ] Log window integration with game engine

### Performance Tests

- [ ] Rendering performance under load
- [ ] Memory usage during extended gameplay
- [ ] Asset loading performance
- [ ] Database operation performance

### Image Generation Testing

Testing SVG to image conversion and image generation requires special considerations:

#### Memory-Based Image Testing

```java
@Test
void testSvgToImageConversion() {
    // Arrange
    String testSvg = "<svg width=\"32\" height=\"32\"><circle cx=\"16\" cy=\"16\" r=\"8\" fill=\"red\"/></svg>";
    
    // Act
    BufferedImage image = SvgGenerator.svgToImage(testSvg, 32, 32);
    
    // Assert
    assertNotNull(image);
    assertEquals(32, image.getWidth());
    assertEquals(32, image.getHeight());
    
    // Test pixel color at center (should be red)
    int centerPixel = image.getRGB(16, 16);
    Color centerColor = new Color(centerPixel, true);
    assertEquals(255, centerColor.getRed());
    assertEquals(0, centerColor.getGreen());
    assertEquals(0, centerColor.getBlue());
}
```

#### MD5 Hash and Dimension Testing

```java
@Test
void testTreeImageGeneration() throws IOException {
    // Arrange
    EntityConfig.TreeConfig treeConfig = new EntityConfig.TreeConfig();
    treeConfig.foliageRadius = 16;
    treeConfig.imageHeight = 48;
    treeConfig.trunkWidth = 4;
    treeConfig.foliageColor = "#228B22";
    treeConfig.trunkColor = "#8B4513";
    treeConfig.opacity = 1.0;
    
    // Act
    String treeSvg = SvgGenerator.generateTreeSVG(treeConfig);
    BufferedImage generatedImage = SvgGenerator.svgToImage(treeSvg, 32, 48);
    
    // Assert
    assertEquals(32, generatedImage.getWidth());
    assertEquals(48, generatedImage.getHeight());
    
    // Convert to bytes and calculate MD5 hash
    byte[] imageBytes = SvgGenerator.imageToBytes(generatedImage);
    String actualHash = calculateMD5Hash(imageBytes);
    
    // Expected values determined from ~/.web-game/assets/ analysis
    String expectedHash = "a1b2c3d4e5f678901234567890123456"; // Replace with actual hash
    assertEquals(expectedHash, actualHash, "Generated tree image hash doesn't match expected");
}

@Test
void testRockImageGeneration() throws IOException {
    // Arrange
    EntityConfig.RockConfig rockConfig = new EntityConfig.RockConfig();
    rockConfig.size = 32;
    rockConfig.baseColor = "#696969";
    rockConfig.strokeColor = "#404040";
    rockConfig.strokeWidth = 2;
    rockConfig.textureColor = "#808080";
    rockConfig.textureSpots = 5;
    rockConfig.opacity = 1.0;
    
    // Act
    String rockSvg = SvgGenerator.generateRockSVG(rockConfig);
    BufferedImage generatedImage = SvgGenerator.svgToImage(rockSvg, 32, 32);
    
    // Assert
    assertEquals(32, generatedImage.getWidth());
    assertEquals(32, generatedImage.getHeight());
    
    byte[] imageBytes = SvgGenerator.imageToBytes(generatedImage);
    String actualHash = calculateMD5Hash(imageBytes);
    
    // Expected values determined from ~/.web-game/assets/ analysis
    String expectedHash = "f1e2d3c4b5a678901234567890123456"; // Replace with actual hash
    assertEquals(expectedHash, actualHash, "Generated rock image hash doesn't match expected");
}

@Test
void testGrassImageGeneration() throws IOException {
    // Arrange
    EntityConfig.GrassConfig grassConfig = new EntityConfig.GrassConfig();
    grassConfig.size = 32;
    grassConfig.bladeColor = "#228B22";
    grassConfig.bladeWidth = 1.0;
    grassConfig.bladeLength = 8;
    grassConfig.bladeAngleVariation = 30;
    grassConfig.clusterCount = 3;
    grassConfig.bladeCount = 4;
    grassConfig.opacity = 1.0;
    
    // Act
    String grassSvg = SvgGenerator.generateGrassSVG(grassConfig);
    BufferedImage generatedImage = SvgGenerator.svgToImage(grassSvg, 32, 32);
    
    // Assert
    assertEquals(32, generatedImage.getWidth());
    assertEquals(32, generatedImage.getHeight());
    
    byte[] imageBytes = SvgGenerator.imageToBytes(generatedImage);
    String actualHash = calculateMD5Hash(imageBytes);
    
    // Expected values determined from ~/.web-game/assets/ analysis
    String expectedHash = "c1d2e3f4a5b678901234567890123456"; // Replace with actual hash
    assertEquals(expectedHash, actualHash, "Generated grass image hash doesn't match expected");
}

private String calculateMD5Hash(byte[] data) throws IOException {
    try {
        java.security.MessageDigest md = java.security.MessageDigest.getInstance("MD5");
        byte[] hashBytes = md.digest(data);
        StringBuilder sb = new StringBuilder();
        for (byte b : hashBytes) {
            sb.append(String.format("%02x", b));
        }
        return sb.toString();
    } catch (java.security.NoSuchAlgorithmException e) {
        throw new IOException("MD5 algorithm not available", e);
    }
}
```

#### Image Comparison Testing (Alternative approach)

```java
@Test
void testGeneratedImageMatchesExpected() throws IOException {
    // Arrange
    String treeSvg = SvgGenerator.generateTreeSVG(treeConfig);
    
    // Act
    BufferedImage generatedImage = SvgGenerator.svgToImage(treeSvg, 64, 64);
    
    // Assert - Compare with expected image (stored as test resource)
    BufferedImage expectedImage = ImageIO.read(getClass().getResourceAsStream("/test-images/expected-tree.png"));
    assertImagesEqual(generatedImage, expectedImage);
}

private void assertImagesEqual(BufferedImage actual, BufferedImage expected) {
    assertEquals(expected.getWidth(), actual.getWidth());
    assertEquals(expected.getHeight(), actual.getHeight());
    
    for (int x = 0; x < actual.getWidth(); x++) {
        for (int y = 0; y < actual.getHeight(); y++) {
            assertEquals(expected.getRGB(x, y), actual.getRGB(x, y), 
                "Pixel mismatch at (" + x + "," + y + ")");
        }
    }
}
```

#### Temporary File Testing (if needed)

```java
@Test
void testImageGenerationToTempFile() throws IOException {
    // Arrange
    String testSvg = SvgGenerator.generateTreeSVG(treeConfig);
    Path tempFile = Files.createTempFile("test-image", ".png");
    
    try {
        // Act
        BufferedImage image = SvgGenerator.svgToImage(testSvg, 64, 64);
        ImageIO.write(image, "PNG", tempFile.toFile());
        
        // Assert
        assertTrue(Files.exists(tempFile));
        assertTrue(Files.size(tempFile) > 0);
        
        // Verify we can read it back
        BufferedImage readImage = ImageIO.read(tempFile.toFile());
        assertNotNull(readImage);
        assertEquals(64, readImage.getWidth());
        assertEquals(64, readImage.getHeight());
        
    } finally {
        // Clean up - ALWAYS clean up temp files
        Files.deleteIfExists(tempFile);
    }
}
```

#### Image Generation Testing Guidelines

**IMPORTANT: Image Testing Requirements**

1. **Memory-First Approach**: Always prefer in-memory testing using BufferedImage objects
2. **No Repository Writes**: Generated test images must NOT be written to the repository
3. **Temporary Files**: If file I/O is needed, use temporary files that are automatically cleaned up
4. **Git Ignore**: If any images must be written to the repo, add `*.png` to `.gitignore`
5. **Resource-Based Testing**: Store expected test images as test resources, not generated files

**Testing Strategy:**
- Test SVG parsing and conversion accuracy
- Test image dimensions and pixel data
- Test color and opacity handling
- Test rotation and transformation
- Test fallback behavior for invalid SVG
- Test memory usage and performance

**Example Test Structure:**
```java
@ExtendWith(TempDir.class)
class SvgGeneratorTest {
    
    @Test
    void testTreeGeneration(@TempDir Path tempDir) {
        // Use tempDir for any file operations
        // Always clean up in finally block
    }
    
    @Test
    void testImageConversionInMemory() {
        // Prefer this approach - no file I/O
    }
}
```

#### One-Time Process: Determining Expected Hash Values

**Step 1: Analyze Existing Assets**
```bash
# Navigate to the assets directory
cd ~/.web-game/assets/

# List all PNG files
find . -name "*.png" -type f

# Calculate MD5 hashes for existing images
for file in $(find . -name "*.png" -type f); do
    echo "File: $file"
    echo "Size: $(stat -c%s "$file") bytes"
    echo "Dimensions: $(identify -format "%wx%h" "$file" 2>/dev/null || echo "unknown")"
    echo "MD5: $(md5sum "$file" | cut -d' ' -f1)"
    echo "---"
done
```

**Step 2: Generate Test Images with Current Implementation**
```java
@Test
void generateExpectedHashes() throws IOException {
    // This test is run ONCE to determine expected values
    // Remove or comment out after getting the expected hashes
    
    // Tree
    EntityConfig.TreeConfig treeConfig = createTreeConfig();
    String treeSvg = SvgGenerator.generateTreeSVG(treeConfig);
    BufferedImage treeImage = SvgGenerator.svgToImage(treeSvg, 32, 48);
    byte[] treeBytes = SvgGenerator.imageToBytes(treeImage);
    String treeHash = calculateMD5Hash(treeBytes);
    System.out.println("Tree - Size: " + treeImage.getWidth() + "x" + treeImage.getHeight() + 
                      ", Hash: " + treeHash);
    
    // Rock
    EntityConfig.RockConfig rockConfig = createRockConfig();
    String rockSvg = SvgGenerator.generateRockSVG(rockConfig);
    BufferedImage rockImage = SvgGenerator.svgToImage(rockSvg, 32, 32);
    byte[] rockBytes = SvgGenerator.imageToBytes(rockImage);
    String rockHash = calculateMD5Hash(rockBytes);
    System.out.println("Rock - Size: " + rockImage.getWidth() + "x" + rockImage.getHeight() + 
                      ", Hash: " + rockHash);
    
    // Grass
    EntityConfig.GrassConfig grassConfig = createGrassConfig();
    String grassSvg = SvgGenerator.generateGrassSVG(grassConfig);
    BufferedImage grassImage = SvgGenerator.svgToImage(grassSvg, 32, 32);
    byte[] grassBytes = SvgGenerator.imageToBytes(grassImage);
    String grassHash = calculateMD5Hash(grassBytes);
    System.out.println("Grass - Size: " + grassImage.getWidth() + "x" + grassImage.getHeight() + 
                      ", Hash: " + grassHash);
}
```

**Step 3: Update Test Constants**
```java
public class SvgGeneratorTest {
    // Expected values determined from ~/.web-game/assets/ analysis
    private static final String EXPECTED_TREE_HASH = "actual_hash_from_analysis";
    private static final String EXPECTED_ROCK_HASH = "actual_hash_from_analysis";
    private static final String EXPECTED_GRASS_HASH = "actual_hash_from_analysis";
    
    private static final int EXPECTED_TREE_WIDTH = 32;
    private static final int EXPECTED_TREE_HEIGHT = 48;
    private static final int EXPECTED_ROCK_SIZE = 32;
    private static final int EXPECTED_GRASS_SIZE = 32;
}
```

**Step 4: Remove or Comment Out the Hash Generation Test**
- After determining the expected values, remove or comment out the `generateExpectedHashes()` test
- This prevents the test from running in the regular test suite
- The expected values are now hardcoded constants in the test class

### Asynchronous and Concurrent Testing

For testing asynchronous operations, parallel processing, and concurrent game systems:

#### CountDownLatch Pattern for Async Testing

```java
@Test
void testAsyncAssetLoading() throws InterruptedException {
    // Arrange
    CountDownLatch loadLatch = new CountDownLatch(3);
    AtomicInteger loadedCount = new AtomicInteger(0);
    Map<String, Asset> loadedAssets = new ConcurrentHashMap<>();
    
    // Act
    assetManager.loadAssetAsync("texture1.png", asset -> {
        loadedAssets.put("texture1.png", asset);
        loadedCount.incrementAndGet();
        loadLatch.countDown();
    });
    
    assetManager.loadAssetAsync("texture2.png", asset -> {
        loadedAssets.put("texture2.png", asset);
        loadedCount.incrementAndGet();
        loadLatch.countDown();
    });
    
    assetManager.loadAssetAsync("sound.wav", asset -> {
        loadedAssets.put("sound.wav", asset);
        loadedCount.incrementAndGet();
        loadLatch.countDown();
    });
    
    // Assert
    boolean completed = loadLatch.await(5, TimeUnit.SECONDS);
    assertTrue(completed, "Asset loading should complete within timeout");
    assertEquals(3, loadedCount.get());
    assertEquals(3, loadedAssets.size());
}
```

#### CompletableFuture Testing Pattern

```java
@Test
void testWorldGenerationWithCompletableFuture() {
    // Arrange
    CompletableFuture<Chunk> chunkFuture = new CompletableFuture<>();
    GameLogger testLogger = new GameLogger(() -> true);
    
    // Act
    world.generateChunkAsync(0, 0)
        .thenAccept(chunk -> {
            testLogger.info(() -> "Chunk generation completed: " + chunk.getChunkX() + "," + chunk.getChunkY());
            chunkFuture.complete(chunk);
        })
        .exceptionally(throwable -> {
            testLogger.error(() -> "Chunk generation failed: " + throwable.getMessage());
            chunkFuture.completeExceptionally(throwable);
            return null;
        });
    
    // Assert
    Chunk chunk = chunkFuture.join();
    assertNotNull(chunk);
    assertEquals(0, chunk.getChunkX());
    assertEquals(0, chunk.getChunkY());
    
    List<LogEntry> logs = testLogger.getLogs();
    assertThat(logs).anyMatch(log -> 
        log.message().contains("Chunk generation completed") && 
        log.level() == LogLevel.INFO
    );
}
```

#### Virtual Thread Testing Considerations

With Java 21+ Virtual Threads, some patterns may need adjustment:

```java
@Test
void testVirtualThreadCompatibility() {
    // Arrange
    CountDownLatch latch = new CountDownLatch(1);
    AtomicReference<String> result = new AtomicReference<>();
    
    // Act - Using virtual threads
    Thread.startVirtualThread(() -> {
        try {
            String gameState = gameEngine.getGameStateJson();
            result.set(gameState);
            latch.countDown();
        } catch (Exception e) {
            latch.countDown();
        }
    });
    
    // Assert
    assertTrue(latch.await(1, TimeUnit.SECONDS));
    assertNotNull(result.get());
    assertTrue(result.get().contains("player"));
}
```

### Advanced Testing Patterns

#### Channel Handler Testing (for future networking)

```java
public static class GameMessageHandler extends SimpleChannelInboundHandler<Object> {
    private final CountDownLatch messageLatch;
    private final Map<Integer, Object> messageMap;
    private final AtomicInteger messageCount = new AtomicInteger(0);
    private final Consumer<String> debugLogger;
    
    public GameMessageHandler(CountDownLatch latch, Map<Integer, Object> messageMap, Consumer<String> debug) {
        this.messageLatch = latch;
        this.messageMap = messageMap;
        this.debugLogger = debug;
    }
    
    @Override
    public void channelRead0(ChannelHandlerContext ctx, Object msg) throws Exception {
        synchronized (messageLatch) {
            int count = messageCount.incrementAndGet();
            debugLogger.accept(count + ": " + msg.toString());
            messageMap.put(count, msg);
            messageLatch.countDown();
        }
    }
}
```

#### Timeout and Failure Testing

```java
@Test
void testTimeoutHandling() throws InterruptedException {
    // Arrange
    CountDownLatch latch = new CountDownLatch(1);
    
    // Act - Simulate slow operation
    CompletableFuture.runAsync(() -> {
        try {
            Thread.sleep(2000); // Simulate slow operation
            latch.countDown();
        } catch (InterruptedException e) {
            Thread.currentThread().interrupt();
        }
    });
    
    // Assert - Expect timeout
    boolean timedOut = !latch.await(500, TimeUnit.MILLISECONDS);
    assertTrue(timedOut, "Operation should timeout");
}
```

### Testing Framework Integration

#### JUnit 5 Extensions

```java
@ExtendWith(GameLoggerExtension.class)
class GameEngineTest {
    
    @Test
    void testWithGameLogger(@InjectGameLogger GameLogger logger) {
        // Test implementation with injected logger
        gameEngine.start();
        
        List<LogEntry> logs = logger.getLogs();
        assertThat(logs).anyMatch(log -> 
            log.message().contains("Game engine started")
        );
    }
}
```

#### Test Configuration

```java
@TestConfiguration
class GameTestConfig {
    
    @Bean
    public GameLogger testGameLogger() {
        return new GameLogger(() -> true); // Always enable debug for tests
    }
    
    @Bean
    public DatabaseManager testDatabaseManager() {
        // Use in-memory database for tests
        return new TestDatabaseManager();
    }
}
```

### Real-World Testing Examples

#### Abstract Test Base Class for Async Operations

```java
public abstract class AbstractTest {

    private static final Logger logger = LoggerFactory.getLogger(AbstractTest.class);

    public void sendMessage(Channel channel, byte[] messageBytes, int writeTimeout) throws InterruptedException {
        sendMessage(channel, Unpooled.wrappedBuffer(messageBytes), writeTimeout);
    }

    public void sendMessage(Channel channel, Object message, int writeTimeout) throws InterruptedException {
        boolean writeWasSuccessful = channel
                .writeAndFlush(message)
                .await(writeTimeout, TimeUnit.MILLISECONDS);

        if (!writeWasSuccessful) {
            throw new RuntimeException("Client took too long to write to channel!");
        }
    }

    protected void sendMessage(Channel channel, String message) throws InterruptedException {
        sendMessage(channel, message, 1000);
    }

    protected void sendMessage(Channel channel, String message, int timeoutMillis) throws InterruptedException {
        if (!channel.writeAndFlush(new TextWebSocketFrame(message)).await(timeoutMillis)) {
            fail("sending message took too long: " + message);
        }
    }

    protected void awaitReply(CountDownLatch latch) throws InterruptedException {
        awaitReply(latch, 1000);
    }

    protected void awaitReply(CountDownLatch latch, int timeoutMillis) throws InterruptedException {
        awaitReply(latch, timeoutMillis, false);
    }

    protected void awaitReply(CountDownLatch latch, int timeoutMillis, boolean expectTimeout) throws InterruptedException {
        boolean timeout = !latch.await(timeoutMillis, TimeUnit.MILLISECONDS);
        if (timeout && !expectTimeout) {
            fail("waiting for response took too long");
        } else if (!timeout && expectTimeout) {
            fail("timeout was expected");
        }
    }

    public static class CountDownLatchChannelHandler extends SimpleChannelInboundHandler<Object> {

        private final CountDownLatch latch;
        private final AtomicInteger responseCount = new AtomicInteger(0);
        private final Map<Integer, Object> responseMap;
        private final Consumer<String> debug;

        public CountDownLatchChannelHandler(CountDownLatch latch, Map<Integer, Object> responseMap, Consumer<String> debug) {
            this.latch = latch;
            this.responseMap = responseMap;
            this.debug = debug;
        }

        @Override
        public void channelRead0(ChannelHandlerContext ctx, Object msg) throws Exception {
            if (msg instanceof TextWebSocketFrame frame) {
                synchronized (latch) {
                    int count = responseCount.incrementAndGet();
                    debug.accept(count + ": " + frame.copy().text());
                    responseMap.put(count, frame.copy());
                    latch.countDown();
                }
            } else if (msg instanceof DatagramPacket datagramPacket) {
                synchronized (latch) {
                    int count = responseCount.incrementAndGet();
                    debug.accept(count + ": " + SockiopathServer.byteBufferToString(datagramPacket.copy().content().nioBuffer()));
                    responseMap.put(count, datagramPacket.copy());
                    latch.countDown();
                }
            } else {
                throw new RuntimeException("Unexpected message received!");
            }
        }

        @Override
        public void exceptionCaught(ChannelHandlerContext ctx, Throwable cause) {
            cause.printStackTrace();
            ctx.close();
        }
    }
}
```

#### WebSocket Integration Test Example

```java
@QuarkusTest
class WebSocketServerVerticalTest extends AbstractTest {

    @Inject
    WebSocketServerVertical webSocketServerVertical;

    @Test
    public void webSocketSessionTest() throws Exception {

        int test1Count = 2;
        CountDownLatch latch1 = new CountDownLatch(test1Count);
        Map<Integer, Object> responseMap1 = new HashMap<>();
        BootstrappedWebSocketClient client1 = getClient(latch1, responseMap1);
        client1.startup();

        sendMessage(client1.getChannel(), "join");
        Thread.sleep(2L);
        sendMessage(client1.getChannel(), "test", 50);
        awaitReply(latch1);

        TextWebSocketFrame textWebSocketFrame1_1 = (TextWebSocketFrame) responseMap1.get(1);
        assertTrue(textWebSocketFrame1_1.text().startsWith("session|"));

        TextWebSocketFrame textWebSocketFrame1_2 = (TextWebSocketFrame) responseMap1.get(2);
        assertEquals("test", textWebSocketFrame1_2.text());

        Thread.sleep(2L);

        int test2Count = 3;
        CountDownLatch latch2 = new CountDownLatch(test2Count);
        Map<Integer, Object> responseMap2 = new HashMap<>();
        BootstrappedWebSocketClient client2 = getClient(latch2, responseMap2);
        client2.startup();

        sendMessage(client2.getChannel(), "join");
        Thread.sleep(2L);
        sendMessage(client2.getChannel(), "test", 50);

        Thread.sleep(2L);
        sendMessage(client1.getChannel(), "Hi there", 50);
        Thread.sleep(2L);

        awaitReply(latch2);

        TextWebSocketFrame textWebSocketFrame2_1 = (TextWebSocketFrame) responseMap2.get(1);
        assertTrue(textWebSocketFrame2_1.text().startsWith("session|"));

        TextWebSocketFrame textWebSocketFrame2_2 = (TextWebSocketFrame) responseMap2.get(2);
        assertEquals("test", textWebSocketFrame2_2.text());

        TextWebSocketFrame textWebSocketFrame2_3 = (TextWebSocketFrame) responseMap2.get(3);
        assertThat(textWebSocketFrame2_3.text(), StringContainsInOrder.stringContainsInOrder("Hi there"));
    }

    private BootstrappedWebSocketClient getClient(CountDownLatch latch, Map<Integer, Object> responseMap) {
        return new BootstrappedWebSocketClient(
                "localhost",
                webSocketServerVertical.actualPort(),
                "/websocket",
                new CountDownLatchChannelHandler(latch, responseMap, (message) -> {
                }),
                null,
                500,
                500
        );
    }
}
```

#### Key Patterns from Real-World Testing

**CountDownLatch Pattern Benefits:**
- Synchronizes multiple async operations
- Provides timeout handling
- Captures multiple responses in order
- Thread-safe response collection

**Channel Handler Testing:**
- Captures network messages for verification
- Handles different message types (WebSocket, UDP)
- Provides debugging output
- Synchronizes message processing

**Multi-Client Testing:**
- Tests concurrent client interactions
- Verifies message broadcasting
- Tests session management
- Validates state consistency

**Timeout and Failure Testing:**
- Tests expected timeouts
- Verifies error handling
- Tests graceful degradation
- Validates recovery mechanisms

## Build Integration

### Quality Gates

```gradle
// Ensure quality checks run before build
build.dependsOn jacocoTestCoverageVerification
build.dependsOn checkstyleMain
build.dependsOn checkstyleTest

// Fail build on quality violations
jacocoTestCoverageVerification.finalizedBy {
    if (jacocoTestCoverageVerification.state.failure != null) {
        throw new GradleException("Test coverage requirements not met")
    }
}

checkstyleMain.finalizedBy {
    if (checkstyleMain.state.failure != null) {
        throw new GradleException("Checkstyle violations found")
    }
}
```

### CI/CD Integration

- Run quality checks on every commit
- Generate and publish coverage reports
- Block merges on quality violations
- Track quality metrics over time

## Implementation Tasks

### Task 1: JaCoCo Setup
- [ ] Add JaCoCo plugin to build.gradle
- [ ] Configure coverage rules and thresholds
- [ ] Set up coverage reporting
- [ ] Test coverage enforcement

### Task 2: Checkstyle Setup
- [ ] Add Checkstyle plugin to build.gradle
- [ ] Create checkstyle configuration file
- [ ] Create suppressions file
- [ ] Test style enforcement

### Task 3: GameLogger Integration Testing
- [ ] Add GameLogger to classes that need testing hooks
- [ ] Create test utilities for GameLogger verification
- [ ] Write tests using GameLogger.getLogs() for assertions
- [ ] Document GameLogger testing patterns

### Task 4: Async Testing Framework
- [ ] Create AbstractTest base class with CountDownLatch patterns
- [ ] Implement timeout and failure testing utilities
- [ ] Create CompletableFuture testing helpers
- [ ] Add Virtual Thread compatibility testing

### Task 5: Mockito and External Testing
- [ ] Add Mockito dependency and configuration
- [ ] Create mock examples for external dependencies
- [ ] Set up WireMock for HTTP service testing (if needed)
- [ ] Configure TestContainers for database testing

### Task 6: Test Suite Expansion
- [ ] Identify gaps in current test coverage
- [ ] Write unit tests for core game logic with GameLogger
- [ ] Write integration tests for system interactions
- [ ] Write performance tests for critical paths
- [ ] Write async tests for concurrent operations
- [ ] Write image generation tests (SvgGenerator) with memory-based testing
- [ ] Add `*.png` to `.gitignore` if any image files are needed in repo

### Task 7: Build Integration
- [ ] Integrate quality checks into build process
- [ ] Configure quality gates
- [ ] Set up CI/CD integration
- [ ] Test build failure conditions

### Task 8: Documentation
- [ ] Document testing standards and patterns
- [ ] Create code style guide
- [ ] Document quality enforcement process
- [ ] Create troubleshooting guide
- [ ] Document async testing patterns

## Success Criteria

1. **Test Coverage**: All modules meet minimum coverage requirements
2. **Code Quality**: All code passes Checkstyle validation
3. **GameLogger Testing**: Core classes use GameLogger for testable execution traces
4. **Async Testing**: Comprehensive testing of concurrent and asynchronous operations
5. **Mocking Strategy**: External dependencies properly mocked with Mockito
6. **Build Integration**: Quality checks are enforced in build process
7. **Documentation**: Comprehensive testing and style documentation
8. **Automation**: CI/CD integration with quality gates

## Dependencies

- Phase 7: Rendering Fixes (completed)
- Clean, well-structured codebase
- Existing test framework

## Deliverables

- JaCoCo configuration with coverage enforcement
- Checkstyle configuration with style enforcement
- Comprehensive test suite meeting coverage requirements
- Build integration with quality gates
- Documentation and style guides
- CI/CD integration

## Notes

This phase establishes the foundation for maintaining high code quality and comprehensive test coverage throughout the project's lifecycle. The quality enforcement system will help prevent regressions and ensure consistent code standards as the project grows. 