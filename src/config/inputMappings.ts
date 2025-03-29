import { InputAction, InputActionValue } from '../enums/InputAction';
import { KeyboardKey, MouseButton } from '../enums/KeyboardKeys';

/**
 * Defines the mapping between keyboard/mouse event codes and abstract InputActions.
 * This allows easy customization of controls.
 */
export const keyActionMap: Readonly<Record<string, InputActionValue>> = Object.freeze({
    // Keyboard Movement
    [KeyboardKey.KeyW]: InputAction.Forward,
    [KeyboardKey.ArrowUp]: InputAction.Forward,
    [KeyboardKey.KeyS]: InputAction.Backward,
    [KeyboardKey.ArrowDown]: InputAction.Backward,
    [KeyboardKey.KeyA]: InputAction.Left,
    [KeyboardKey.ArrowLeft]: InputAction.Left,
    [KeyboardKey.KeyD]: InputAction.Right,
    [KeyboardKey.ArrowRight]: InputAction.Right,
    
    // Keyboard Actions
    [KeyboardKey.Space]: InputAction.Jump,
    [KeyboardKey.ShiftLeft]: InputAction.Run,
    [KeyboardKey.ShiftRight]: InputAction.Run,
    
    // Mouse Actions
    [MouseButton.Left]: InputAction.Action1, // Left Mouse Button
    // [MouseButton.Right]: InputAction.Action2, // Right Mouse Button (Example)
    // [MouseButton.Middle]: InputAction.Action3, // Middle Mouse Button (Example)
});

/**
 * Set of key codes whose default browser action should be prevented 
 * when the input system is active and pointer is locked (e.g., spacebar scroll).
 */
export const preventDefaultKeys: ReadonlySet<string> = Object.freeze(new Set([
    KeyboardKey.Space, 
    KeyboardKey.ArrowUp, 
    KeyboardKey.ArrowDown, 
    KeyboardKey.ArrowLeft, 
    KeyboardKey.ArrowRight
    // Add other keys like KeyboardKey.Tab if needed
])); 