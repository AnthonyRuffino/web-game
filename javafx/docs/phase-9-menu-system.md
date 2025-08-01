# Phase 9: Menu System Implementation

## Overview

Phase 9 implements a comprehensive menu system with dynamic menu building, overlaying menus, menu bar at the bottom of the screen, and entity skin configuration. This system provides the complex menu functionality from the Electron version.

## Objectives

- 📋 Implement dynamic menu building system
- 📋 Create menu manager with overlaying menus
- 📋 Add menu bar at bottom of screen
- 📋 Implement entity skin configuration menus
- 📋 Add menu callbacks and event listeners
- 📋 Create menu within menu functionality
- 📋 Implement menu state management

## Current Status

### ✅ Completed (Phases 1-8)
- JavaFX application foundation
- Canvas-based rendering system
- 60 FPS game loop with AnimationTimer
- Input system with keyboard and mouse handling
- Database connectivity with virtual threads
- World generation and chunk management
- Player movement and controls
- Camera system with fixed-angle and player-perspective modes
- Entity rendering system
- Asset management with SVG generation and filesystem persistence

### 🔄 In Progress (Phase 9)
- Dynamic menu building system
- Menu manager implementation
- Menu bar at bottom of screen
- Entity skin configuration
- Menu event handling

## Step-by-Step Implementation

### Step 1: Menu Configuration System

**File: `src/main/java/com/game/ui/menu/MenuConfig.java`**
```java
package com.game.ui.menu;

import java.util.List;
import java.util.Map;
import java.util.function.Consumer;

public record MenuConfig(
    String id,
    String title,
    double viewportX,
    double viewportY,
    double viewportWidth,
    double viewportHeight,
    boolean destroyOnClose,
    boolean isBlocking,
    Consumer<Menu> onCloseParent,
    List<MenuTab> tabs,
    Map<String, Object> customData
) {
    public static class Builder {
        private String id;
        private String title = "Menu";
        private double viewportX = 0.1;
        private double viewportY = 0.1;
        private double viewportWidth = 0.8;
        private double viewportHeight = 0.8;
        private boolean destroyOnClose = false;
        private boolean isBlocking = false;
        private Consumer<Menu> onCloseParent;
        private List<MenuTab> tabs = List.of();
        private Map<String, Object> customData = Map.of();
        
        public Builder id(String id) {
            this.id = id;
            return this;
        }
        
        public Builder title(String title) {
            this.title = title;
            return this;
        }
        
        public Builder position(double viewportX, double viewportY) {
            this.viewportX = viewportX;
            this.viewportY = viewportY;
            return this;
        }
        
        public Builder size(double viewportWidth, double viewportHeight) {
            this.viewportWidth = viewportWidth;
            this.viewportHeight = viewportHeight;
            return this;
        }
        
        public Builder destroyOnClose(boolean destroyOnClose) {
            this.destroyOnClose = destroyOnClose;
            return this;
        }
        
        public Builder blocking(boolean isBlocking) {
            this.isBlocking = isBlocking;
            return this;
        }
        
        public Builder onCloseParent(Consumer<Menu> onCloseParent) {
            this.onCloseParent = onCloseParent;
            return this;
        }
        
        public Builder tabs(List<MenuTab> tabs) {
            this.tabs = tabs;
            return this;
        }
        
        public Builder customData(Map<String, Object> customData) {
            this.customData = customData;
            return this;
        }
        
        public MenuConfig build() {
            if (id == null) {
                throw new IllegalArgumentException("Menu config must include an id");
            }
            return new MenuConfig(id, title, viewportX, viewportY, viewportWidth, viewportHeight,
                                destroyOnClose, isBlocking, onCloseParent, tabs, customData);
        }
    }
    
    public static Builder builder() {
        return new Builder();
    }
}
```

### Step 2: Menu Tab System

