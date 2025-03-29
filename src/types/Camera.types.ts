import * as THREE from 'three';
import { CameraMode } from '../enums/CameraMode';

/**
 * Settings for the camera system
 */
export interface CameraSettings {
  // Common settings
  /** Mouse sensitivity multiplier */
  sensitivity: number;
  
  /** Field of view in degrees */
  fov: number;
  
  // Third-person specific settings
  /** Distance behind player in third-person mode */
  distance: number;
  
  /** Height offset in third-person mode */
  height: number;
  
  /** X-axis offset (for over-shoulder view) */
  offsetX: number;
  
  // First-person specific settings
  /** First-person camera height from player's feet */
  fpHeight: number;
  
  // Rotation/position lerp factors
  /** Smoothing factor for rotation (higher = more responsive) */
  rotationLerpFactor: number;
  
  /** Smoothing factor for position (higher = more responsive) */
  positionLerpFactor: number;
}

/**
 * State and actions for the camera system
 */
export interface CameraState {
  // Current state
  /** Current camera mode (first-person or third-person) */
  mode: CameraMode;
  
  /** Camera settings */
  settings: CameraSettings;
  
  /** The object the camera is targeting */
  target: THREE.Object3D | null;
  
  /** Whether the camera system is enabled */
  enabled: boolean;
  
  // Actions
  /** Set the camera mode */
  setMode: (mode: CameraMode) => void;
  
  /** Set the mouse sensitivity */
  setSensitivity: (sensitivity: number) => void;
  
  /** Set the camera distance from player (third-person) */
  setDistance: (distance: number) => void;
  
  /** Set the camera height offset */
  setHeight: (height: number) => void;
  
  /** Set the field of view */
  setFOV: (fov: number) => void;
  
  /** Enable or disable the camera system */
  setEnabled: (enabled: boolean) => void;
  
  /** Set the camera target */
  setTarget: (target: THREE.Object3D | null) => void;
  
  /** Set the X offset (for over-shoulder view) */
  setOffsetX: (offset: number) => void;
  
  /** Set the first-person camera height */
  setFPHeight: (height: number) => void;
  
  /** Set the rotation smoothing factor */
  setRotationLerpFactor: (factor: number) => void;
  
  /** Set the position smoothing factor */
  setPositionLerpFactor: (factor: number) => void;
} 