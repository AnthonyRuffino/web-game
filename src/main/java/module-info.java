module com.game {
    requires javafx.controls;
    requires javafx.web;
    requires javafx.fxml;
    requires java.sql;
    requires org.slf4j;
    requires com.fasterxml.jackson.databind;
    requires jdk.jsobject;
    requires java.desktop;
    
    exports com.game;
    exports com.game.core;
    exports com.game.persistence;
    exports com.game.rendering;
    exports com.game.ui;
    exports com.game.utils;
    
    opens com.game to javafx.fxml;
    opens com.game.ui to javafx.fxml;
} 