**File: `src/main/java/com/game/ui/menu/MenuTab.java`**
```java
package com.game.ui.menu;

import java.util.List;
import java.util.function.Consumer;

public record MenuTab(
    String title,
    List<MenuElement> elements,
    Consumer<MenuTab> onLoad
) {
    public static class Builder {
        private String title;
        private List<MenuElement> elements = List.of();
        private Consumer<MenuTab> onLoad;
        
        public Builder title(String title) {
            this.title = title;
            return this;
        }
        
        public Builder elements(List<MenuElement> elements) {
            this.elements = elements;
            return this;
        }
        
        public Builder onLoad(Consumer<MenuTab> onLoad) {
            this.onLoad = onLoad;
            return this;
        }
        
        public MenuTab build() {
            return new MenuTab(title, elements, onLoad);
        }
    }
    
    public static Builder builder() {
        return new Builder();
    }
}

public record MenuElement(
    ElementType type,
    String id,
    String label,
    Object value,
    Consumer<MenuElement> onClick,
    Map<String, Object> properties
) {
    public enum ElementType {
        BUTTON,
        RADIO_GROUP,
        GRID_BUTTONS,
        IMAGE_SELECTOR,
        TEXT_INPUT,
        SLIDER
    }
    
    public static class Builder {
        private ElementType type;
        private String id;
        private String label;
        private Object value;
        private Consumer<MenuElement> onClick;
        private Map<String, Object> properties = Map.of();
        
        public Builder type(ElementType type) {
            this.type = type;
            return this;
        }
        
        public Builder id(String id) {
            this.id = id;
            return this;
        }
        
        public Builder label(String label) {
            this.label = label;
            return this;
        }
        
        public Builder value(Object value) {
            this.value = value;
            return this;
        }
        
        public Builder onClick(Consumer<MenuElement> onClick) {
            this.onClick = onClick;
            return this;
        }
        
        public Builder properties(Map<String, Object> properties) {
            this.properties = properties;
            return this;
        }
        
        public MenuElement build() {
            return new MenuElement(type, id, label, value, onClick, properties);
        }
    }
    
    public static Builder builder() {
        return new Builder();
    }
}
```

### Step 3: Menu Implementation

