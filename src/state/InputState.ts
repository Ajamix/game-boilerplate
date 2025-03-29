import { create } from 'zustand';
// Import the action constants and value type
import { InputAction, InputActionValue } from '../enums/InputAction'; 
import { InputState as IInputState } from '../types/Input.types';

/* --- Definitions Moved to src/enums/InputAction.ts ---
// Define input actions using a const object map instead of enum
export const InputAction = {
    Forward: 'FORWARD',
    Backward: 'BACKWARD',
    Left: 'LEFT',
    Right: 'RIGHT',
    Jump: 'JUMP',
    Run: 'RUN',
    Action1: 'ACTION_1'
} as const; // Use 'as const' for stricter typing

// Type representing the values of the InputAction object
export type InputActionValue = typeof InputAction[keyof typeof InputAction];
*/

/**
 * Zustand store for managing user input state.
 */
export const useInputStore = create<IInputState>((set, get) => ({
    // Initialize actions using object values
    actions: {
        [InputAction.Forward]: false,
        [InputAction.Backward]: false,
        [InputAction.Left]: false,
        [InputAction.Right]: false,
        [InputAction.Jump]: false,
        [InputAction.Run]: false,
        [InputAction.Action1]: false,
    },
    mouseDelta: { x: 0, y: 0 },
    isPointerLocked: false,

    setAction: (action, value) =>
        set((state) => ({
            // Key access remains the same
            actions: { ...state.actions, [action]: value },
        })),

    setMouseDelta: (deltaX, deltaY) =>
        set((state) => ({
            mouseDelta: { x: state.mouseDelta.x + deltaX, y: state.mouseDelta.y + deltaY },
        })),
    
    // Reset delta, typically called each frame *after* processing input
    resetMouseDelta: () => 
        set({ mouseDelta: { x: 0, y: 0 } }),

    setPointerLocked: (isLocked) => {
        if (get().isPointerLocked !== isLocked) { // Only update if changed
            set({ isPointerLocked: isLocked });
            if (!isLocked) {
                // Reset movement actions when pointer unlocks to prevent continuous movement
                set((state) => ({
                    actions: {
                        ...state.actions,
                        // Reset using object values
                        [InputAction.Forward]: false,
                        [InputAction.Backward]: false,
                        [InputAction.Left]: false,
                        [InputAction.Right]: false,
                    }
                }));
                console.log('Pointer unlocked, movement actions reset.');
            }
        }
    },
}));

// Selectors now use the value type
export const getInputState = (): IInputState => useInputStore.getState();
export const getActionState = (action: InputActionValue): boolean => useInputStore.getState().actions[action];
export const getMouseDelta = (): { x: number; y: number } => useInputStore.getState().mouseDelta;
export const getIsPointerLocked = (): boolean => useInputStore.getState().isPointerLocked; 