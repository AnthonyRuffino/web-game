// Entity interaction system

export class InteractionSystem {
    constructor() {
        this.interactions = new Map();
        this.interactionRange = 40; // Distance player can interact with entities
        this.setupDefaultInteractions();
    }

    // Setup default interactions for different entity types
    setupDefaultInteractions() {
        // Tree interaction - collect wood
        this.registerInteraction('tree', {
            name: 'Chop Tree',
            action: (player, entity) => {
                console.log('[Interaction] Chopping tree for wood');
                // TODO: Add wood to player inventory
                return { success: true, message: 'You collected some wood!' };
            },
            canInteract: (player, entity) => {
                return true; // Can always chop trees
            }
        });

        // Rock interaction - collect stone
        this.registerInteraction('rock', {
            name: 'Mine Rock',
            action: (player, entity) => {
                console.log('[Interaction] Mining rock for stone');
                // TODO: Add stone to player inventory
                return { success: true, message: 'You collected some stone!' };
            },
            canInteract: (player, entity) => {
                return true; // Can always mine rocks
            }
        });

        // Grass interaction - collect grass
        this.registerInteraction('grass', {
            name: 'Gather Grass',
            action: (player, entity) => {
                console.log('[Interaction] Gathering grass');
                // TODO: Add grass to player inventory
                return { success: true, message: 'You gathered some grass!' };
            },
            canInteract: (player, entity) => {
                return true; // Can always gather grass
            }
        });
    }

    // Register interaction for entity type
    registerInteraction(entityType, interaction) {
        this.interactions.set(entityType, interaction);
    }

    // Handle player interaction with entity
    handleInteraction(player, entity) {
        const interaction = this.interactions.get(entity.type);
        
        if (!interaction) {
            return { success: false, message: 'You cannot interact with this.' };
        }

        if (!interaction.canInteract(player, entity)) {
            return { success: false, message: 'You cannot interact with this right now.' };
        }

        return interaction.action(player, entity);
    }

    // Get entities player can interact with
    getInteractableEntities(world, player) {
        const interactableEntities = [];
        
        // Check all entities in loaded chunks
        for (const chunk of world.chunkCache.values()) {
            if (chunk.entities && Array.isArray(chunk.entities)) {
                for (const entity of chunk.entities) {
                    const distance = this.getDistance(player, entity);
                    
                    if (distance <= this.interactionRange) {
                        const interaction = this.interactions.get(entity.type);
                        if (interaction && interaction.canInteract(player, entity)) {
                            interactableEntities.push({
                                entity,
                                distance,
                                interaction
                            });
                        }
                    }
                }
            }
        }
        
        // Sort by distance (closest first)
        interactableEntities.sort((a, b) => a.distance - b.distance);
        
        return interactableEntities;
    }

    // Get distance between player and entity
    getDistance(player, entity) {
        const dx = player.x - entity.x;
        const dy = player.y - entity.y;
        return Math.sqrt(dx * dx + dy * dy);
    }

    // Check if player is in range to interact with entity
    isInInteractionRange(player, entity) {
        const distance = this.getDistance(player, entity);
        return distance <= this.interactionRange;
    }

    // Get closest interactable entity
    getClosestInteractable(world, player) {
        const interactableEntities = this.getInteractableEntities(world, player);
        return interactableEntities.length > 0 ? interactableEntities[0] : null;
    }

    // Render interaction indicators
    renderInteractionIndicators(ctx, world, player) {
        const interactableEntities = this.getInteractableEntities(world, player);
        
        ctx.save();
        
        for (const { entity, distance, interaction } of interactableEntities) {
            // Draw interaction range indicator
            ctx.strokeStyle = '#00ff00';
            ctx.lineWidth = 2;
            ctx.globalAlpha = 0.3;
            ctx.beginPath();
            ctx.arc(entity.x, entity.y, this.interactionRange, 0, Math.PI * 2);
            ctx.stroke();
        }
        
        ctx.restore();
        
        // Store interaction data for UI rendering (text will be rendered in screen space)
        this.currentInteractions = interactableEntities;
    }

    // Render interaction text in screen space (called from UI layer)
    renderInteractionText(ctx, camera) {
        if (!this.currentInteractions || this.currentInteractions.length === 0) return;
        
        ctx.save();
        
        for (const { entity, distance, interaction } of this.currentInteractions) {
            if (distance <= this.interactionRange) {
                // Convert world position to screen position
                const screenPos = camera.worldToScreen(entity.x, entity.y);
                
                ctx.fillStyle = '#ffffff';
                ctx.font = '14px Arial';
                ctx.textAlign = 'center';
                ctx.globalAlpha = 0.8;
                ctx.fillText(interaction.name, screenPos.x, screenPos.y - 30);
                
                // Draw key hint
                ctx.font = '12px Arial';
                ctx.fillText('Press E', screenPos.x, screenPos.y - 15);
            }
        }
        
        ctx.restore();
    }

    // Handle keyboard input for interactions
    handleInput(world, player, key) {
        if (key === 'e' || key === 'E') {
            const closest = this.getClosestInteractable(world, player);
            
            if (closest) {
                const result = this.handleInteraction(player, closest.entity);
                
                // Show interaction result
                if (result.success) {
                    this.showInteractionMessage(result.message);
                } else {
                    this.showInteractionMessage(result.message, 'error');
                }
                
                return result;
            }
        }
        
        return null;
    }

    // Show interaction message (placeholder for UI system)
    showInteractionMessage(message, type = 'success') {
        // TODO: Integrate with UI system
        console.log(`[Interaction] ${type.toUpperCase()}: ${message}`);
        
        // For now, just log to console
        // Later this will show in-game UI
    }

    // Get interaction statistics for debugging
    getInteractionStats(world, player) {
        const interactableEntities = this.getInteractableEntities(world, player);
        const closest = this.getClosestInteractable(world, player);
        
        return {
            totalInteractable: interactableEntities.length,
            closestEntity: closest ? closest.entity.type : null,
            closestDistance: closest ? closest.distance : null,
            interactionRange: this.interactionRange
        };
    }
} 