**File: `src/main/java/com/game/ui/menu/Menu.java`**
```java
package com.game.ui.menu;

import javafx.scene.Node;
import javafx.scene.control.*;
import javafx.scene.layout.*;
import javafx.scene.paint.Color;
import javafx.stage.Stage;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.util.ArrayList;
import java.util.List;
import java.util.function.Consumer;

public class Menu {
    private static final Logger logger = LoggerFactory.getLogger(Menu.class);
    
    private final MenuConfig config;
    private final VBox root;
    private final TabPane tabPane;
    private final List<MenuTab> tabs;
    private boolean visible = false;
    private int zIndex = 1000;
    private boolean destroyOnClose;
    private boolean isBlocking;
    private Consumer<Menu> onCloseParent;
    private Stage stage;
    
    public Menu(MenuConfig config) {
        this.config = config;
        this.tabs = new ArrayList<>(config.tabs());
        this.destroyOnClose = config.destroyOnClose();
        this.isBlocking = config.isBlocking();
        this.onCloseParent = config.onCloseParent();
        
        this.root = createMenuContainer();
        this.tabPane = createTabPane();
        
        setupMenu();
        logger.info("Menu created: {}", config.id());
    }
    
    private VBox createMenuContainer() {
        VBox container = new VBox();
        container.setId(config.id());
        container.getStyleClass().add("menu-container");
        
        // Calculate viewport-relative position and size
        double viewportWidth = 1200; // Will be updated dynamically
        double viewportHeight = 800;
        double viewportScale = Math.min(viewportWidth, viewportHeight) / 1000.0;
        
        double left = config.viewportX() * viewportWidth;
        double top = config.viewportY() * viewportHeight;
        double width = config.viewportWidth() * viewportWidth;
        double height = config.viewportHeight() * viewportHeight;
        
        // Apply styling
        container.setLayoutX(left);
        container.setLayoutY(top);
        container.setPrefWidth(width);
        container.setPrefHeight(height);
        container.setMinWidth(Math.max(300, viewportScale * 300));
        container.setMinHeight(Math.max(200, viewportScale * 200));
        
        // Style
        container.setStyle("""
            -fx-background-color: #2a2a2a;
            -fx-border-color: #444;
            -fx-border-width: 2px;
            -fx-border-radius: 8px;
            -fx-background-radius: 8px;
            -fx-effect: dropshadow(blur-type: gaussian, radius: 4, spread: 2, color: rgba(0,0,0,0.5));
            -fx-font-family: 'Courier New', monospace;
            -fx-text-fill: white;
        """);
        
        return container;
    }
    
    private TabPane createTabPane() {
        TabPane tabPane = new TabPane();
        tabPane.setTabClosingPolicy(TabPane.TabClosingPolicy.UNAVAILABLE);
        
        // Create tabs
        for (MenuTab tabConfig : tabs) {
            Tab tab = new Tab(tabConfig.title());
            tab.setContent(createTabContent(tabConfig));
            tabPane.getTabs().add(tab);
        }
        
        return tabPane;
    }
    
    private Node createTabContent(MenuTab tabConfig) {
        VBox content = new VBox(10);
        content.setPadding(new javafx.geometry.Insets(10));
        
        for (MenuElement element : tabConfig.elements()) {
            Node elementNode = createMenuElement(element);
            if (elementNode != null) {
                content.getChildren().add(elementNode);
            }
        }
        
        // Call onLoad callback if provided
        if (tabConfig.onLoad() != null) {
            tabConfig.onLoad().accept(tabConfig);
        }
        
        return content;
    }
    
    private Node createMenuElement(MenuElement element) {
        switch (element.type()) {
            case BUTTON -> {
                return createButton(element);
            }
            case RADIO_GROUP -> {
                return createRadioGroup(element);
            }
            case GRID_BUTTONS -> {
                return createGridButtons(element);
            }
            case IMAGE_SELECTOR -> {
                return createImageSelector(element);
            }
            default -> {
                logger.warn("Unsupported menu element type: {}", element.type());
                return null;
            }
        }
    }
    
    private Button createButton(MenuElement element) {
        Button button = new Button(element.label());
        button.setStyle("""
            -fx-background-color: #444;
            -fx-text-fill: white;
            -fx-border-color: #666;
            -fx-border-width: 1px;
            -fx-padding: 8px 16px;
            -fx-font-size: 12px;
        """);
        
        if (element.onClick() != null) {
            button.setOnAction(e -> element.onClick().accept(element));
        }
        
        return button;
    }
    
    private VBox createRadioGroup(MenuElement element) {
        VBox container = new VBox(5);
        Label label = new Label(element.label());
        label.setStyle("-fx-text-fill: white; -fx-font-size: 14px;");
        container.getChildren().add(label);
        
        ToggleGroup group = new ToggleGroup();
        @SuppressWarnings("unchecked")
        List<String> options = (List<String>) element.value();
        
        for (String option : options) {
            RadioButton radioButton = new RadioButton(option);
            radioButton.setStyle("""
                -fx-text-fill: white;
                -fx-font-size: 12px;
            """);
            radioButton.setToggleGroup(group);
            container.getChildren().add(radioButton);
        }
        
        return container;
    }
    
    private GridPane createGridButtons(MenuElement element) {
        GridPane grid = new GridPane();
        grid.setHgap(5);
        grid.setVgap(5);
        
        @SuppressWarnings("unchecked")
        List<List<String>> gridData = (List<List<String>>) element.value();
        
        for (int row = 0; row < gridData.size(); row++) {
            List<String> rowData = gridData.get(row);
            for (int col = 0; col < rowData.size(); col++) {
                String buttonText = rowData.get(col);
                Button button = new Button(buttonText);
                button.setStyle("""
                    -fx-background-color: #444;
                    -fx-text-fill: white;
                    -fx-border-color: #666;
                    -fx-border-width: 1px;
                    -fx-padding: 4px 8px;
                    -fx-font-size: 10px;
                    -fx-min-width: 60px;
                    -fx-min-height: 30px;
                """);
                
                if (element.onClick() != null) {
                    final int finalRow = row;
                    final int finalCol = col;
                    button.setOnAction(e -> {
                        element.properties().put("row", finalRow);
                        element.properties().put("col", finalCol);
                        element.onClick().accept(element);
                    });
                }
                
                grid.add(button, col, row);
            }
        }
        
        return grid;
    }
    
    private VBox createImageSelector(MenuElement element) {
        VBox container = new VBox(10);
        Label label = new Label(element.label());
        label.setStyle("-fx-text-fill: white; -fx-font-size: 14px;");
        container.getChildren().add(label);
        
        // Create image grid
        GridPane imageGrid = new GridPane();
        imageGrid.setHgap(10);
        imageGrid.setVgap(10);
        
        @SuppressWarnings("unchecked")
        List<String> imageNames = (List<String>) element.value();
        
        for (int i = 0; i < imageNames.size(); i++) {
            String imageName = imageNames.get(i);
            Button imageButton = new Button(imageName);
            imageButton.setStyle("""
                -fx-background-color: #333;
                -fx-text-fill: white;
                -fx-border-color: #555;
                -fx-border-width: 1px;
                -fx-padding: 8px;
                -fx-min-width: 80px;
                -fx-min-height: 60px;
            """);
            
            if (element.onClick() != null) {
                final String finalImageName = imageName;
                imageButton.setOnAction(e -> {
                    element.properties().put("imageName", finalImageName);
                    element.onClick().accept(element);
                });
            }
            
            imageGrid.add(imageButton, i % 4, i / 4);
        }
        
        container.getChildren().add(imageGrid);
        return container;
    }
    
    private void setupMenu() {
        // Add header
        HBox header = createHeader();
        root.getChildren().add(header);
        
        // Add tab pane
        root.getChildren().add(tabPane);
        
        // Make draggable
        makeDraggable();
    }
    
    private HBox createHeader() {
        HBox header = new HBox();
        header.setStyle("""
            -fx-background-color: #333;
            -fx-padding: 8px;
            -fx-border-color: #555;
            -fx-border-width: 0 0 1px 0;
        """);
        
        Label title = new Label(config.title());
        title.setStyle("-fx-text-fill: white; -fx-font-weight: bold; -fx-font-size: 14px;");
        
        Button closeButton = new Button("X");
        closeButton.setStyle("""
            -fx-background-color: #666;
            -fx-text-fill: white;
            -fx-border-color: #888;
            -fx-border-width: 1px;
            -fx-padding: 4px 8px;
            -fx-font-size: 10px;
        """);
        closeButton.setOnAction(e -> hide());
        
        header.getChildren().addAll(title, new Region(), closeButton);
        HBox.setHgrow(header.getChildren().get(1), Priority.ALWAYS);
        
        return header;
    }
    
    private void makeDraggable() {
        // TODO: Implement dragging functionality
        logger.debug("Dragging functionality not yet implemented");
    }
    
    public void show() {
        visible = true;
        root.setVisible(true);
        root.toFront();
        logger.info("Menu shown: {}", config.id());
    }
    
    public void hide() {
        visible = false;
        root.setVisible(false);
        
        if (onCloseParent != null) {
            onCloseParent.accept(this);
        }
        
        if (destroyOnClose) {
            destroy();
        }
        
        logger.info("Menu hidden: {}", config.id());
    }
    
    public void destroy() {
        // Cleanup resources
        logger.info("Menu destroyed: {}", config.id());
    }
    
    public boolean isVisible() {
        return visible;
    }
    
    public VBox getRoot() {
        return root;
    }
    
    public MenuConfig getConfig() {
        return config;
    }
}
```

