import { describe, it, expect, vi, beforeEach } from 'vitest';
import { PlayerSystem } from '../../src/systems/PlayerSystem';
import { useInputStore } from '../../src/state/InputState';
import { InputAction } from '../../src/enums/InputAction';

// Mock dependencies
vi.mock('../../src/state/InputState', () => {
    const mockState = {
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
        setAction: vi.fn(),
    };
    
    return {
        useInputStore: {
            getState: vi.fn(() => mockState)
        }
    };
});

describe('PlayerSystem', () => {
    let playerSystem: PlayerSystem;
    let mockRigidBody: any;
    
    beforeEach(() => {
        // Reset the mock state before each test
        const mockInputState = useInputStore.getState();
        mockInputState.actions[InputAction.Forward] = false;
        mockInputState.actions[InputAction.Backward] = false;
        mockInputState.actions[InputAction.Left] = false;
        mockInputState.actions[InputAction.Right] = false;
        mockInputState.actions[InputAction.Jump] = false;
        
        // Create a mock rigid body with the necessary methods
        mockRigidBody = {
            applyImpulse: vi.fn(),
            setLinvel: vi.fn(),
            linvel: vi.fn(() => ({ x: 0, y: 0, z: 0 })),
        };
        
        playerSystem = new PlayerSystem();
    });
    
    it('should apply no impulse when no movement keys are pressed', () => {
        playerSystem.update(mockRigidBody, 0.016);
        
        expect(mockRigidBody.applyImpulse).not.toHaveBeenCalled();
    });
    
    it('should apply forward impulse when forward key is pressed', () => {
        // Set the forward action to true
        useInputStore.getState().actions[InputAction.Forward] = true;
        
        playerSystem.update(mockRigidBody, 0.016);
        
        expect(mockRigidBody.applyImpulse).toHaveBeenCalledTimes(1);
        const [impulse, wake] = mockRigidBody.applyImpulse.mock.calls[0];
        
        // Forward is -z direction
        expect(impulse.z).toBeLessThan(0);
        expect(impulse.x).toBe(0);
        expect(impulse.y).toBe(0);
        expect(wake).toBe(true);
    });
    
    it('should apply jump impulse when jump key is pressed and player is on ground', () => {
        // Set the jump action to true
        useInputStore.getState().actions[InputAction.Jump] = true;
        
        playerSystem.update(mockRigidBody, 0.016);
        
        expect(mockRigidBody.applyImpulse).toHaveBeenCalledTimes(1);
        const [impulse, wake] = mockRigidBody.applyImpulse.mock.calls[0];
        
        // Jump is +y direction
        expect(impulse.y).toBeGreaterThan(0);
        expect(impulse.x).toBe(0);
        expect(impulse.z).toBe(0);
        expect(wake).toBe(true);
        
        // Should reset jump action
        expect(useInputStore.getState().setAction).toHaveBeenCalledWith(InputAction.Jump, false);
    });
    
    it('should apply diagonal impulse when two direction keys are pressed', () => {
        // Set forward and right actions to true
        useInputStore.getState().actions[InputAction.Forward] = true;
        useInputStore.getState().actions[InputAction.Right] = true;
        
        playerSystem.update(mockRigidBody, 0.016);
        
        expect(mockRigidBody.applyImpulse).toHaveBeenCalledTimes(1);
        const [impulse, wake] = mockRigidBody.applyImpulse.mock.calls[0];
        
        // Forward-right is -z and +x
        expect(impulse.z).toBeLessThan(0);
        expect(impulse.x).toBeGreaterThan(0);
        expect(impulse.y).toBe(0);
        expect(wake).toBe(true);
        
        // The vector should be normalized (approximately, accounting for float precision)
        const magnitude = Math.sqrt(impulse.x*impulse.x + impulse.z*impulse.z);
        const normalizedX = impulse.x / magnitude;
        const normalizedZ = impulse.z / magnitude;
        
        // Check if values are close to 1/sqrt(2) ≈ 0.7071
        expect(Math.abs(normalizedX)).toBeCloseTo(1/Math.sqrt(2), 1);
        expect(Math.abs(normalizedZ)).toBeCloseTo(1/Math.sqrt(2), 1);
    });
    
    it('should limit velocity when exceeding max speed', () => {
        // Mock a high velocity
        mockRigidBody.linvel.mockReturnValue({ x: 10, y: 0, z: 10 });
        
        playerSystem.update(mockRigidBody, 0.016);
        
        expect(mockRigidBody.setLinvel).toHaveBeenCalled();
        const [velocityArg] = mockRigidBody.setLinvel.mock.calls[0];
        
        // The velocity should be limited to maxSpeed
        const horizontalMagnitude = Math.sqrt(velocityArg.x*velocityArg.x + velocityArg.z*velocityArg.z);
        expect(horizontalMagnitude).toBeLessThanOrEqual(5.1); // Allow a small margin of error
    });
}); 