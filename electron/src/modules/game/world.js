// World generation and management system

import { GrassEntity } from './entities/grass.js';
import { TreeEntity } from './entities/tree.js';
import { RockEntity } from './entities/rock.js';
import { EntityRenderer } from './entityRenderer.js';

export class World {
    constructor() {
        this.config = {
            seed: 12345,
            chunkSize: 64,
            tileSize: 32,
            chunkCount: 64,
            startingChunkX: 0,
            startingChunkY: 0,
            traversalSpeed: 200,
            biomePlainsFraction: 0.5,
            keepDistance: 1,
            // Entity placement probabilities
            grass: {
                baseChance: 0.01,
                hashSalt: 0,
                variationMod: 200,
                variationDiv: 1000,
                minChance: 0.01,
                maxChance: 1,
                hashLabel: 'grass'
            },
            tree: {
                baseChance: 0.025,
                hashSalt: 10000,
                variationMod: 150,
                variationDiv: 1000,
                minChance: 0.01,
                maxChance: 0.04,
                hashLabel: 'tree'
            },
            rock: {
                baseChance: 0.015,
                hashSalt: 20000,
                variationMod: 100,
                variationDiv: 1000,
                minChance: 0.005,
                maxChance: 0.025,
                hashLabel: 'rock'
            }
        };

        this.chunkCache = new Map();
        this.chunkBiomeMap = new Map();
        this.showGrid = false;

        this.init();
    }

    init() {
        console.log('[World] Initializing world system...');
        
        // Classify all chunks by biome
        this.chunkBiomeMap.clear();
        const chunkCount = this.config.chunkCount;
        const plainsLimit = Math.floor(chunkCount * this.config.biomePlainsFraction);
        
        for (let y = 0; y < chunkCount; y++) {
            for (let x = 0; x < chunkCount; x++) {
                const biome = (x < plainsLimit) ? 'plains' : 'desert';
                this.chunkBiomeMap.set(this.getChunkKey(x, y), biome);
            }
        }
        
        console.log('[World] Biome classification complete.');
        console.log(`[World] World initialized with seed: ${this.config.seed}`);
    }

    // World dimensions
    get width() {
        return this.config.chunkCount * this.config.chunkSize * this.config.tileSize;
    }

    get height() {
        return this.config.chunkCount * this.config.chunkSize * this.config.tileSize;
    }

    // Convert world coordinates to chunk coordinates
    worldToChunk(x, y) {
        const chunkX = Math.floor(x / this.config.chunkSize);
        const chunkY = Math.floor(y / this.config.chunkSize);
        return { x: chunkX, y: chunkY };
    }

    // Convert chunk coordinates to world coordinates
    chunkToWorld(chunkX, chunkY) {
        return {
            x: chunkX * this.config.chunkSize,
            y: chunkY * this.config.chunkSize
        };
    }

    // Get chunk key for cache
    getChunkKey(chunkX, chunkY) {
        return `${chunkX},${chunkY}`;
    }

    // Load or generate a chunk
    loadChunk(chunkX, chunkY) {
        const key = this.getChunkKey(chunkX, chunkY);
        
        if (this.chunkCache.has(key)) {
            const chunk = this.chunkCache.get(key);
            if (!chunk.entities) {
                chunk.entities = [];
            }
            return chunk;
        }

        // Generate new chunk
        const chunk = this.generateChunk(chunkX, chunkY);
        this.chunkCache.set(key, chunk);
        
        console.log(`[World] Generated chunk: ${key}`);
        return chunk;
    }