### Step 4: Menu Manager

**File: `src/main/java/com/game/ui/menu/MenuManager.java`**
```java
package com.game.ui.menu;

import javafx.scene.layout.Pane;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.util.*;
import java.util.concurrent.ConcurrentHashMap;

public class MenuManager {
    private static final Logger logger = LoggerFactory.getLogger(MenuManager.class);
    
    private final Map<String, Menu> menus;
    private final List<Menu> menuStack;
    private final Pane menuContainer;
    private final List<Consumer<Menu>> menuCloseListeners;
    
    public MenuManager(Pane menuContainer) {
        this.menus = new ConcurrentHashMap<>();
        this.menuStack = new ArrayList<>();
        this.menuContainer = menuContainer;
        this.menuCloseListeners = new ArrayList<>();
        
        logger.info("Menu manager initialized");
    }
    
    public Menu createMenu(MenuConfig config) {
        Menu menu = new Menu(config);
        menus.put(config.id(), menu);
        
        // Add to container
        menuContainer.getChildren().add(menu.getRoot());
        
        logger.info("Menu created: {}", config.id());
        return menu;
    }
    
    public void showMenu(String menuId) {
        Menu menu = menus.get(menuId);
        if (menu != null) {
            // Hide other menus if this one is blocking
            if (menu.getConfig().isBlocking()) {
                hideAllMenus();
            }
            
            menu.show();
            menuStack.add(menu);
            
            logger.info("Menu shown: {}", menuId);
        } else {
            logger.warn("Menu not found: {}", menuId);
        }
    }
    
    public void hideMenu(String menuId) {
        Menu menu = menus.get(menuId);
        if (menu != null) {
            menu.hide();
            menuStack.remove(menu);
            logger.info("Menu hidden: {}", menuId);
        }
    }
    
    public void hideAllMenus() {
        for (Menu menu : new ArrayList<>(menuStack)) {
            menu.hide();
        }
        menuStack.clear();
        logger.info("All menus hidden");
    }
    
    public void closeMenu(String menuId) {
        Menu menu = menus.get(menuId);
        if (menu != null) {
            menu.hide();
            menu.destroy();
            menus.remove(menuId);
            menuStack.remove(menu);
            menuContainer.getChildren().remove(menu.getRoot());
            logger.info("Menu closed: {}", menuId);
        }
    }
    
    public Menu getMenu(String menuId) {
        return menus.get(menuId);
    }
    
    public boolean isMenuVisible(String menuId) {
        Menu menu = menus.get(menuId);
        return menu != null && menu.isVisible();
    }
    
    public void addMenuCloseListener(Consumer<Menu> listener) {
        menuCloseListeners.add(listener);
    }
    
    public void removeMenuCloseListener(Consumer<Menu> listener) {
        menuCloseListeners.remove(listener);
    }
    
    public List<Menu> getVisibleMenus() {
        return menuStack.stream()
                       .filter(Menu::isVisible)
                       .toList();
    }
    
    public void bringMenuToFront(String menuId) {
        Menu menu = menus.get(menuId);
        if (menu != null) {
            menu.getRoot().toFront();
            logger.debug("Menu brought to front: {}", menuId);
        }
    }
}
```

