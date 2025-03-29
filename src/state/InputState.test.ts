import { describe, it, expect, beforeEach } from 'vitest';
import { useInputStore, InputAction } from './InputState';

// Get the initial state once for comparison
const initialState = useInputStore.getState();

describe('InputState Store', () => {

    // Reset store state before each test to ensure isolation
    beforeEach(() => {
        useInputStore.setState(initialState, true); // Replace state with initial state
    });

    it('should have correct initial state', () => {
        const state = useInputStore.getState();

        // Check all actions are initially false
        Object.values(InputAction).forEach(action => {
            expect(state.actions[action]).toBe(false);
        });

        // Check mouse delta is zero
        expect(state.mouseDelta).toEqual({ x: 0, y: 0 });

        // Check pointer lock is initially false
        expect(state.isPointerLocked).toBe(false);
    });

    it('should update action state with setAction', () => {
        const actionToTest = InputAction.Forward;
        
        // Set action to true
        useInputStore.getState().setAction(actionToTest, true);
        expect(useInputStore.getState().actions[actionToTest]).toBe(true);

        // Set action back to false
        useInputStore.getState().setAction(actionToTest, false);
        expect(useInputStore.getState().actions[actionToTest]).toBe(false);
    });

    it('should accumulate mouse delta with setMouseDelta', () => {
        useInputStore.getState().setMouseDelta(10, -5);
        expect(useInputStore.getState().mouseDelta).toEqual({ x: 10, y: -5 });

        useInputStore.getState().setMouseDelta(3, 2);
        expect(useInputStore.getState().mouseDelta).toEqual({ x: 13, y: -3 }); // Accumulates
    });

    it('should reset mouse delta with resetMouseDelta', () => {
        useInputStore.getState().setMouseDelta(15, 25);
        expect(useInputStore.getState().mouseDelta).not.toEqual({ x: 0, y: 0 });

        useInputStore.getState().resetMouseDelta();
        expect(useInputStore.getState().mouseDelta).toEqual({ x: 0, y: 0 });
    });

    it('should update pointer lock state with setPointerLocked', () => {
        useInputStore.getState().setPointerLocked(true);
        expect(useInputStore.getState().isPointerLocked).toBe(true);

        useInputStore.getState().setPointerLocked(false);
        expect(useInputStore.getState().isPointerLocked).toBe(false);
    });

    it('should reset movement actions when pointer lock is set to false', () => {
        // Set some movement actions to true while locked
        useInputStore.getState().setPointerLocked(true);
        useInputStore.getState().setAction(InputAction.Forward, true);
        useInputStore.getState().setAction(InputAction.Left, true);
        expect(useInputStore.getState().actions[InputAction.Forward]).toBe(true);
        expect(useInputStore.getState().actions[InputAction.Left]).toBe(true);

        // Unlock the pointer
        useInputStore.getState().setPointerLocked(false);
        expect(useInputStore.getState().isPointerLocked).toBe(false);

        // Verify movement actions were reset
        expect(useInputStore.getState().actions[InputAction.Forward]).toBe(false);
        expect(useInputStore.getState().actions[InputAction.Backward]).toBe(false);
        expect(useInputStore.getState().actions[InputAction.Left]).toBe(false);
        expect(useInputStore.getState().actions[InputAction.Right]).toBe(false);

        // Verify non-movement actions were NOT reset
        // Set Action1 *before* unlock, ensure it stays
        useInputStore.getState().setPointerLocked(true); // Lock
        useInputStore.getState().setAction(InputAction.Action1, true); // Set Action1
        useInputStore.getState().setPointerLocked(false); // Unlock
        expect(useInputStore.getState().actions[InputAction.Action1]).toBe(true); // Action1 should persist
    });

}); 