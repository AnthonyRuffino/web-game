package com.game.persistence;

import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.io.TempDir;

import java.nio.file.Path;
import java.sql.Connection;
import java.sql.SQLException;
import java.util.concurrent.CompletableFuture;
import java.util.concurrent.TimeUnit;

import static org.junit.jupiter.api.Assertions.*;

class DatabaseManagerTest {
    
    @TempDir
    Path tempDir;
    
    private DatabaseManager databaseManager;
    
    @BeforeEach
    void setUp() {
        databaseManager = new DatabaseManager();
    }
    
    @AfterEach
    void tearDown() throws Exception {
        if (databaseManager != null) {
            databaseManager.close();
        }
    }
    
    @Test
    void testDatabaseInitialization() {
        // Act
        assertDoesNotThrow(() -> databaseManager.initialize());
        
        // Assert
        Connection connection = assertDoesNotThrow(() -> databaseManager.getConnection());
        assertNotNull(connection);
        assertDoesNotThrow(() -> assertFalse(connection.isClosed()));
    }
    
    @Test
    void testGetConnection() {
        // Arrange
        assertDoesNotThrow(() -> databaseManager.initialize());
        
        // Act
        Connection connection = assertDoesNotThrow(() -> databaseManager.getConnection());
        
        // Assert
        assertNotNull(connection);
        assertDoesNotThrow(() -> assertFalse(connection.isClosed()));
        assertDoesNotThrow(() -> assertFalse(connection.getAutoCommit())); // Should be set to false
    }
    
    @Test
    void testGetConnectionAsync() {
        // Arrange
        assertDoesNotThrow(() -> databaseManager.initialize());
        
        // Act
        CompletableFuture<Connection> future = databaseManager.getConnectionAsync();
        
        // Assert
        assertDoesNotThrow(() -> {
            Connection connection = future.get(5, TimeUnit.SECONDS);
            assertNotNull(connection);
            assertDoesNotThrow(() -> assertFalse(connection.isClosed()));
        });
    }
    
    @Test
    void testMultipleConnectionRequests() {
        // Arrange
        assertDoesNotThrow(() -> databaseManager.initialize());
        
        // Act - Get multiple connections
        Connection conn1 = assertDoesNotThrow(() -> databaseManager.getConnection());
        Connection conn2 = assertDoesNotThrow(() -> databaseManager.getConnection());
        Connection conn3 = assertDoesNotThrow(() -> databaseManager.getConnection());
        
        // Assert - All should be the same connection instance
        assertSame(conn1, conn2);
        assertSame(conn2, conn3);
        assertDoesNotThrow(() -> assertFalse(conn1.isClosed()));
    }
    
    @Test
    void testConnectionReuseAfterClose() {
        // Arrange
        assertDoesNotThrow(() -> databaseManager.initialize());
        Connection originalConnection = assertDoesNotThrow(() -> databaseManager.getConnection());
        assertDoesNotThrow(() -> originalConnection.close());
        
        // Act - Get connection again
        Connection newConnection = assertDoesNotThrow(() -> databaseManager.getConnection());
        
        // Assert - Should create a new connection
        assertNotNull(newConnection);
        assertDoesNotThrow(() -> assertFalse(newConnection.isClosed()));
        // Note: In this implementation, it might be the same connection object
        // but the important thing is that it's usable
    }
    
    @Test
    void testAsyncConnectionReuse() {
        // Arrange
        assertDoesNotThrow(() -> databaseManager.initialize());
        
        // Act - Get multiple async connections
        CompletableFuture<Connection> future1 = databaseManager.getConnectionAsync();
        CompletableFuture<Connection> future2 = databaseManager.getConnectionAsync();
        CompletableFuture<Connection> future3 = databaseManager.getConnectionAsync();
        
        // Assert - All should complete successfully
        assertDoesNotThrow(() -> {
            Connection conn1 = future1.get(5, TimeUnit.SECONDS);
            Connection conn2 = future2.get(5, TimeUnit.SECONDS);
            Connection conn3 = future3.get(5, TimeUnit.SECONDS);
            
            assertNotNull(conn1);
            assertNotNull(conn2);
            assertNotNull(conn3);
            assertDoesNotThrow(() -> assertFalse(conn1.isClosed()));
            assertDoesNotThrow(() -> assertFalse(conn2.isClosed()));
            assertDoesNotThrow(() -> assertFalse(conn3.isClosed()));
        });
    }
    
    @Test
    void testDatabaseClose() {
        // Arrange
        assertDoesNotThrow(() -> databaseManager.initialize());
        Connection connection = assertDoesNotThrow(() -> databaseManager.getConnection());
        
        // Act
        databaseManager.close();
        
        // Assert - Connection should be closed
        assertDoesNotThrow(() -> assertTrue(connection.isClosed()));
    }
    
    @Test
    void testCloseWithoutInitialization() {
        // Act & Assert - Should not throw exception
        assertDoesNotThrow(() -> databaseManager.close());
    }
    
    @Test
    void testGetConnectionWithoutInitialization() {
        // Act & Assert - Should work even without explicit initialization
        assertDoesNotThrow(() -> {
            Connection connection = databaseManager.getConnection();
            assertNotNull(connection);
            assertDoesNotThrow(() -> assertFalse(connection.isClosed()));
        });
    }
    
    @Test
    void testGetConnectionAsyncWithoutInitialization() {
        // Act
        CompletableFuture<Connection> future = databaseManager.getConnectionAsync();
        
        // Assert - Should complete successfully even without initialization
        assertDoesNotThrow(() -> {
            Connection connection = future.get(5, TimeUnit.SECONDS);
            assertNotNull(connection);
            assertDoesNotThrow(() -> assertFalse(connection.isClosed()));
        });
    }
    
    @Test
    void testConcurrentConnectionRequests() {
        // Arrange
        assertDoesNotThrow(() -> databaseManager.initialize());
        
        // Act - Create multiple concurrent requests
        CompletableFuture<Connection>[] futures = new CompletableFuture[10];
        for (int i = 0; i < 10; i++) {
            futures[i] = databaseManager.getConnectionAsync();
        }
        
        // Assert - All should complete successfully
        assertDoesNotThrow(() -> {
            for (CompletableFuture<Connection> future : futures) {
                Connection connection = future.get(5, TimeUnit.SECONDS);
                assertNotNull(connection);
                assertDoesNotThrow(() -> assertFalse(connection.isClosed()));
            }
        });
    }
} 