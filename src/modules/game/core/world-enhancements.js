// Enhanced world features: day/night cycle, weather, atmosphere

export class WorldEnhancements {
    constructor(world) {
        this.world = world;
        
        // Day/night cycle configuration
        this.dayNightCycle = {
            // Start in daytime (morning) instead of dawn
            currentTime: 0.25, // 0.0 = dawn, 0.25 = morning, 0.5 = afternoon, 0.75 = evening, 1.0 = night
            cycleDuration: 60000, // 1 minute per period (4 minutes total cycle)
            periods: {
                dawn: { start: 0.0, end: 0.25, duration: 60000 },
                morning: { start: 0.25, end: 0.5, duration: 60000 },
                afternoon: { start: 0.5, end: 0.75, duration: 60000 },
                evening: { start: 0.75, end: 1.0, duration: 60000 }
            }
        };
        
        // Weather system
        this.weather = {
            type: 'clear',
            intensity: 0.0,
            windSpeed: 0.0,
            windDirection: 0.0
        };
        
        // Atmospheric effects (stationary with parallax)
        this.atmosphere = {
            fog: {
                enabled: true,
                density: 0.3,
                color: '#87CEEB',
                parallaxFactor: 0.1 // Slow parallax movement
            },
            lighting: {
                enabled: true,
                intensity: 1.0,
                color: '#FFFFFF'
            }
        };
        
        this.lastUpdate = performance.now();
    }

    update(deltaTime) {
        const currentTime = performance.now();
        const elapsed = currentTime - this.lastUpdate;
        this.lastUpdate = currentTime;
        
        // Update day/night cycle
        this.updateDayNightCycle(elapsed);
        
        // Update weather
        this.updateWeather(elapsed);
    }

    updateDayNightCycle(elapsed) {
        const cycle = this.dayNightCycle;
        cycle.currentTime += elapsed / cycle.cycleDuration;
        
        // Wrap around
        if (cycle.currentTime >= 1.0) {
            cycle.currentTime -= 1.0;
        }
    }

    updateWeather(elapsed) {
        // Simple weather changes
        if (Math.random() < 0.001) { // 0.1% chance per frame
            const weatherTypes = ['clear', 'cloudy', 'rainy', 'foggy'];
            this.weather.type = weatherTypes[Math.floor(Math.random() * weatherTypes.length)];
        }
    }

    // Render atmospheric effects (stationary with parallax)
    renderAtmosphere(ctx, cameraX, cameraY, viewportWidth, viewportHeight) {
        // Apply parallax effect - atmosphere moves slower than camera
        const parallaxX = cameraX * this.atmosphere.fog.parallaxFactor;
        const parallaxY = cameraY * this.atmosphere.fog.parallaxFactor;
        
        // Get current lighting based on time of day
        const lighting = this.getCurrentLighting();
        
        // Apply global lighting overlay
        if (this.atmosphere.lighting.enabled) {
            this.renderLighting(ctx, viewportWidth, viewportHeight, lighting);
        }
        
        // Render fog (stationary with parallax)
        if (this.atmosphere.fog.enabled) {
            this.renderFog(ctx, parallaxX, parallaxY, viewportWidth, viewportHeight);
        }
    }