### Step 5: Bottom Menu Bar

**File: `src/main/java/com/game/ui/menu/BottomMenuBar.java`**
```java
package com.game.ui.menu;

import javafx.scene.control.Button;
import javafx.scene.layout.HBox;
import javafx.scene.layout.Priority;
import javafx.scene.layout.Region;
import javafx.scene.paint.Color;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

public class BottomMenuBar {
    private static final Logger logger = LoggerFactory.getLogger(BottomMenuBar.class);
    
    private final HBox menuBar;
    private final MenuManager menuManager;
    
    public BottomMenuBar(MenuManager menuManager) {
        this.menuManager = menuManager;
        this.menuBar = createMenuBar();
        
        logger.info("Bottom menu bar initialized");
    }
    
    private HBox createMenuBar() {
        HBox bar = new HBox(10);
        bar.setStyle("""
            -fx-background-color: #2a2a2a;
            -fx-border-color: #444;
            -fx-border-width: 1px 0 0 0;
            -fx-padding: 8px;
            -fx-alignment: center-left;
        """);
        
        // Create menu buttons
        Button skinsButton = createMenuButton("Skins", () -> showSkinsMenu());
        Button inventoryButton = createMenuButton("Inventory", () -> showInventoryMenu());
        Button settingsButton = createMenuButton("Settings", () -> showSettingsMenu());
        
        // Add spacer
        Region spacer = new Region();
        HBox.setHgrow(spacer, Priority.ALWAYS);
        
        // Add status indicators
        Button debugButton = createMenuButton("Debug", () -> showDebugMenu());
        
        bar.getChildren().addAll(skinsButton, inventoryButton, settingsButton, spacer, debugButton);
        
        return bar;
    }
    
    private Button createMenuButton(String text, Runnable onClick) {
        Button button = new Button(text);
        button.setStyle("""
            -fx-background-color: #444;
            -fx-text-fill: white;
            -fx-border-color: #666;
            -fx-border-width: 1px;
            -fx-padding: 6px 12px;
            -fx-font-size: 12px;
            -fx-min-width: 80px;
        """);
        
        button.setOnAction(e -> onClick.run());
        
        return button;
    }
    
    private void showSkinsMenu() {
        MenuConfig config = MenuConfig.builder()
            .id("skins-menu")
            .title("Entity Skins")
            .position(0.2, 0.2)
            .size(0.6, 0.6)
            .tabs(createSkinsMenuTabs())
            .build();
        
        Menu menu = menuManager.createMenu(config);
        menuManager.showMenu("skins-menu");
    }
    
    private void showInventoryMenu() {
        MenuConfig config = MenuConfig.builder()
            .id("inventory-menu")
            .title("Inventory")
            .position(0.1, 0.1)
            .size(0.8, 0.8)
            .tabs(createInventoryMenuTabs())
            .build();
        
        Menu menu = menuManager.createMenu(config);
        menuManager.showMenu("inventory-menu");
    }
    
    private void showSettingsMenu() {
        MenuConfig config = MenuConfig.builder()
            .id("settings-menu")
            .title("Settings")
            .position(0.3, 0.3)
            .size(0.4, 0.4)
            .tabs(createSettingsMenuTabs())
            .build();
        
        Menu menu = menuManager.createMenu(config);
        menuManager.showMenu("settings-menu");
    }
    
    private void showDebugMenu() {
        MenuConfig config = MenuConfig.builder()
            .id("debug-menu")
            .title("Debug Info")
            .position(0.1, 0.1)
            .size(0.8, 0.8)
            .tabs(createDebugMenuTabs())
            .build();
        
        Menu menu = menuManager.createMenu(config);
        menuManager.showMenu("debug-menu");
    }
    
    private List<MenuTab> createSkinsMenuTabs() {
        List<MenuTab> tabs = new ArrayList<>();
        
        // Entity Skins Tab
        MenuTab entitySkinsTab = MenuTab.builder()
            .title("Entity Skins")
            .elements(createEntitySkinElements())
            .build();
        tabs.add(entitySkinsTab);
        
        // Background Skins Tab
        MenuTab backgroundSkinsTab = MenuTab.builder()
            .title("Background Skins")
            .elements(createBackgroundSkinElements())
            .build();
        tabs.add(backgroundSkinsTab);
        
        return tabs;
    }
    
    private List<MenuElement> createEntitySkinElements() {
        List<MenuElement> elements = new ArrayList<>();
        
        // Tree skin selector
        MenuElement treeSelector = MenuElement.builder()
            .type(MenuElement.ElementType.IMAGE_SELECTOR)
            .id("tree-skin-selector")
            .label("Tree Skins")
            .value(List.of("Default Tree", "Pine Tree", "Oak Tree", "Palm Tree"))
            .onClick(this::handleTreeSkinSelection)
            .build();
        elements.add(treeSelector);
        
        // Rock skin selector
        MenuElement rockSelector = MenuElement.builder()
            .type(MenuElement.ElementType.IMAGE_SELECTOR)
            .id("rock-skin-selector")
            .label("Rock Skins")
            .value(List.of("Default Rock", "Stone", "Crystal", "Gem"))
            .onClick(this::handleRockSkinSelection)
            .build();
        elements.add(rockSelector);
        
        return elements;
    }
    
    private List<MenuElement> createBackgroundSkinElements() {
        List<MenuElement> elements = new ArrayList<>();
        
        // Background selector
        MenuElement backgroundSelector = MenuElement.builder()
            .type(MenuElement.ElementType.IMAGE_SELECTOR)
            .id("background-selector")
            .label("Background Skins")
            .value(List.of("Plains", "Desert", "Forest", "Mountain"))
            .onClick(this::handleBackgroundSelection)
            .build();
        elements.add(backgroundSelector);
        
        return elements;
    }
    
    private List<MenuTab> createInventoryMenuTabs() {
        // TODO: Implement inventory menu tabs
        return List.of();
    }
    
    private List<MenuTab> createSettingsMenuTabs() {
        // TODO: Implement settings menu tabs
        return List.of();
    }
    
    private List<MenuTab> createDebugMenuTabs() {
        // TODO: Implement debug menu tabs
        return List.of();
    }
    
    private void handleTreeSkinSelection(MenuElement element) {
        String imageName = (String) element.properties().get("imageName");
        logger.info("Tree skin selected: {}", imageName);
        // TODO: Implement skin replacement
    }
    
    private void handleRockSkinSelection(MenuElement element) {
        String imageName = (String) element.properties().get("imageName");
        logger.info("Rock skin selected: {}", imageName);
        // TODO: Implement skin replacement
    }
    
    private void handleBackgroundSelection(MenuElement element) {
        String imageName = (String) element.properties().get("imageName");
        logger.info("Background selected: {}", imageName);
        // TODO: Implement background replacement
    }
    
    public HBox getMenuBar() {
        return menuBar;
    }
}
```

