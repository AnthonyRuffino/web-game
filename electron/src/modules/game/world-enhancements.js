// Enhanced world features: day/night cycle, weather, atmosphere

export class WorldEnhancements {
    constructor(world) {
        this.world = world;
        this.dayNightCycle = 0; // 0-1, where 0 is dawn, 0.5 is noon, 1 is dusk
        this.cycleSpeed = 0.001; // How fast the day/night cycle progresses
        this.weather = 'clear'; // clear, rain, fog
        this.weatherIntensity = 0; // 0-1 intensity
        this.weatherTimer = 0;
        this.weatherChangeInterval = 30000; // 30 seconds
        
        this.setupWeatherTransitions();
    }

    // Setup weather transition probabilities
    setupWeatherTransitions() {
        this.weatherTransitions = {
            clear: { rain: 0.1, fog: 0.05, clear: 0.85 },
            rain: { clear: 0.3, fog: 0.1, rain: 0.6 },
            fog: { clear: 0.4, rain: 0.2, fog: 0.4 }
        };
    }

    // Update day/night cycle
    updateDayNightCycle(deltaTime) {
        this.dayNightCycle += this.cycleSpeed * deltaTime;
        
        // Wrap around
        if (this.dayNightCycle >= 1) {
            this.dayNightCycle = 0;
        }
    }

    // Update weather conditions
    updateWeather(deltaTime) {
        this.weatherTimer += deltaTime;
        
        if (this.weatherTimer >= this.weatherChangeInterval) {
            this.weatherTimer = 0;
            this.changeWeather();
        }
    }

    // Change weather based on transition probabilities
    changeWeather() {
        const transitions = this.weatherTransitions[this.weather];
        const random = Math.random();
        let cumulative = 0;
        
        for (const [weather, probability] of Object.entries(transitions)) {
            cumulative += probability;
            if (random <= cumulative) {
                this.weather = weather;
                this.weatherIntensity = 0; // Start at 0 intensity
                console.log(`[WorldEnhancements] Weather changed to: ${weather}`);
                break;
            }
        }
    }

    // Get current lighting based on day/night cycle
    getLighting() {
        // Calculate lighting intensity based on time of day
        let intensity = 1;
        
        if (this.dayNightCycle < 0.25) {
            // Dawn: 0 to 1
            intensity = this.dayNightCycle * 4;
        } else if (this.dayNightCycle < 0.75) {
            // Day: 1
            intensity = 1;
        } else {
            // Dusk: 1 to 0
            intensity = 1 - ((this.dayNightCycle - 0.75) * 4);
        }
        
        // Apply weather effects
        if (this.weather === 'rain') {
            intensity *= 0.7;
        } else if (this.weather === 'fog') {
            intensity *= 0.5;
        }
        
        return Math.max(0.1, Math.min(1, intensity));
    }

    // Get sky color based on time of day
    getSkyColor() {
        const cycle = this.dayNightCycle;
        
        if (cycle < 0.25) {
            // Dawn: dark blue to light blue
            const t = cycle * 4;
            return this.interpolateColor('#1a1a2e', '#87CEEB', t);
        } else if (cycle < 0.75) {
            // Day: light blue
            return '#87CEEB';
        } else {
            // Dusk: light blue to dark blue
            const t = (cycle - 0.75) * 4;
            return this.interpolateColor('#87CEEB', '#1a1a2e', t);
        }
    }

    // Interpolate between two colors
    interpolateColor(color1, color2, t) {
        const r1 = parseInt(color1.slice(1, 3), 16);
        const g1 = parseInt(color1.slice(3, 5), 16);
        const b1 = parseInt(color1.slice(5, 7), 16);
        
        const r2 = parseInt(color2.slice(1, 3), 16);
        const g2 = parseInt(color2.slice(3, 5), 16);
        const b2 = parseInt(color2.slice(5, 7), 16);
        
        const r = Math.round(r1 + (r2 - r1) * t);
        const g = Math.round(g1 + (g2 - g1) * t);
        const b = Math.round(b1 + (b2 - b1) * t);
        
        return `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`;
    }

    // Render atmospheric effects
    renderAtmosphere(ctx, cameraX, cameraY, cameraWidth, cameraHeight) {
        ctx.save();
        
        // Apply lighting
        const lighting = this.getLighting();
        ctx.globalAlpha = 1 - lighting;
        ctx.fillStyle = '#000000';
        ctx.fillRect(0, 0, cameraWidth, cameraHeight);
        
        // Render weather effects
        if (this.weather === 'rain') {
            this.renderRain(ctx, cameraWidth, cameraHeight);
        } else if (this.weather === 'fog') {
            this.renderFog(ctx, cameraWidth, cameraHeight);
        }
        
        ctx.restore();
    }

    // Render rain effect
    renderRain(ctx, width, height) {
        ctx.strokeStyle = '#87CEEB';
        ctx.lineWidth = 1;
        ctx.globalAlpha = 0.3;
        
        const raindrops = 100;
        const time = Date.now() * 0.01;
        
        for (let i = 0; i < raindrops; i++) {
            const x = (i * 37) % width;
            const y = (i * 73 + time) % height;
            
            ctx.beginPath();
            ctx.moveTo(x, y);
            ctx.lineTo(x + 2, y + 8);
            ctx.stroke();
        }
    }

    // Render fog effect
    renderFog(ctx, width, height) {
        ctx.fillStyle = '#ffffff';
        ctx.globalAlpha = 0.2;
        
        const fogLayers = 3;
        for (let layer = 0; layer < fogLayers; layer++) {
            const alpha = 0.1 + (layer * 0.05);
            ctx.globalAlpha = alpha;
            
            // Create fog patches
            for (let i = 0; i < 10; i++) {
                const x = (i * 123) % width;
                const y = (i * 456) % height;
                const size = 50 + (i * 20);
                
                ctx.beginPath();
                ctx.arc(x, y, size, 0, Math.PI * 2);
                ctx.fill();
            }
        }
    }

    // Update all enhancements
    update(deltaTime) {
        this.updateDayNightCycle(deltaTime);
        this.updateWeather(deltaTime);
    }

    // Get current time of day as string
    getTimeOfDay() {
        const cycle = this.dayNightCycle;
        
        if (cycle < 0.25) return 'Dawn';
        if (cycle < 0.5) return 'Morning';
        if (cycle < 0.75) return 'Afternoon';
        return 'Evening';
    }

    // Get enhancement statistics for debugging
    getStats() {
        return {
            dayNightCycle: this.dayNightCycle,
            timeOfDay: this.getTimeOfDay(),
            weather: this.weather,
            weatherIntensity: this.weatherIntensity,
            lighting: this.getLighting(),
            skyColor: this.getSkyColor()
        };
    }
} 