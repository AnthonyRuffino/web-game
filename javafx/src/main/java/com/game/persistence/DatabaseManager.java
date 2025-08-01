package com.game.persistence;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.sql.Connection;
import java.sql.DriverManager;
import java.sql.SQLException;
import java.util.concurrent.CompletableFuture;
import java.util.concurrent.ExecutorService;
import java.util.concurrent.Executors;

public class DatabaseManager implements AutoCloseable {
    private static final Logger logger = LoggerFactory.getLogger(DatabaseManager.class);
    
    private final String dbUrl;
    private final ExecutorService executor;
    private Connection connection;
    
    public DatabaseManager() {
        // Use shared database with Electron version
        this.dbUrl = "jdbc:sqlite:../game.db";
        this.executor = Executors.newVirtualThreadPerTaskExecutor();
    }
    
    public void initialize() throws SQLException {
        logger.info("Initializing database connection to: {}", dbUrl);
        
        try {
            connection = DriverManager.getConnection(dbUrl);
            connection.setAutoCommit(false);
            
            // Verify database schema
            verifySchema();
            
            logger.info("Database connection established successfully");
        } catch (SQLException e) {
            logger.error("Failed to initialize database", e);
            throw e;
        }
    }
    
    private void verifySchema() throws SQLException {
        // Check if required tables exist
        String[] requiredTables = {
            "worlds", "characters", "entity_types", 
            "cell_changes", "cell_entities", "inventory"
        };
        
        for (String table : requiredTables) {
            try (var stmt = connection.createStatement()) {
                stmt.execute("SELECT 1 FROM " + table + " LIMIT 1");
                logger.debug("Table {} exists", table);
            } catch (SQLException e) {
                logger.warn("Table {} does not exist or is not accessible", table);
            }
        }
    }
    
    public CompletableFuture<Connection> getConnectionAsync() {
        return CompletableFuture.supplyAsync(() -> {
            try {
                if (connection == null || connection.isClosed()) {
                    connection = DriverManager.getConnection(dbUrl);
                    connection.setAutoCommit(false);
                }
                return connection;
            } catch (SQLException e) {
                logger.error("Failed to get database connection", e);
                throw new RuntimeException(e);
            }
        }, executor);
    }
    
    public Connection getConnection() throws SQLException {
        if (connection == null || connection.isClosed()) {
            connection = DriverManager.getConnection(dbUrl);
            connection.setAutoCommit(false);
        }
        return connection;
    }
    
    @Override
    public void close() {
        logger.info("Closing database connection...");
        
        if (connection != null) {
            try {
                connection.close();
                logger.info("Database connection closed");
            } catch (SQLException e) {
                logger.error("Error closing database connection", e);
            }
        }
        
        if (executor != null) {
            executor.close();
            logger.info("Database executor closed");
        }
    }
} 