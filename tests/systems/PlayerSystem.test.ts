import { describe, it, expect, vi, beforeEach } from 'vitest';

// Define action constants using string literals to avoid import issues
const ACTIONS = {
  FORWARD: 'FORWARD',
  BACKWARD: 'BACKWARD',
  LEFT: 'LEFT',
  RIGHT: 'RIGHT',
  JUMP: 'JUMP',
  RUN: 'RUN',
  ACTION_1: 'ACTION_1'
};

// Create the mock state with string literals
const mockActions = {
  [ACTIONS.FORWARD]: false,
  [ACTIONS.BACKWARD]: false,
  [ACTIONS.LEFT]: false,
  [ACTIONS.RIGHT]: false,
  [ACTIONS.JUMP]: false,
  [ACTIONS.RUN]: false,
  [ACTIONS.ACTION_1]: false,
};

// Create setAction function mock
const setActionMock = vi.fn();

// Mock the input store
vi.mock('../../src/state/InputState', () => ({
  useInputStore: {
    getState: vi.fn(() => ({
      actions: mockActions,
      setAction: setActionMock
    }))
  }
}));

// Mock Three.js Vector3 methods
vi.mock('three', () => ({
  Vector3: vi.fn().mockImplementation(() => ({
    set: vi.fn().mockReturnThis(),
    normalize: vi.fn().mockReturnThis(),
    multiplyScalar: vi.fn().mockReturnThis(),
    lengthSq: vi.fn().mockReturnValue(0),
    x: 0,
    y: 0,
    z: 0
  })),
  Vector2: vi.fn().mockImplementation(() => ({
    multiplyScalar: vi.fn().mockReturnThis(),
    normalize: vi.fn().mockReturnThis(),
    lengthSq: vi.fn().mockReturnValue(0),
    x: 0,
    y: 0
  }))
}));

// Now import PlayerSystem after mocks are set up
import { PlayerSystem } from '../../src/systems/PlayerSystem';

describe('PlayerSystem', () => {
  let playerSystem: PlayerSystem;
  let mockRigidBody: any;
  
  beforeEach(() => {
    // Reset the mock state before each test
    Object.keys(mockActions).forEach(key => {
      mockActions[key] = false;
    });
    
    vi.clearAllMocks();
    
    // Create a mock rigid body with the necessary methods
    mockRigidBody = {
      applyImpulse: vi.fn(),
      setLinvel: vi.fn(),
      linvel: vi.fn(() => ({ x: 0, y: 0, z: 0 })),
    };
    
    playerSystem = new PlayerSystem();
  });
  
  it('should apply damping impulse when no movement keys are pressed', () => {
    // Even with no movement keys, damping may be applied
    playerSystem.update(mockRigidBody, 0.016);
    
    // Expect setLinvel to be called for damping
    expect(mockRigidBody.setLinvel).toHaveBeenCalled();
  });
  
  it('should apply forward impulse when forward key is pressed', () => {
    // Set the forward action to true
    mockActions[ACTIONS.FORWARD] = true;
    
    playerSystem.update(mockRigidBody, 0.016);
    
    expect(mockRigidBody.applyImpulse).toHaveBeenCalled();
    const [impulse, wake] = mockRigidBody.applyImpulse.mock.calls[0];
    
    // Forward is -z direction
    expect(impulse.z).toBeLessThan(0);
    expect(impulse.x).toBe(0);
    expect(impulse.y).toBe(0);
    expect(wake).toBe(true);
  });
  
  it('should apply jump impulse when jump key is pressed and player is on ground', () => {
    // Set the jump action to true
    mockActions[ACTIONS.JUMP] = true;
    
    playerSystem.update(mockRigidBody, 0.016);
    
    // Expect applyImpulse to be called at least once (for the jump)
    expect(mockRigidBody.applyImpulse).toHaveBeenCalled();
    
    // Find the jump impulse (y > 0)
    const jumpCall = mockRigidBody.applyImpulse.mock.calls.find(
      call => call[0].y > 0
    );
    
    expect(jumpCall).toBeDefined();
    const [impulse, wake] = jumpCall;
    
    // Jump is +y direction
    expect(impulse.y).toBeGreaterThan(0);
    expect(impulse.x).toBe(0);
    expect(impulse.z).toBe(0);
    expect(wake).toBe(true);
    
    // Should reset jump action
    expect(setActionMock).toHaveBeenCalledWith(ACTIONS.JUMP, false);
  });
  
  it('should apply diagonal impulse when two direction keys are pressed', () => {
    // Set forward and right actions to true
    mockActions[ACTIONS.FORWARD] = true;
    mockActions[ACTIONS.RIGHT] = true;
    
    playerSystem.update(mockRigidBody, 0.016);
    
    expect(mockRigidBody.applyImpulse).toHaveBeenCalled();
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
  });
}); 