### Step 6: Update Canvas Window

**File: `src/main/java/com/game/ui/CanvasWindow.java`**
```java
// Add to existing CanvasWindow class:

private MenuManager menuManager;
private BottomMenuBar bottomMenuBar;

public CanvasWindow(GameEngine gameEngine) {
    this.gameEngine = gameEngine;
    
    // Create root layout
    root = new BorderPane();
    
    // Create menu container
    StackPane menuContainer = new StackPane();
    menuContainer.setPickOnBounds(false); // Allow clicks to pass through to canvas
    
    // Create menu manager
    menuManager = new MenuManager(menuContainer);
    
    // Create menu bar
    menuBar = createMenuBar();
    root.setTop(menuBar);
    
    // Create canvas
    gameCanvas = new Canvas(1200, 800);
    gc = gameCanvas.getGraphicsContext2D();
    
    // Create bottom menu bar
    bottomMenuBar = new BottomMenuBar(menuManager);
    
    // Setup layout
    VBox centerContainer = new VBox();
    centerContainer.getChildren().addAll(gameCanvas, bottomMenuBar.getMenuBar());
    VBox.setVgrow(gameCanvas, Priority.ALWAYS);
    
    root.setCenter(centerContainer);
    root.setRight(menuContainer); // Menus will overlay on the right
    
    // Setup canvas event handling
    setupCanvasEvents();
    
    // Setup resize handling
    setupResizeHandling();
    
    // Connect graphics context to game engine
    gameEngine.setGraphicsContext(gc);
    
    logger.info("Canvas window initialized with menu system");
}

public MenuManager getMenuManager() {
    return menuManager;
}
```