    renderLighting(ctx, width, height, lighting) {
        // Create a lighting overlay based on time of day
        const gradient = ctx.createRadialGradient(width/2, height/2, 0, width/2, height/2, Math.max(width, height)/2);
        
        // Adjust lighting based on time of day
        const timeOfDay = this.getTimeOfDay();
        let alpha = 0.1; // Base alpha
        
        switch (timeOfDay) {
            case 'dawn':
                gradient.addColorStop(0, `rgba(255, 200, 150, ${alpha})`);
                gradient.addColorStop(1, `rgba(255, 150, 100, ${alpha * 2})`);
                break;
            case 'morning':
                gradient.addColorStop(0, `rgba(255, 255, 200, ${alpha * 0.5})`);
                gradient.addColorStop(1, `rgba(255, 255, 150, ${alpha})`);
                break;
            case 'afternoon':
                gradient.addColorStop(0, `rgba(255, 255, 255, ${alpha * 0.3})`);
                gradient.addColorStop(1, `rgba(255, 255, 200, ${alpha * 0.6})`);
                break;
            case 'evening':
                gradient.addColorStop(0, `rgba(255, 180, 120, ${alpha})`);
                gradient.addColorStop(1, `rgba(255, 120, 80, ${alpha * 2})`);
                break;
            case 'night':
                gradient.addColorStop(0, `rgba(50, 50, 150, ${alpha * 3})`);
                gradient.addColorStop(1, `rgba(20, 20, 80, ${alpha * 4})`);
                break;
        }
        
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, width, height);
    }

    renderFog(ctx, parallaxX, parallaxY, width, height) {
        // Create fog effect that's stationary relative to world, not camera
        const fogDensity = this.atmosphere.fog.density;
        const fogColor = this.atmosphere.fog.color;
        
        // Create a subtle fog overlay
        const gradient = ctx.createRadialGradient(
            width/2 + parallaxX * 0.1, 
            height/2 + parallaxY * 0.1, 
            0, 
            width/2 + parallaxX * 0.1, 
            height/2 + parallaxY * 0.1, 
            Math.max(width, height) * 0.8
        );
        
        gradient.addColorStop(0, `rgba(135, 206, 235, ${fogDensity * 0.1})`);
        gradient.addColorStop(0.5, `rgba(135, 206, 235, ${fogDensity * 0.2})`);
        gradient.addColorStop(1, `rgba(135, 206, 235, ${fogDensity * 0.3})`);
        
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, width, height);
    }

    getCurrentLighting() {
        const timeOfDay = this.getTimeOfDay();
        const cycle = this.dayNightCycle;
        
        return {
            intensity: this.getLightingIntensity(timeOfDay),
            color: this.getLightingColor(timeOfDay),
            timeOfDay: timeOfDay
        };
    }

    getLightingIntensity(timeOfDay) {
        switch (timeOfDay) {
            case 'dawn': return 0.6;
            case 'morning': return 1.0;
            case 'afternoon': return 1.0;
            case 'evening': return 0.7;
            case 'night': return 0.2;
            default: return 1.0;
        }
    }

    getLightingColor(timeOfDay) {
        switch (timeOfDay) {
            case 'dawn': return '#FFB366';
            case 'morning': return '#FFFFFF';
            case 'afternoon': return '#FFFFFF';
            case 'evening': return '#FFB366';
            case 'night': return '#1a1a2e';
            default: return '#FFFFFF';
        }
    }

    getTimeOfDay() {
        const time = this.dayNightCycle.currentTime;
        
        if (time < 0.25) return 'dawn';
        if (time < 0.5) return 'morning';
        if (time < 0.75) return 'afternoon';
        if (time < 1.0) return 'evening';
        return 'night';
    }

    getTimeRemaining() {
        const time = this.dayNightCycle.currentTime;
        const currentPeriod = this.getTimeOfDay();
        const periods = this.dayNightCycle.periods;
        
        let timeInCurrentPeriod = 0;
        let periodDuration = 60000; // Default 1 minute
        
        switch (currentPeriod) {
            case 'dawn':
                timeInCurrentPeriod = time / 0.25;
                periodDuration = periods.dawn.duration;
                break;
            case 'morning':
                timeInCurrentPeriod = (time - 0.25) / 0.25;
                periodDuration = periods.morning.duration;
                break;
            case 'afternoon':
                timeInCurrentPeriod = (time - 0.5) / 0.25;
                periodDuration = periods.afternoon.duration;
                break;
            case 'evening':
                timeInCurrentPeriod = (time - 0.75) / 0.25;
                periodDuration = periods.evening.duration;
                break;
        }
        
        const remainingInPeriod = (1 - timeInCurrentPeriod) * periodDuration;
        return Math.ceil(remainingInPeriod / 1000); // Convert to seconds
    }

    getStats() {
        return {
            timeOfDay: this.getTimeOfDay(),
            weather: this.weather.type,
            cycleProgress: Math.round(this.dayNightCycle.currentTime * 100),
            fogEnabled: this.atmosphere.fog.enabled,
            lightingEnabled: this.atmosphere.lighting.enabled
        };
    }
} 