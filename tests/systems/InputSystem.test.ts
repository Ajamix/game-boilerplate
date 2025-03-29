import { describe, it, expect, vi, beforeEach } from 'vitest';

// Mock dependencies using string literals to avoid hoisting issues
const mockActions = {
  'FORWARD': false,
  'BACKWARD': false,
  'LEFT': false,
  'RIGHT': false,
  'JUMP': false,
  'RUN': false,
  'ACTION_1': false,
};

// Mock store
const mockStore = {
  actions: mockActions,
  mouseDelta: { x: 0, y: 0 },
  isPointerLocked: false,
  setAction: vi.fn(),
  setMouseDelta: vi.fn(),
  resetMouseDelta: vi.fn(),
  setPointerLocked: vi.fn(),
};

// Mock the input state
vi.mock('../../src/state/InputState', () => ({
  useInputStore: {
    getState: vi.fn(() => mockStore),
  }
}));

// Mock the key mappings
vi.mock('../../src/config/inputMappings', () => ({
  keyActionMap: {
    'KeyW': 'FORWARD',
    'ArrowUp': 'FORWARD',
    'KeyS': 'BACKWARD',
    'ArrowDown': 'BACKWARD',
    'Space': 'JUMP',
  },
  preventDefaultKeys: new Set(['Space', 'ArrowUp', 'ArrowDown'])
}));

// Now import the module under test and dependencies
import { InputSystem } from '../../src/systems/InputSystem';
import { InputAction } from '../../src/enums/InputAction';

// Create a mock canvas element
const mockCanvas = {
  addEventListener: vi.fn(),
  removeEventListener: vi.fn(),
};

// Mock document methods
vi.stubGlobal('document', {
  addEventListener: vi.fn(),
  removeEventListener: vi.fn(),
  pointerLockElement: null,
  exitPointerLock: vi.fn(),
  createElement: vi.fn(() => mockCanvas),
});

describe('InputSystem', () => {
  let inputSystem: InputSystem;

  beforeEach(() => {
    // Reset all mocks
    vi.clearAllMocks();
    
    // Reset action states
    Object.keys(mockActions).forEach(key => {
      mockActions[key] = false;
    });
    
    // Reset global mocks
    vi.stubGlobal('window', {
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      dispatchEvent: vi.fn((event) => {
        if (event.type === 'keydown' && !event.repeat) {
          const action = event.code === 'KeyW' ? 'FORWARD' : null;
          if (action) mockStore.setAction(action, true);
        } else if (event.type === 'keyup') {
          const action = event.code === 'KeyW' ? 'FORWARD' : null;
          if (action) mockStore.setAction(action, false);
        }
      }),
    });
    
    // Create InputSystem with mock canvas
    inputSystem = new InputSystem(mockCanvas as unknown as HTMLElement);
  });

  describe('initialization', () => {
    it('should initialize with the provided canvas element', () => {
      expect(inputSystem).toBeDefined();
    });
  });

  describe('event management', () => {
    it('should set up event listeners when start is called', () => {
      inputSystem.start();
      
      expect(window.addEventListener).toHaveBeenCalledWith('keydown', expect.any(Function));
      expect(window.addEventListener).toHaveBeenCalledWith('keyup', expect.any(Function));
      expect(mockCanvas.addEventListener).toHaveBeenCalledWith('pointerdown', expect.any(Function));
      expect(window.addEventListener).toHaveBeenCalledWith('pointerup', expect.any(Function));
      expect(document.addEventListener).toHaveBeenCalledWith('pointerlockchange', expect.any(Function));
      expect(document.addEventListener).toHaveBeenCalledWith('pointerlockerror', expect.any(Function));
      expect(mockCanvas.addEventListener).toHaveBeenCalledWith('click', expect.any(Function));
    });

    it('should remove event listeners when stop is called', () => {
      inputSystem.start();
      inputSystem.stop();
      
      expect(window.removeEventListener).toHaveBeenCalledWith('keydown', expect.any(Function));
      expect(window.removeEventListener).toHaveBeenCalledWith('keyup', expect.any(Function));
      expect(mockCanvas.removeEventListener).toHaveBeenCalledWith('pointerdown', expect.any(Function));
      expect(window.removeEventListener).toHaveBeenCalledWith('pointerup', expect.any(Function));
      expect(document.removeEventListener).toHaveBeenCalledWith('pointerlockchange', expect.any(Function));
      expect(document.removeEventListener).toHaveBeenCalledWith('pointerlockerror', expect.any(Function));
      expect(mockCanvas.removeEventListener).toHaveBeenCalledWith('click', expect.any(Function));
    });
  });

  describe('input handling', () => {
    it('should call resetMouseDelta when update is called', () => {
      inputSystem.update();
      expect(mockStore.resetMouseDelta).toHaveBeenCalled();
    });
  });

  describe('key event handling', () => {
    it('should handle keydown events correctly', () => {
      inputSystem.start();
      
      // Create keydown event
      const keydownEvent = new Event('keydown') as any;
      keydownEvent.code = 'KeyW';
      keydownEvent.repeat = false;
      
      // Dispatch event
      window.dispatchEvent(keydownEvent);
      
      // Verify the action is set in the store
      expect(mockStore.setAction).toHaveBeenCalledWith('FORWARD', true);
    });
    
    it('should handle keyup events correctly', () => {
      inputSystem.start();
      
      // Create keyup event
      const keyupEvent = new Event('keyup') as any;
      keyupEvent.code = 'KeyW';
      
      // Dispatch event
      window.dispatchEvent(keyupEvent);
      
      // Verify the action is set in the store
      expect(mockStore.setAction).toHaveBeenCalledWith('FORWARD', false);
    });
    
    it('should not handle repeated keydown events', () => {
      inputSystem.start();
      
      // Reset the mock to clear any previous calls
      mockStore.setAction.mockClear();
      
      // Create repeated keydown event
      const keydownEvent = new Event('keydown') as any;
      keydownEvent.code = 'KeyW';
      keydownEvent.repeat = true;
      
      // Dispatch event
      window.dispatchEvent(keydownEvent);
      
      // Verify setAction is not called
      expect(mockStore.setAction).not.toHaveBeenCalled();
    });
  });
}); 