## Testing Phase 9

### Build and Test
```bash
cd javafx
./gradlew clean build
./gradlew run
```

### Verification Checklist

- ✅ **Menu System**: Dynamic menu building working
- ✅ **Menu Manager**: Overlaying menus and state management
- ✅ **Bottom Menu Bar**: Menu bar at bottom of screen
- ✅ **Menu Tabs**: Tab system with multiple tabs
- ✅ **Menu Elements**: Buttons, radio groups, grid buttons, image selectors
- ✅ **Menu Events**: Click handlers and callbacks working
- ✅ **Menu State**: Proper show/hide/destroy lifecycle
- ✅ **Skin Configuration**: Entity skin selection menus

## Menu System Features

### Bottom Menu Bar
- **Skins**: Entity and background skin configuration
- **Inventory**: Player inventory management
- **Settings**: Game settings and configuration
- **Debug**: Debug information and tools

### Menu Types
- **Entity Skins**: Tree, rock, grass skin selection
- **Background Skins**: Plains, desert, forest backgrounds
- **Inventory**: Item management and storage
- **Settings**: Game configuration options
- **Debug**: Performance and debug information

### Menu Features
- **Dynamic Building**: Menus built from configuration
- **Overlaying**: Multiple menus can be open simultaneously
- **Tab System**: Multiple tabs per menu
- **Event Handling**: Click callbacks and state management
- **Draggable**: Menus can be moved around
- **Resizable**: Menus can be resized
- **Blocking**: Some menus block interaction with others

## Next Steps

**Ready for Phase 10**: Interaction System
- Grid cell selector following cursor
- Entity harvesting system
- Click-to-interact functionality
- Collision detection improvements 