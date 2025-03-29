import { InputAction } from '../state/InputState';

/**
 * Defines the mapping between keyboard/mouse event codes and abstract InputActions.
 * This allows easy customization of controls.
 */
export const keyActionMap: Readonly<Record<string, InputAction>> = Object.freeze({
    // Keyboard Movement
    KeyW: InputAction.Forward,
    ArrowUp: InputAction.Forward,
    KeyS: InputAction.Backward,
    ArrowDown: InputAction.Backward,
    KeyA: InputAction.Left,
    ArrowLeft: InputAction.Left,
    KeyD: InputAction.Right,
    ArrowRight: InputAction.Right,
    
    // Keyboard Actions
    Space: InputAction.Jump,
    ShiftLeft: InputAction.Run,
    ShiftRight: InputAction.Run,
    
    // Mouse Actions (Key format: 'Mouse' + (event.button + 1))
    Mouse1: InputAction.Action1, // Left Mouse Button
    // Mouse2: InputAction.Action2, // Right Mouse Button (Example)
    // Mouse3: InputAction.Action3, // Middle Mouse Button (Example)
});

/**
 * Set of key codes whose default browser action should be prevented 
 * when the input system is active and pointer is locked (e.g., spacebar scroll).
 */
export const preventDefaultKeys: ReadonlySet<string> = Object.freeze(new Set([
    'Space', 
    'ArrowUp', 
    'ArrowDown', 
    'ArrowLeft', 
    'ArrowRight'
    // Add other keys like 'Tab' if needed
])); 