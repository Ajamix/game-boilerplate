import { Time } from './Time';
import { UpdateCallback, RenderCallback } from '../types/Loop.types';

/**
 * Manages the main game loop using requestAnimationFrame.
 * Handles time updates and separates update logic from render logic.
 */
export class Loop {
    private time: Time;
    private updateCallbacks: UpdateCallback[] = [];
    private renderCallbacks: RenderCallback[] = [];
    private isRunning: boolean = false;
    private rafId: number | null = null;

    constructor() {
        this.time = new Time();
    }

    /**
     * Add a function to be called on every update step.
     * @param callback Function implementing the UpdateCallback interface.
     */
    public onUpdate(callback: UpdateCallback): void {
        this.updateCallbacks.push(callback);
    }

    /**
     * Add a function to be called on every render step.
     * @param callback Function implementing the RenderCallback interface.
     */
    public onRender(callback: RenderCallback): void {
        this.renderCallbacks.push(callback);
    }

    /**
     * Starts the game loop.
     */
    public start(): void {
        if (this.isRunning) return;
        this.isRunning = true;
        this.rafId = requestAnimationFrame(this.tick);
        console.log('Game loop started.');
    }

    /**
     * Stops the game loop.
     */
    public stop(): void {
        if (!this.isRunning || this.rafId === null) return;
        cancelAnimationFrame(this.rafId);
        this.isRunning = false;
        this.rafId = null;
        console.log('Game loop stopped.');
    }

    // Private tick method bound to the instance
    private tick = (): void => {
        if (!this.isRunning) return;

        this.time.update();

        // --- Update Step ---
        for (const callback of this.updateCallbacks) {
            callback(this.time.delta, this.time.elapsed);
        }

        // --- Render Step ---
        for (const callback of this.renderCallbacks) {
            callback();
        }

        // Request next frame
        this.rafId = requestAnimationFrame(this.tick);
    }
} 