import { useInputStore, InputAction } from '../state/InputState';
import { keyActionMap, preventDefaultKeys } from '../config/inputMappings';

/**
 * Manages browser input events (keyboard, mouse, pointer lock)
 * and translates them into abstract actions stored in the InputState store.
 */
export class InputSystem {
    private targetElement: HTMLElement;
    private static instance: InputSystem | null = null; // Singleton pattern might be useful here

    // Bound event handlers to maintain `this` context
    private handleKeyDown = (event: KeyboardEvent): void => this.onKeyDown(event);
    private handleKeyUp = (event: KeyboardEvent): void => this.onKeyUp(event);
    private handlePointerDown = (event: PointerEvent): void => this.onPointerDown(event);
    private handlePointerUp = (event: PointerEvent): void => this.onPointerUp(event);
    private handlePointerMove = (event: MouseEvent): void => this.onPointerMove(event);
    private handlePointerLockChange = (): void => this.onPointerLockChange();
    private handlePointerLockError = (): void => this.onPointerLockError();

    /**
     * @param targetElement The DOM element to attach listeners to (usually the canvas).
     */
    constructor(targetElement: HTMLElement) {
        if (InputSystem.instance) {
            console.warn("InputSystem already instantiated. Returning existing instance.");
            // In a strict singleton, you might throw an error or return the instance.
            // For simplicity here, we allow re-instantiation but it might lead to duplicate listeners
            // if not managed carefully in the Engine.
        }
        this.targetElement = targetElement;
        InputSystem.instance = this;
        console.log('InputSystem initialized.');
    }

    /**
     * Starts listening for input events.
     */
    public start(): void {
        console.log('Starting InputSystem listeners...');
        window.addEventListener('keydown', this.handleKeyDown);
        window.addEventListener('keyup', this.handleKeyUp);
        this.targetElement.addEventListener('pointerdown', this.handlePointerDown);
        window.addEventListener('pointerup', this.handlePointerUp); // Listen on window for release outside canvas
        document.addEventListener('pointerlockchange', this.handlePointerLockChange);
        document.addEventListener('pointerlockerror', this.handlePointerLockError);
        
        // Request pointer lock when the canvas is clicked
        this.targetElement.addEventListener('click', this.requestPointerLock);
    }

    /**
     * Stops listening for input events.
     */
    public stop(): void {
        console.log('Stopping InputSystem listeners...');
        window.removeEventListener('keydown', this.handleKeyDown);
        window.removeEventListener('keyup', this.handleKeyUp);
        this.targetElement.removeEventListener('pointerdown', this.handlePointerDown);
        window.removeEventListener('pointerup', this.handlePointerUp);
        document.removeEventListener('pointerlockchange', this.handlePointerLockChange);
        document.removeEventListener('pointerlockerror', this.handlePointerLockError);
        document.removeEventListener('pointermove', this.handlePointerMove); // Ensure move listener is removed
        this.targetElement.removeEventListener('click', this.requestPointerLock);
        
        // Release pointer lock if active
        if (document.pointerLockElement === this.targetElement) {
            document.exitPointerLock();
        }
        useInputStore.getState().setPointerLocked(false);
        InputSystem.instance = null; // Clear singleton instance on stop
    }

    /**
     * Call this method each frame to reset per-frame state like mouseDelta.
     * Place this *after* other systems have consumed the mouseDelta for the frame.
     */
    public update(): void {
        useInputStore.getState().resetMouseDelta();
    }

    // --- Private Event Handlers ---

    private onKeyDown(event: KeyboardEvent): void {
        if (event.repeat) return;
        const action = keyActionMap[event.code];
        if (action) {
            useInputStore.getState().setAction(action, true);
            
            if (preventDefaultKeys.has(event.code) && useInputStore.getState().isPointerLocked) {
                event.preventDefault();
            }
        }
    }

    private onKeyUp(event: KeyboardEvent): void {
        const action = keyActionMap[event.code];
        if (action) {
            useInputStore.getState().setAction(action, false);
        }
    }

    private onPointerDown(event: PointerEvent): void {
        const actionKey = `Mouse${event.button + 1}`;
        const action = keyActionMap[actionKey]; 
        if (action && useInputStore.getState().isPointerLocked) { 
             useInputStore.getState().setAction(action, true);
        }
    }
    
    private onPointerUp(event: PointerEvent): void {
        const actionKey = `Mouse${event.button + 1}`;
        const action = keyActionMap[actionKey];
        if (action) {
            useInputStore.getState().setAction(action, false);
        }
    }

    private onPointerMove(event: MouseEvent): void {
        if (useInputStore.getState().isPointerLocked) {
            useInputStore.getState().setMouseDelta(event.movementX, event.movementY);
        }
    }

    private requestPointerLock = (): void => {
        if (!useInputStore.getState().isPointerLocked) {
            this.targetElement.requestPointerLock();
        }
    }

    private onPointerLockChange(): void {
        const isLocked = document.pointerLockElement === this.targetElement;
        useInputStore.getState().setPointerLocked(isLocked);
        if (isLocked) {
            console.log('Pointer Locked');
            document.addEventListener('pointermove', this.handlePointerMove);
        } else {
            console.log('Pointer Unlocked');
            document.removeEventListener('pointermove', this.handlePointerMove);
        }
    }

    private onPointerLockError(): void {
        console.error('Pointer Lock Error');
        useInputStore.getState().setPointerLocked(false);
    }
} 