import { create } from 'zustand';
import { CameraState as ICameraState } from '../types/Camera.types';
import { CameraMode } from '../enums/CameraMode';

/**
 * Zustand store for managing camera state.
 * Handles settings for both first-person and third-person camera modes.
 */
export const useCameraStore = create<ICameraState>((set) => ({
  mode: CameraMode.ThirdPerson,
  target: null,
  enabled: true,
  settings: {
    sensitivity: 0.2, // Mouse sensitivity multiplier
    fov: 75, // Field of view in degrees
    distance: 4, // Distance behind player in third-person
    height: 1.5, // Height offset in third-person
    offsetX: 0, // X-axis offset (for over-shoulder view)
    fpHeight: 1.6, // First-person camera height from player's feet
    rotationLerpFactor: 0.1, // Smoothing factor for rotation (higher = more responsive)
    positionLerpFactor: 0.1, // Smoothing factor for position (higher = more responsive)
  },
  
  // Actions to modify state
  setMode: (mode) => set({ mode }),
  setSensitivity: (sensitivity) => set((state) => ({ 
    settings: { ...state.settings, sensitivity } 
  })),
  setDistance: (distance) => set((state) => ({ 
    settings: { ...state.settings, distance } 
  })),
  setHeight: (height) => set((state) => ({ 
    settings: { ...state.settings, height } 
  })),
  setFOV: (fov) => set((state) => ({ 
    settings: { ...state.settings, fov } 
  })),
  setEnabled: (enabled) => set({ enabled }),
  setTarget: (target) => set({ target }),
  setOffsetX: (offsetX) => set((state) => ({ 
    settings: { ...state.settings, offsetX } 
  })),
  setFPHeight: (fpHeight) => set((state) => ({
    settings: { ...state.settings, fpHeight }
  })),
  setRotationLerpFactor: (rotationLerpFactor) => set((state) => ({
    settings: { ...state.settings, rotationLerpFactor }
  })),
  setPositionLerpFactor: (positionLerpFactor) => set((state) => ({
    settings: { ...state.settings, positionLerpFactor }
  })),
}));

// Selector hooks for convenience
export const useCameraMode = () => useCameraStore((state) => state.mode);
export const useCameraSettings = () => useCameraStore((state) => state.settings);
export const useCameraEnabled = () => useCameraStore((state) => state.enabled); 