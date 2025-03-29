import { InputActionValue } from '../enums/InputAction';

/**
 * State and actions for the input system
 */
export interface InputState {
    /** Map of input actions to their current state (pressed or not) */
    actions: Record<InputActionValue, boolean>; 
    
    /** Mouse movement delta since last frame */
    mouseDelta: { x: number; y: number };
    
    /** Whether the pointer is currently locked */
    isPointerLocked: boolean;

    /** Set the state of an input action */
    setAction: (action: InputActionValue, value: boolean) => void;
    
    /** Set the mouse movement delta */
    setMouseDelta: (deltaX: number, deltaY: number) => void;
    
    /** Reset the mouse delta (typically called each frame after processing) */
    resetMouseDelta: () => void;
    
    /** Set whether the pointer is locked */
    setPointerLocked: (isLocked: boolean) => void;
} 