    // Generate chunk data
    generateChunk(chunkX, chunkY) {
        const chunk = {
            x: chunkX,
            y: chunkY,
            worldX: chunkX * this.config.chunkSize * this.config.tileSize,
            worldY: chunkY * this.config.chunkSize * this.config.tileSize,
            tiles: [],
            objects: [],
            entities: [],
            lastAccessed: Date.now()
        };

        // Determine biome for this chunk
        const biome = this.getChunkBiome(chunkX, chunkY);
        chunk.biome = biome;
        
        console.log(`[World] Generated chunk (${chunkX}, ${chunkY}) with biome: ${biome}`);

        // Generate tiles for this chunk
        const startTileX = chunkX * this.config.chunkSize;
        const startTileY = chunkY * this.config.chunkSize;
        const endTileX = Math.min(startTileX + this.config.chunkSize, this.config.chunkCount * this.config.chunkSize);
        const endTileY = Math.min(startTileY + this.config.chunkSize, this.config.chunkCount * this.config.chunkSize);

        for (let tileY = startTileY; tileY < endTileY; tileY++) {
            for (let tileX = startTileX; tileX < endTileX; tileX++) {
                // Generate tile based on position and seed
                const tile = this.generateTile(tileX, tileY);
                chunk.tiles.push(tile);
                
                // Generate grass tiles deterministically
                if (this.shouldPlaceGrass(tileX, tileY)) {
                    const grassX = tileX * this.config.tileSize + this.config.tileSize / 2;
                    const grassY = tileY * this.config.tileSize + this.config.tileSize / 2;
                    
                    // Create grass using EntityRenderer
                    const grassEntity = EntityRenderer.createGrass({
                        isSprite: false,
                        size: 32,
                        bladeColor: '#81C784',
                        bladeWidth: 1.5,
                        clusterCount: 3,
                        bladeCount: 5,
                        bladeLength: 10,
                        bladeAngleVariation: 30,
                        opacity: 1.0
                    });
                    
                    // Merge with world-specific properties
                    chunk.entities.push({
                        ...grassEntity,
                        x: grassX,
                        y: grassY,
                        tileX: tileX,
                        tileY: tileY
                    });
                }
                
                // Generate trees and rocks deterministically
                if (this.shouldPlaceTree(tileX, tileY)) {
                    const treeX = tileX * this.config.tileSize + this.config.tileSize / 2;
                    const treeY = tileY * this.config.tileSize + this.config.tileSize / 2;
                    
                    // Create tree using EntityRenderer
                    const treeEntity = EntityRenderer.createTree({
                        isSprite: false,
                        size: 24,
                        trunkColor: '#5C4033',
                        foliageColor: '#1B5E20',
                        trunkWidth: 12,
                        foliageRadius: 12,
                        opacity: 1.0,
                    });
                    
                    // Merge with world-specific properties
                    chunk.entities.push({
                        ...treeEntity,
                        x: treeX,
                        y: treeY,
                        tileX: tileX,
                        tileY: tileY,
                        collision: true,
                        collisionRadius: 18 // Tree collision radius
                    });
                }
                
                if (this.shouldPlaceRock(tileX, tileY)) {
                    const rockX = tileX * this.config.tileSize + this.config.tileSize / 2;
                    const rockY = tileY * this.config.tileSize + this.config.tileSize / 2;
                    
                    // Create rock using EntityRenderer
                    const rockEntity = EntityRenderer.createRock({
                        isSprite: false,
                        size: 20,
                        baseColor: '#757575',
                        strokeColor: '#424242',
                        textureColor: '#424242',
                        opacity: 1.0,
                        textureSpots: 3, // Number of texture spots
                        strokeWidth: 2
                    });
                    
                    // Merge with world-specific properties
                    chunk.entities.push({
                        ...rockEntity,
                        x: rockX,
                        y: rockY,
                        tileX: tileX,
                        tileY: tileY,
                        collision: true,
                        collisionRadius: 12 // Rock collision radius
                    });
                }
            }
        }

        // Add starting position X marker if this chunk contains it
        const startPos = this.getStartingPosition();
        const startTile = this.pixelToTile(startPos.x, startPos.y);
        if (startTile.x >= startTileX && startTile.x < endTileX && 
            startTile.y >= startTileY && startTile.y < endTileY) {
            chunk.entities.push({
                type: 'letterTile',
                letter: 'X',
                x: startPos.x,
                y: startPos.y,
                renderType: 'shape', // 'shape' or 'sprite'
                sprite: null, // Image object for sprite rendering
                draw: function(ctx) {
                    if (this.renderType === 'sprite' && this.sprite) {
                        // Draw sprite
                        const spriteWidth = this.sprite.width || 36;
                        const spriteHeight = this.sprite.height || 36;
                        ctx.drawImage(
                            this.sprite,
                            this.x - spriteWidth / 2,
                            this.y - spriteHeight / 2,
                            spriteWidth,
                            spriteHeight
                        );
                    } else {
                        // Draw shape (red X)
                        ctx.fillStyle = 'red';
                        ctx.font = 'bold 36px sans-serif';
                        ctx.textAlign = 'center';
                        ctx.textBaseline = 'middle';
                        ctx.fillText(this.letter, this.x, this.y);
                    }
                }
            });
        }

        return chunk;
    }

