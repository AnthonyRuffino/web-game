# Persistence System Design Requirements

## Overview
Design and implement a robust persistence system for the single-player offline game using SQLite with atomic transactions. The system should efficiently track world changes, player progress, and inventory while maintaining performance and data integrity.

## Core Design Principles

### 1. Delta-Based World Persistence
- Store only changes to the procedural world, not full state
- Track final state per cell rather than individual change logs
- Compact redundant changes (add + remove = no record) - But the row can only beremoved completely if there was no procedurally generated entity there to begin with - otherwise we need to track the cell as empty.
- Preserve procedural generation integrity

### 2. Entity-Centric Design
- Everything is an entity (no separate item concept)
- Some entities are placeable, some are not
- Some entities can be harvested intact, some cannot (i.e. harvesting a tree with an axe yields wood blocks - but harvesting a rock will yield a rock as is.)
- Support for entity metadata and custom properties

### 3. Memory-First with Deferred Persistence
- Immediate changes happen in memory for performance
- Batch persistence every 30 seconds (configurable)
- Critical events (level up, equipment) persist immediately
- Manual save functionality

## Database Schema

### Worlds Table
```sql
CREATE TABLE worlds (
    id INTEGER PRIMARY KEY,
    name TEXT UNIQUE NOT NULL,
    seed INTEGER NOT NULL,
    world_width_in_chunks INTEGER NOT NULL,
    world_height_in_chunks INTEGER NOT NULL,
    chunk_edge_length_in_cells INTEGER NOT NULL,
    cell_edge_length_in_pixels INTEGER NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### Entity Types Table (Enum)
```sql
CREATE TABLE entity_types (
    id INTEGER PRIMARY KEY,
    type_name TEXT UNIQUE NOT NULL,
    is_placeable BOOLEAN DEFAULT FALSE,
    can_harvest_intact BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### Characters Table
```sql
CREATE TABLE characters (
    id INTEGER PRIMARY KEY,
    world_id INTEGER REFERENCES worlds(id),
    name TEXT NOT NULL,
    level INTEGER DEFAULT 1,
    experience INTEGER DEFAULT 0,
    position_x REAL,
    position_y REAL,
    last_saved TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### Cell Changes Table (Tracks Modified Cells)
```sql
CREATE TABLE cell_changes (
    id INTEGER PRIMARY KEY,
    world_id INTEGER REFERENCES worlds(id),
    chunk_x INTEGER NOT NULL,
    chunk_y INTEGER NOT NULL,
    cell_x INTEGER NOT NULL, -- chunk-relative (0-63)
    cell_y INTEGER NOT NULL,
    world_x REAL NOT NULL, -- for debugging
    world_y REAL NOT NULL,
    UNIQUE(world_id, chunk_x, chunk_y, cell_x, cell_y)
);
```

### Cell Entities Table (Entities in Modified Cells)
```sql
CREATE TABLE cell_entities (
    id INTEGER PRIMARY KEY,
    cell_changes_id INTEGER REFERENCES cell_changes(id),
    entity_type_id INTEGER REFERENCES entity_types(id),
    metadata TEXT -- JSON for image_config, harvest conditions, etc.
);
```

### Inventory Table
```sql
CREATE TABLE inventory_entities (
    id INTEGER PRIMARY KEY,
    character_id INTEGER REFERENCES characters(id),
    slot_index INTEGER NOT NULL,
    entity_type_id INTEGER REFERENCES entity_types(id),
    quantity INTEGER DEFAULT 1,
    metadata TEXT -- JSON for harvest conditions, image_config, etc.
);
```

## Key Features

### 1. World State Management
- **Procedural Generation**: World generated from seed + configuration (matches existing WORLD_CONFIG)
- **Delta Tracking**: Only store deviations from procedural generation
- **Cell-Based**: Track modified cells, then entities within those cells
- **Lazy Loading**: Load modifications only for chunks within extended radius

### 2. Entity System
- **Unified Entity Model**: Everything is an entity (trees, rocks, wood blocks, tools)
- **Placeable Entities**: Some entities can be placed in world from inventory
- **Harvestable Entities**: Some entities can be harvested intact (like silk touch)
- **Entity Metadata**: Support for custom properties per entity instance

### 3. Inventory System
- **Slot-Based**: Simple N-slot inventory for now
- **Entity Storage**: Store entities with metadata
- **Stacking**: Support for quantity-based stacking
- **Metadata Preservation**: Harvest conditions, custom image configs, etc.

### 4. Transaction Management
- **Memory-First**: Changes happen immediately in memory
- **Batch Persistence**: Configurable auto-save interval (default 30s)
- **Critical Persistence**: Level ups, equipment changes persist immediately
- **Manual Save**: Player-initiated saves
- **Crash Recovery**: Worst case: recent changes lost, but world integrity maintained

## Data Flow Examples

### Tree Harvesting
1. Player chops tree → Tree removed from cell, wood entity added to inventory
2. Memory updated immediately
3. Batch transaction: "Insert/update cell_changes for cell (64,32,15,23), update entire inventory state to reflect what is in memory after the wood was added"
4. If crash: Tree still there, wood not in inventory (acceptable)

### Entity Placement
1. Player places wood block → Wood entity removed from inventory, wood block entity added to cell
2. Memory updated immediately
3. Batch transaction: "Insert/update cell_changes for cell (64,32,15,23), insert cell_entities record for wood_block, update entire inventory state to reflect what is in memory after the wood block was removed"

### Custom Entity Modification
1. Wizard changes tree's fixedScreenAngle → Tree entity modified in cell
2. Memory updated immediately
3. Batch transaction: "Insert/update cell_changes for cell (64,32,15,23), insert/update cell_entities record for tree with custom image_config in metadata"

## Configuration Options

### Persistence Settings
```javascript
const PERSISTENCE_CONFIG = {
    autoSaveInterval: 30000, // 30 seconds
    saveOnCriticalEvents: true,
    manualSaveEnabled: true,
    extendedChunkRadius: 2, // Load chunks beyond visible area
    maxBatchSize: 100 // Maximum changes per batch transaction
};
```

### World Settings
```javascript
const WORLD_CONFIG = {
    chunkSize: 64,
    seed: 12345,
    name: "My World"
};
```

## Future Considerations

### 1. Multi-Cell Entities
- Support for entities larger than 1 cell
- Primary cell tracking with size information
- Collision detection across multiple cells

### 2. Advanced Harvesting
- Tool-based harvesting (pickaxe vs silk touch)
- Skill-based harvesting (strength requirements)
- Conditional harvesting (power gloves, special abilities)

### 3. Entity Relationships
- Parent-child entity relationships
- Container entities (chests, lootable corpses)
- NPC entities with AI state

### 4. Performance Optimizations
- Indexing strategy for chunk queries
- Connection pooling for concurrent access
- Query optimization for large worlds

## Implementation Phases

### Phase 1: Core Persistence
- [ ] Database schema implementation
- [ ] Basic world state tracking
- [ ] Simple inventory system
- [ ] Memory-first transaction system

### Phase 2: Entity System
- [ ] Entity type management
- [ ] Placeable entity support
- [ ] Harvest metadata system
- [ ] Image config persistence

### Phase 3: Advanced Features
- [ ] Multi-cell entity support
- [ ] Advanced harvesting mechanics
- [ ] Performance optimizations
- [ ] Backup and recovery systems

## Technical Requirements

### Database
- SQLite for single-player offline use
- Proper indexing for chunk-based queries
- Foreign key constraints for data integrity
- Transaction support for atomic operations

### Performance
- Sub-100ms chunk loading times
- Memory usage under 100MB for typical worlds
- Smooth 60fps gameplay during persistence operations

### Reliability
- Crash-safe persistence (worst case: recent changes lost)
- Data integrity maintained across sessions
- Proper error handling and logging 