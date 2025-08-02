package com.game.logging;

import javafx.application.Platform;
import javafx.scene.web.WebView;
import javafx.scene.web.WebEngine;
import javafx.scene.control.ScrollPane;
import javafx.scene.layout.VBox;
import javafx.scene.layout.HBox;
import javafx.scene.control.Button;
import javafx.scene.control.Label;
import javafx.scene.paint.Color;
import javafx.scene.text.Font;
import javafx.geometry.Insets;
import javafx.geometry.Pos;

import java.util.ArrayList;
import java.util.List;
import java.util.function.Supplier;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;

public class GameLogger {
    private final List<LogEntry> logs = new ArrayList<>();
    private final int maxLogs = 1000; // Keep last 1000 logs
    private final GameDebugModeProvider debugModeProvider;
    private WebView logView;
    private VBox logWindow;
    private boolean isWindowVisible = false;
    private javafx.scene.control.TextArea textArea;
    private static final DateTimeFormatter TIME_FORMATTER = DateTimeFormatter.ofPattern("HH:mm:ss.SSS");
    
    public interface GameDebugModeProvider {
        boolean isDebugMode();
    }
    
    public static class LogEntry {
        public final String message;
        public final LogLevel level;
        public final LocalDateTime timestamp;
        
        public LogEntry(String message, LogLevel level) {
            this.message = message;
            this.level = level;
            this.timestamp = LocalDateTime.now();
        }
        
        public String getFormattedTime() {
            return timestamp.format(TIME_FORMATTER);
        }
    }
    
    public enum LogLevel {
        DEBUG, INFO, WARN, ERROR
    }
    
    public GameLogger(GameDebugModeProvider debugModeProvider) {
        this.debugModeProvider = debugModeProvider;
        // Defer WebView initialization until needed
        logWindow = new VBox(10);
        logWindow.setStyle("-fx-background-color: rgba(0, 0, 0, 0.95); -fx-border-color: white; -fx-border-width: 2; -fx-border-radius: 5;");
        logWindow.setPadding(new Insets(10));
        logWindow.setPrefSize(600, 300);
        logWindow.setMaxSize(600, 300);
        logWindow.setVisible(false); // Hidden by default
        logWindow.setAlignment(Pos.TOP_RIGHT);
        
        // Add initial log entries for testing
        addLog(new LogEntry("GameLogger initialized - ready to display logs", LogLevel.INFO));
        addLog(new LogEntry("Press 'L' to toggle the log window", LogLevel.INFO));
        addLog(new LogEntry("This is a test message to verify the log window is working", LogLevel.INFO));
        addLog(new LogEntry("If you can see this, the log window is working correctly!", LogLevel.INFO));
    }
    
    private void initializeLogWindow() {
        if (logView != null) return; // Already initialized
        
        // Create header
        HBox header = new HBox(10);
        header.setAlignment(Pos.CENTER_LEFT);
        
        Label titleLabel = new Label("Game Logs");
        titleLabel.setFont(Font.font("Arial", 16));
        titleLabel.setTextFill(Color.WHITE);
        
        Button clearButton = new Button("Clear");
        clearButton.setOnAction(e -> clearLogs());
        
        Button closeButton = new Button("Close");
        closeButton.setOnAction(e -> toggleWindow());
        
        header.getChildren().addAll(titleLabel, clearButton, closeButton);
        
        // Create simple text area for logs
        javafx.scene.control.TextArea textArea = new javafx.scene.control.TextArea();
        textArea.setEditable(false);
        textArea.setPrefRowCount(15);
        textArea.setPrefColumnCount(60);
        textArea.setStyle("-fx-control-inner-background: black; -fx-text-fill: white; -fx-font-family: 'Courier New'; -fx-font-size: 10px;");
        
        // Update text area with current logs
        updateTextArea(textArea);
        
        logWindow.getChildren().addAll(header, textArea);
        
        // Store reference to text area for updates
        this.textArea = textArea;
    }
    
    private void updateTextArea(javafx.scene.control.TextArea textArea) {
        StringBuilder content = new StringBuilder();
        for (LogEntry entry : logs) {
            content.append("[").append(entry.getFormattedTime()).append("] ");
            content.append(entry.message).append("\n");
        }
        textArea.setText(content.toString());
        textArea.setScrollTop(Double.MAX_VALUE); // Scroll to bottom
    }
    
    private String createHtmlContent() {
        StringBuilder html = new StringBuilder();
        html.append("<!DOCTYPE html><html><head>");
        html.append("<style>");
        html.append("body { font-family: 'Courier New', monospace; font-size: 12px; background-color: #000; color: #fff; margin: 0; padding: 10px; }");
        html.append(".log-entry { margin: 2px 0; white-space: pre-wrap; }");
        html.append(".debug { color: #888; }");
        html.append(".info { color: #fff; }");
        html.append(".warn { color: #ffaa00; }");
        html.append(".error { color: #ff4444; }");
        html.append(".timestamp { color: #666; }");
        html.append("</style></head><body>");
        
        for (LogEntry entry : logs) {
            html.append("<div class='log-entry'>");
            html.append("<span class='timestamp'>[").append(entry.getFormattedTime()).append("]</span> ");
            html.append("<span class='").append(entry.level.name().toLowerCase()).append("'>");
            html.append(entry.message.replace("<", "&lt;").replace(">", "&gt;"));
            html.append("</span></div>");
        }
        
        html.append("</body></html>");
        return html.toString();
    }
    
    private void updateLogWindow() {
        if (textArea != null) {
            Platform.runLater(() -> updateTextArea(textArea));
        }
    }
    
    public void info(Supplier<String> logSupplier) {
        String message = logSupplier.get();
        addLog(new LogEntry(message, LogLevel.INFO));
    }
    
    public void debug(Supplier<String> logSupplier) {
        if (debugModeProvider.isDebugMode()) {
            String message = logSupplier.get();
            addLog(new LogEntry(message, LogLevel.DEBUG));
        }
    }
    
    public void warn(Supplier<String> logSupplier) {
        String message = logSupplier.get();
        addLog(new LogEntry(message, LogLevel.WARN));
    }
    
    public void error(Supplier<String> logSupplier) {
        String message = logSupplier.get();
        addLog(new LogEntry(message, LogLevel.ERROR));
    }
    
    private void addLog(LogEntry entry) {
        logs.add(entry);
        
        // Keep only the last maxLogs entries
        if (logs.size() > maxLogs) {
            logs.remove(0);
        }
        
        updateLogWindow();
    }
    
    public void clearLogs() {
        logs.clear();
        updateLogWindow();
    }
    
    public void toggleWindow() {
        isWindowVisible = !isWindowVisible;
        
        if (isWindowVisible && textArea == null) {
            // Initialize TextArea on first show
            Platform.runLater(this::initializeLogWindow);
        }
        
        logWindow.setVisible(isWindowVisible);
        
        // Add a test log entry when window is shown
        if (isWindowVisible) {
            addLog(new LogEntry("Log window opened - you should see this message!", LogLevel.INFO));
        }
    }
    
    public boolean isWindowVisible() {
        return isWindowVisible;
    }
    
    public VBox getLogWindow() {
        return logWindow;
    }
    
    public List<LogEntry> getLogs() {
        return new ArrayList<>(logs);
    }
} 