    // Get starting position for the player
    getStartingPosition() {
        const startChunkX = this.config.startingChunkX;
        const startChunkY = this.config.startingChunkY;
        const chunkSize = this.config.chunkSize * this.config.tileSize;
        
        return {
            x: startChunkX * chunkSize + chunkSize / 2,
            y: startChunkY * chunkSize + chunkSize / 2
        };
    }

    // Convert pixel coordinates to tile coordinates
    pixelToTile(pixelX, pixelY) {
        return {
            x: Math.floor(pixelX / this.config.tileSize),
            y: Math.floor(pixelY / this.config.tileSize)
        };
    }

    // Get biome for a chunk
    getChunkBiome(chunkX, chunkY) {
        const key = this.getChunkKey(chunkX, chunkY);
        const biome = this.chunkBiomeMap.get(key) || 'plains';
        console.log(`[World] getChunkBiome(${chunkX}, ${chunkY}) = ${biome} (key: ${key})`);
        return biome;
    }

    // Generate a single tile
    generateTile(tileX, tileY) {
        const hash = this.simpleHash(`${this.config.seed}-${tileX}-${tileY}`);
        
        return {
            x: tileX,
            y: tileY,
            type: 'empty',
            worldX: tileX * this.config.tileSize,
            worldY: tileY * this.config.tileSize,
            hash: hash
        };
    }

    // Common helper for entity placement probability
    shouldPlaceEntity(tileX, tileY, baseChance, hashSalt, variationMod, variationDiv, minChance, maxChance, hashLabel = '') {
        const hash = this.betterHash(`${this.config.seed + hashSalt}-${hashLabel}-${tileX}-${tileY}`);
        const variation = (hash % variationMod - Math.floor(variationMod / 2)) / variationDiv;
        const chance = Math.max(minChance, Math.min(maxChance, baseChance + variation));
        const normalizedHash = (hash % 1000) / 1000;
        return normalizedHash < chance;
    }

    // Determine if grass should be placed
    shouldPlaceGrass(tileX, tileY) {
        const g = this.config.grass;
        return this.shouldPlaceEntity(
            tileX, tileY,
            g.baseChance, g.hashSalt, g.variationMod, g.variationDiv, g.minChance, g.maxChance, g.hashLabel
        );
    }

    // Determine if a tree should be placed
    shouldPlaceTree(tileX, tileY) {
        const t = this.config.tree;
        return this.shouldPlaceEntity(
            tileX, tileY,
            t.baseChance, t.hashSalt, t.variationMod, t.variationDiv, t.minChance, t.maxChance, t.hashLabel
        );
    }

    // Determine if a rock should be placed
    shouldPlaceRock(tileX, tileY) {
        const r = this.config.rock;
        return this.shouldPlaceEntity(
            tileX, tileY,
            r.baseChance, r.hashSalt, r.variationMod, r.variationDiv, r.minChance, r.maxChance, r.hashLabel
        );
    }

