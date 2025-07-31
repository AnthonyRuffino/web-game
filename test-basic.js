console.log('Testing basic module imports...');

try {
    console.log('Testing CanvasManager...');
    const { CanvasManager } = require('./src/modules/game/rendering/canvas.js');
    console.log('CanvasManager imported successfully');
} catch (error) {
    console.error('CanvasManager import failed:', error.message);
}

try {
    console.log('Testing InputManager...');
    const { InputManager } = require('./src/modules/game/input/input.js');
    console.log('InputManager imported successfully');
} catch (error) {
    console.error('InputManager import failed:', error.message);
}

try {
    console.log('Testing Camera...');
    const { Camera } = require('./src/modules/game/rendering/camera.js');
    console.log('Camera imported successfully');
} catch (error) {
    console.error('Camera import failed:', error.message);
}

try {
    console.log('Testing Player...');
    const { Player } = require('./src/modules/game/core/character.js');
    console.log('Player imported successfully');
} catch (error) {
    console.error('Player import failed:', error.message);
}

try {
    console.log('Testing World...');
    const { World } = require('./src/modules/game/core/world.js');
    console.log('World imported successfully');
} catch (error) {
    console.error('World import failed:', error.message);
}

console.log('Basic module import test completed'); 