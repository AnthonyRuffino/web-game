// main.js
// Entry point for initializing the game

const canvas = document.getElementById('gameCanvas');
const ctx = canvas ? canvas.getContext('2d') : null;

// Initialize background system
if (typeof Background !== 'undefined' && Background.init) {
  Background.init();
}

// Initialize input handling
if (typeof Input !== 'undefined' && Input.init) {
  Input.init();
}

// Initialize game engine (no explicit init needed yet)

// Start the game loop
if (typeof GameLoop !== 'undefined' && GameLoop.start) {
  GameLoop.start();
} 