    // Get chunks that need to be rendered based on camera view
    getVisibleChunks(cameraX, cameraY, cameraWidth, cameraHeight) {
        const chunks = new Set();
        
        // Calculate visible world area
        const left = cameraX - cameraWidth / 2;
        const right = cameraX + cameraWidth / 2;
        const top = cameraY - cameraHeight / 2;
        const bottom = cameraY + cameraHeight / 2;
        
        // Convert to tile coordinates first, then to chunk coordinates
        const leftTile = Math.floor(left / this.config.tileSize);
        const rightTile = Math.floor(right / this.config.tileSize);
        const topTile = Math.floor(top / this.config.tileSize);
        const bottomTile = Math.floor(bottom / this.config.tileSize);
        
        // Convert tile coordinates to chunk coordinates
        const leftChunk = Math.floor(leftTile / this.config.chunkSize);
        const rightChunk = Math.floor(rightTile / this.config.chunkSize);
        const topChunk = Math.floor(topTile / this.config.chunkSize);
        const bottomChunk = Math.floor(bottomTile / this.config.chunkSize);
        
        // Add all visible chunks
        for (let chunkY = topChunk; chunkY <= bottomChunk; chunkY++) {
            for (let chunkX = leftChunk; chunkX <= rightChunk; chunkX++) {
                chunks.add(this.getChunkKey(chunkX, chunkY));
            }
        }
        
        return Array.from(chunks).map(key => {
            const [x, y] = key.split(',').map(Number);
            return { x, y, key };
        });
    }

    // Clean up distant chunks
    cleanupChunks(keepChunkKeys) {
        for (const key of this.chunkCache.keys()) {
            if (!keepChunkKeys.has(key)) {
                this.chunkCache.delete(key);
            }
        }
    }

    // Get chunks within radius of player
    getChunksInRadius(playerX, playerY, radiusChunks) {
        const playerChunk = this.worldToChunk(playerX / this.config.tileSize, playerY / this.config.tileSize);
        const chunkCount = this.getChunkCount();
        const chunks = [];
        
        for (let dy = -radiusChunks; dy <= radiusChunks; dy++) {
            for (let dx = -radiusChunks; dx <= radiusChunks; dx++) {
                let cx = playerChunk.x + dx;
                let cy = playerChunk.y + dy;
                
                // Only include if chunk is fully within world bounds
                if (cx >= 0 && cx < chunkCount.x && cy >= 0 && cy < chunkCount.y) {
                    chunks.push({ x: cx, y: cy });
                }
            }
        }
        
        return chunks;
    }

    // Get chunk count
    getChunkCount() {
        return { 
            x: this.config.chunkCount, 
            y: this.config.chunkCount, 
            total: this.config.chunkCount * this.config.chunkCount 
        };
    }

    // Render the world
    render(ctx, cameraX, cameraY, viewportWidth, viewportHeight) {
        // Calculate visible chunk range
        const chunkSize = this.config.chunkSize * this.config.tileSize;
        const startChunkX = Math.floor((cameraX - viewportWidth / 2) / chunkSize);
        const endChunkX = Math.floor((cameraX + viewportWidth / 2) / chunkSize);
        const startChunkY = Math.floor((cameraY - viewportHeight / 2) / chunkSize);
        const endChunkY = Math.floor((cameraY + viewportHeight / 2) / chunkSize);

        // Load and render visible chunks
        for (let chunkX = startChunkX; chunkX <= endChunkX; chunkX++) {
            for (let chunkY = startChunkY; chunkY <= endChunkY; chunkY++) {
                const chunk = this.loadChunk(chunkX, chunkY); // Changed from getChunk to loadChunk
                if (chunk) {
                    this.renderChunk(ctx, chunk);
                }
            }
        }
    }

    // Render a single chunk
    renderChunk(ctx, chunk) {
        // Render biome background first
        this.renderBiomeBackgroundSync(ctx, chunk, chunk.biome);
        
        // Render entities on top
        chunk.entities.forEach(entity => {
            if (entity.type === 'letterTile') {
                // Handle the starting position marker
                if (entity.draw) {
                    entity.draw(ctx);
                }
            } else if (entity.render) {
                // Handle entities created by EntityRenderer
                ctx.save();
                ctx.translate(entity.x, entity.y);
                entity.render(ctx);
                ctx.restore();
            }
        });
    }

