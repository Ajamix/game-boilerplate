/**
 * Types related to the game loop system
 */

/**
 * Function signature for callbacks that run during the update phase of the game loop
 */
export interface UpdateCallback {
    (delta: number, elapsed: number): void;
}

/**
 * Function signature for callbacks that run during the render phase of the game loop
 */
export interface RenderCallback {
    (): void;
} 