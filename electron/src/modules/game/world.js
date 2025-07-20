// World generation and management system

import { GrassEntity } from './entities/grass.js';
import { TreeEntity } from './entities/tree.js';
import { RockEntity } from './entities/rock.js';

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

        // Generate tiles for this chunk
        const startTileX = chunkX * this.config.chunkSize;
        const startTileY = chunkY * this.config.chunkSize;
        const endTileX = Math.min(startTileX + this.config.chunkSize, this.config.chunkCount * this.config.chunkSize);
        const endTileY = Math.min(startTileY + this.config.chunkSize, this.config.chunkCount * this.config.chunkSize);

        for (let tileY = startTileY; tileY < endTileY; tileY++) {
            for (let tileX = startTileX; tileX < endTileX; tileX++) {
                // Generate tile
                const tile = this.generateTile(tileX, tileY);
                chunk.tiles.push(tile);
                
                // Generate grass tiles deterministically
                if (this.shouldPlaceGrass(tileX, tileY)) {
                    const grassX = tileX * this.config.tileSize + this.config.tileSize / 2;
                    const grassY = tileY * this.config.tileSize + this.config.tileSize / 2;
                    
                    const grassEntity = GrassEntity.create({
                        x: grassX,
                        y: grassY,
                        tileX: tileX,
                        tileY: tileY
                    });
                    
                    chunk.entities.push(grassEntity);
                }
                
                // Generate trees and rocks deterministically
                if (this.shouldPlaceTree(tileX, tileY)) {
                    const treeX = tileX * this.config.tileSize + this.config.tileSize / 2;
                    const treeY = tileY * this.config.tileSize + this.config.tileSize / 2;
                    
                    const treeEntity = TreeEntity.create({
                        x: treeX,
                        y: treeY,
                        tileX: tileX,
                        tileY: tileY,
                        collision: true,
                        collisionRadius: 18
                    });
                    
                    chunk.entities.push(treeEntity);
                }
                
                if (this.shouldPlaceRock(tileX, tileY)) {
                    const rockX = tileX * this.config.tileSize + this.config.tileSize / 2;
                    const rockY = tileY * this.config.tileSize + this.config.tileSize / 2;
                    
                    const rockEntity = RockEntity.create({
                        x: rockX,
                        y: rockY,
                        tileX: tileX,
                        tileY: tileY,
                        collision: true,
                        collisionRadius: 12
                    });
                    
                    chunk.entities.push(rockEntity);
                }
            }
        }

        return chunk;
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

    // Render world
    render(ctx, cameraX, cameraY, cameraWidth, cameraHeight) {
        // Draw world boundary
        ctx.strokeStyle = '#ff0000';
        ctx.lineWidth = 3;
        ctx.strokeRect(0, 0, this.width, this.height);

        // Load and render chunks within keepDistance of the player
        const keepDistance = this.config.keepDistance;
        const chunksToLoad = this.getChunksInRadius(cameraX, cameraY, keepDistance);
        const keepChunkKeys = new Set();
        
        for (const {x, y} of chunksToLoad) {
            const chunk = this.loadChunk(x, y);
            this.renderChunk(ctx, chunk);
            keepChunkKeys.add(this.getChunkKey(x, y));
        }

        // Clean up distant chunks
        this.cleanupChunks(keepChunkKeys);

        // Render grid overlay if enabled
        if (this.showGrid) {
            this.renderGrid(ctx, cameraX, cameraY, cameraWidth, cameraHeight);
        }
    }

    // Render a single chunk
    renderChunk(ctx, chunk) {
        // Render chunk entities
        if (chunk.entities && Array.isArray(chunk.entities)) {
            // Sort entities for correct render order:
            // 1. Grass
            // 2. Non-fixedScreenAngle entities
            // 3. fixedScreenAngle entities sorted by Y position
            const grassEntities = chunk.entities.filter(e => e.type === 'grass');
            const fixedAngleEntities = chunk.entities.filter(e => e.fixedScreenAngle !== null && e.fixedScreenAngle !== undefined);
            const otherEntities = chunk.entities.filter(e => e.type !== 'grass' && (e.fixedScreenAngle === null || e.fixedScreenAngle === undefined));
            
            fixedAngleEntities.sort((a, b) => b.y - a.y);
            const renderOrder = grassEntities.concat(otherEntities, fixedAngleEntities);
            
            renderOrder.forEach(entity => {
                entity.render(ctx);
            });
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