    // Synchronous biome background rendering (for immediate display)
    renderBiomeBackgroundSync(ctx, chunk, biome) {
        const chunkSize = this.config.chunkSize * this.config.tileSize; // 2048 pixels
        
        console.log(`[World] renderBiomeBackgroundSync called for chunk (${chunk.x}, ${chunk.y}), biome: ${biome}`);
        
        // Try to load the biome background image from asset manager
        if (window.game && window.game.assetManager) {
            // Use the same cache key pattern as entityRenderer
            const cacheKey = `image:background-${biome}`;
            console.log(`[World] Looking for biome image with cache key: ${cacheKey}`);
            
            const biomeImage = window.game.assetManager.imageCache.get(cacheKey);
            console.log(`[World] Asset manager cache lookup result:`, biomeImage);
            
            if (biomeImage && biomeImage.image) {
                const img = biomeImage.image;
                console.log(`[World] Found biome image object:`, img);
                console.log(`[World] Image properties - complete: ${img.complete}, naturalWidth: ${img.naturalWidth}, width: ${img.width}, height: ${img.height}`);
                
                if (img.complete && img.naturalWidth > 0) {
                    console.log(`[World] Drawing biome image at (${chunk.worldX}, ${chunk.worldY}) with size ${chunkSize}x${chunkSize}`);
                    // Draw the biome image to cover the entire chunk
                    ctx.drawImage(img, chunk.worldX, chunk.worldY, chunkSize, chunkSize);
                    console.log(`[World] Successfully drew biome background for ${biome}`);
                    return;
                } else {
                    console.warn(`[World] Biome image not ready - complete: ${img.complete}, naturalWidth: ${img.naturalWidth}`);
                }
            } else {
                console.warn(`[World] No biome image found in asset manager cache for key: ${cacheKey}`);
                console.log(`[World] Available asset manager cache keys:`, Array.from(window.game.assetManager.imageCache.keys()));
            }
        } else {
            console.warn(`[World] Asset manager not available - window.game:`, !!window.game, 'assetManager:', !!window.game?.assetManager);
        }
        
        // Fallback to procedural rendering if asset manager is not available
        console.log(`[World] Falling back to procedural rendering for biome: ${biome}`);
        this.renderBiomeBackgroundFallback(ctx, chunk, biome, chunkSize);
    }

    // Fallback biome background rendering
    renderBiomeBackgroundFallback(ctx, chunk, biome, chunkSize) {
        const tileSize = this.config.tileSize; // 32 pixels
        
        ctx.save();
        
        // Set biome-specific colors and patterns
        if (biome === 'plains') {
            this.renderPlainsBackground(ctx, chunk, chunkSize, tileSize);
        } else if (biome === 'desert') {
            this.renderDesertBackground(ctx, chunk, chunkSize, tileSize);
        }
        
        ctx.restore();
    }

    // Render plains biome background
    renderPlainsBackground(ctx, chunk, chunkSize, tileSize) {
        // Fill entire chunk with base grass color
        ctx.fillStyle = '#8FBC8F';
        ctx.fillRect(chunk.worldX, chunk.worldY, chunkSize, chunkSize);
        
        // Add grass pattern variation across entire chunk
        for (let tileY = 0; tileY < this.config.chunkSize; tileY++) {
            for (let tileX = 0; tileX < this.config.chunkSize; tileX++) {
                const worldTileX = chunk.x * this.config.chunkSize + tileX;
                const worldTileY = chunk.y * this.config.chunkSize + tileY;
                
                // Use hash for deterministic variation
                const hash = this.simpleHash(`${this.config.seed}-${worldTileX}-${worldTileY}`);
                
                if (hash % 4 === 0) {
                    // Add darker grass patches
                    ctx.fillStyle = '#7CB342';
                    const x = chunk.worldX + tileX * tileSize;
                    const y = chunk.worldY + tileY * tileSize;
                    ctx.fillRect(x + 4, y + 4, tileSize - 8, tileSize - 8);
                }
            }
        }
    }

