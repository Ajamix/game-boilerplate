/**
 * Manages time-related variables for the game loop, such as delta time and elapsed time.
 */
export class Time {
    private previousTime: number;
    public delta: number; // Time in seconds since the last frame
    public elapsed: number; // Total time in seconds since the start

    constructor() {
        this.previousTime = performance.now();
        this.delta = 0;
        this.elapsed = 0;
    }

    /**
     * Updates the delta and elapsed time. Should be called once per frame.
     */
    public update(): void {
        const currentTime = performance.now();
        this.delta = (currentTime - this.previousTime) / 1000; // Convert ms to seconds
        
        // Clamp delta time to avoid large jumps (e.g., when debugging)
        this.delta = Math.min(this.delta, 0.1);
        
        // Use clamped delta time to update elapsed time
        this.elapsed += this.delta;
        this.previousTime = currentTime;
    }
} 