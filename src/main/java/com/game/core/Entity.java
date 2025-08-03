package com.game.core;

/**
 * Represents an entity in the game world.
 * Supports image configuration for rendering customization.
 */
public class Entity {
    private String type;
    private double x;
    private double y;
    private double angle;
    private double size;
    private boolean collision;
    private double collisionWidth;  // Collision box width
    private double collisionHeight; // Collision box height
    private ImageConfiguration imageConfig;

    /**
     * Constructor with type and position.
     * 
     * @param type The entity type
     * @param x X coordinate
     * @param y Y coordinate
     */
    public Entity(String type, double x, double y) {
        this(type, x, y, 0.0, 32.0, true, 32.0, 32.0, null);
    }

    /**
     * Constructor with type, position, and angle.
     * 
     * @param type The entity type
     * @param x X coordinate
     * @param y Y coordinate
     * @param angle Rotation angle in radians
     */
    public Entity(String type, double x, double y, double angle) {
        this(type, x, y, angle, 32.0, true, 32.0, 32.0, null);
    }

    /**
     * Full constructor with all properties.
     * 
     * @param type The entity type
     * @param x X coordinate
     * @param y Y coordinate
     * @param angle Rotation angle in radians
     * @param size Entity size
     * @param collision Whether entity has collision
     * @param collisionWidth Collision box width
     * @param collisionHeight Collision box height
     * @param imageConfig Image configuration (can be null)
     */
    public Entity(String type, double x, double y, double angle, double size, boolean collision, double collisionWidth, double collisionHeight, ImageConfiguration imageConfig) {
        this.type = type;
        this.x = x;
        this.y = y;
        this.angle = angle;
        this.size = size;
        this.collision = collision;
        this.collisionWidth = collisionWidth;
        this.collisionHeight = collisionHeight;
        this.imageConfig = imageConfig;
    }

    // Getters
    public String getType() { return type; }
    public double getX() { return x; }
    public double getY() { return y; }
    public double getAngle() { return angle; }
    public double getSize() { return size; }
    public boolean isCollision() { return collision; }
    public double getCollisionWidth() { return collisionWidth; }
    public double getCollisionHeight() { return collisionHeight; }
    public ImageConfiguration getImageConfig() { return imageConfig; }

    // Setters
    public void setType(String type) { this.type = type; }
    public void setX(double x) { this.x = x; }
    public void setY(double y) { this.y = y; }
    public void setAngle(double angle) { this.angle = angle; }
    public void setSize(double size) { this.size = size; }
    public void setCollision(boolean collision) { this.collision = collision; }
    public void setCollisionWidth(double collisionWidth) { this.collisionWidth = collisionWidth; }
    public void setCollisionHeight(double collisionHeight) { this.collisionHeight = collisionHeight; }
    public void setImageConfig(ImageConfiguration imageConfig) { this.imageConfig = imageConfig; }

    /**
     * Gets the effective image configuration for this entity.
     * Returns the instance configuration if set, otherwise returns null
     * (entity type configuration will be handled by the renderer).
     * 
     * @return The image configuration or null if not set
     */
    public ImageConfiguration getEffectiveImageConfig() {
        return imageConfig;
    }
    
    /**
     * Checks if this entity is collidable.
     * 
     * @return true if the entity has collision enabled
     */
    public boolean isCollidable() {
        return collision;
    }
    
    /**
     * Checks if this entity intersects with the specified rectangular area.
     * Uses AABB (Axis-Aligned Bounding Box) collision detection.
     * 
     * @param x X coordinate of the other area
     * @param y Y coordinate of the other area
     * @param width Width of the other area
     * @param height Height of the other area
     * @return true if the areas intersect
     */
    public boolean intersects(double x, double y, double width, double height) {
        // If this entity has no collision or zero collision dimensions, it cannot intersect
        if (!collision || collisionWidth <= 0 || collisionHeight <= 0) {
            return false;
        }
        
        // If the query area has zero or negative dimensions, it cannot intersect
        if (width <= 0 || height <= 0) {
            return false;
        }
        
        return this.x < x + width && this.x + collisionWidth > x &&
               this.y < y + height && this.y + collisionHeight > y;
    }

    /**
     * Creates a copy of this entity.
     * 
     * @return A new Entity with the same values
     */
    public Entity copy() {
        return new Entity(type, x, y, angle, size, collision, collisionWidth, collisionHeight,
                         imageConfig != null ? imageConfig.copy() : null);
    }

    @Override
    public boolean equals(Object obj) {
        if (this == obj) return true;
        if (obj == null || getClass() != obj.getClass()) return false;
        
        Entity entity = (Entity) obj;
        return Double.compare(entity.x, x) == 0 &&
               Double.compare(entity.y, y) == 0 &&
               Double.compare(entity.angle, angle) == 0 &&
               Double.compare(entity.size, size) == 0 &&
               collision == entity.collision &&
               Double.compare(entity.collisionWidth, collisionWidth) == 0 &&
               Double.compare(entity.collisionHeight, collisionHeight) == 0 &&
               type.equals(entity.type) &&
               (imageConfig == null ? entity.imageConfig == null : imageConfig.equals(entity.imageConfig));
    }

    @Override
    public int hashCode() {
        int result = 17;
        result = 31 * result + type.hashCode();
        result = 31 * result + Double.hashCode(x);
        result = 31 * result + Double.hashCode(y);
        result = 31 * result + Double.hashCode(angle);
        result = 31 * result + Double.hashCode(size);
        result = 31 * result + Boolean.hashCode(collision);
        result = 31 * result + Double.hashCode(collisionWidth);
        result = 31 * result + Double.hashCode(collisionHeight);
        result = 31 * result + (imageConfig != null ? imageConfig.hashCode() : 0);
        return result;
    }

    @Override
    public String toString() {
        return String.format("Entity{type='%s', x=%.2f, y=%.2f, angle=%.2f, size=%.2f, collision=%s, collisionWidth=%.2f, collisionHeight=%.2f, imageConfig=%s}",
                type, x, y, angle, size, collision, collisionWidth, collisionHeight, imageConfig);
    }
} 