    // Render desert biome background
    renderDesertBackground(ctx, chunk, chunkSize, tileSize) {
        // Fill entire chunk with base sand color
        ctx.fillStyle = '#F4A460';
        ctx.fillRect(chunk.worldX, chunk.worldY, chunkSize, chunkSize);
        
        // Add sand pattern variation across entire chunk
        for (let tileY = 0; tileY < this.config.chunkSize; tileY++) {
            for (let tileX = 0; tileX < this.config.chunkSize; tileX++) {
                const worldTileX = chunk.x * this.config.chunkSize + tileX;
                const worldTileY = chunk.y * this.config.chunkSize + tileY;
                
                // Use hash for deterministic variation
                const hash = this.simpleHash(`${this.config.seed}-${worldTileX}-${worldTileY}`);
                
                if (hash % 3 === 0) {
                    // Add lighter sand patches
                    ctx.fillStyle = '#DEB887';
                    const x = chunk.worldX + tileX * tileSize;
                    const y = chunk.worldY + tileY * tileSize;
                    ctx.fillRect(x + 2, y + 2, tileSize - 4, tileSize - 4);
                }
            }
        }
    }

    // Render grid overlay
    renderGrid(ctx, cameraX, cameraY, cameraWidth, cameraHeight) {
        ctx.save();
        
        const tileSize = this.config.tileSize;
        const left = cameraX - cameraWidth / 2;
        const right = cameraX + cameraWidth / 2;
        const top = cameraY - cameraHeight / 2;
        const bottom = cameraY + cameraHeight / 2;
        
        // Snap to nearest grid line
        const startX = Math.floor(left / tileSize) * tileSize;
        const endX = Math.ceil(right / tileSize) * tileSize;
        const startY = Math.floor(top / tileSize) * tileSize;
        const endY = Math.ceil(bottom / tileSize) * tileSize;
        
        ctx.strokeStyle = '#888';
        ctx.lineWidth = 1;
        ctx.globalAlpha = 0.35;
        
        // Draw vertical lines
        for (let x = startX; x <= endX; x += tileSize) {
            ctx.beginPath();
            ctx.moveTo(x, top);
            ctx.lineTo(x, bottom);
            ctx.stroke();
        }
        
        // Draw horizontal lines
        for (let y = startY; y <= endY; y += tileSize) {
            ctx.beginPath();
            ctx.moveTo(left, y);
            ctx.lineTo(right, y);
            ctx.stroke();
        }
        
        ctx.globalAlpha = 1.0;
        ctx.restore();
    }

    // Simple hash function
    simpleHash(str) {
        let hash = 0;
        const seedStr = str.toString();
        for (let i = 0; i < seedStr.length; i++) {
            const char = seedStr.charCodeAt(i);
            hash = ((hash << 5) - hash) + char;
            hash = hash & hash; // Convert to 32-bit integer
        }
        return Math.abs(hash);
    }

    // Better hash function for more random distribution
    betterHash(str) {
        let hash = 0;
        const seedStr = str.toString();
        for (let i = 0; i < seedStr.length; i++) {
            const char = seedStr.charCodeAt(i);
            hash = ((hash << 5) - hash) + char;
            hash = hash & hash; // Convert to 32-bit integer
        }
        // Add additional mixing for better distribution
        hash = hash ^ (hash >>> 16);
        hash = Math.imul(hash, 0x85ebca6b);
        hash = hash ^ (hash >>> 13);
        hash = Math.imul(hash, 0xc2b2ae35);
        hash = hash ^ (hash >>> 16);
        return Math.abs(hash);
    }

    // Get world info for debugging
    getInfo() {
        const chunkCount = this.getChunkCount();
        return {
            size: `${this.width}x${this.height} pixels`,
            tiles: `${this.config.chunkCount * this.config.chunkSize}x${this.config.chunkCount * this.config.chunkSize} tiles`,
            tileSize: this.config.tileSize,
            seed: this.config.seed,
            chunks: `${chunkCount.x}x${chunkCount.y} chunks`,
            loadedChunks: this.chunkCache.size,
            chunkSize: this.config.chunkSize
        };
    }
} 