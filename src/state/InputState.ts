import { create } from 'zustand';

// Define input actions using an enum for better type safety and clarity
export enum InputAction {
    Forward = 'FORWARD',
    Backward = 'BACKWARD',
    Left = 'LEFT',
    Right = 'RIGHT',
    Jump = 'JUMP',
    Run = 'RUN',
    Action1 = 'ACTION_1'
}

// Define the structure of the input state
// Export the interface for clarity and potential use elsewhere
export interface InputState {
    // Use the enum as the key type
    actions: Record<InputAction, boolean>;
    // Mouse movement delta for the current frame
    mouseDelta: { x: number; y: number };
    // Is the pointer currently locked to the game canvas?
    isPointerLocked: boolean;

    // Actions to modify the state
    setAction: (action: InputAction, value: boolean) => void;
    setMouseDelta: (deltaX: number, deltaY: number) => void;
    resetMouseDelta: () => void;
    setPointerLocked: (isLocked: boolean) => void;
}

/**
 * Zustand store for managing user input state.
 */
export const useInputStore = create<InputState>((set, get) => ({
    // Initialize actions using enum members
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
            // Use computed property names with the enum
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
                        // Reset using enum members
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

// Selectors now use the enum
export const getInputState = (): InputState => useInputStore.getState();
export const getActionState = (action: InputAction): boolean => useInputStore.getState().actions[action];
export const getMouseDelta = (): { x: number; y: number } => useInputStore.getState().mouseDelta;
export const getIsPointerLocked = (): boolean => useInputStore.getState().isPointerLocked; 