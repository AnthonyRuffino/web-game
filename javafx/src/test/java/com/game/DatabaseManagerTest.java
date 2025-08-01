package com.game;

import com.game.persistence.DatabaseManager;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.AfterEach;

import java.sql.Connection;
import java.sql.SQLException;

import static org.junit.jupiter.api.Assertions.*;

class DatabaseManagerTest {
    
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
    void testDatabaseInitialization() throws SQLException {
        assertDoesNotThrow(() -> databaseManager.initialize());
        
        Connection connection = databaseManager.getConnection();
        assertNotNull(connection);
        assertFalse(connection.isClosed());
    }
    
    @Test
    void testAsyncConnection() {
        assertDoesNotThrow(() -> databaseManager.initialize());
        
        databaseManager.getConnectionAsync()
            .thenAccept(connection -> {
                assertNotNull(connection);
                assertDoesNotThrow(() -> assertFalse(connection.isClosed()));
            })
            .join();
    }
} 