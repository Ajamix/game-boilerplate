import React, { useState } from 'react';
import { useControls, folder, button, useStoreContext } from 'leva';
import { CameraMode, useCameraStore } from '../state/CameraState';

/**
 * A React component that provides Leva debug controls 
 * for camera settings.
 * It renders the controls within its own Leva store context
 * to avoid tooltip provider issues.
 */
export function CameraDebugPanel(): React.ReactElement | null {
  // Create a unique store for this panel instance (critical to fix tooltip issue)
  const store = useStoreContext();
  
  const cameraState = useCameraStore();
  const [cameraMode, setCameraMode] = useState<CameraMode>(cameraState.mode);
  
  // Initialize UI controls
  useControls('Camera', () => ({
    'Camera Mode': {
      options: {
        'First Person': CameraMode.FirstPerson,
        'Third Person': CameraMode.ThirdPerson,
      },
      value: cameraState.mode,
      onChange: (value) => {
        cameraState.setMode(value as CameraMode);
        setCameraMode(value as CameraMode);
      },
    },
    
    // Common Settings
    'Common Settings': folder({
      sensitivity: {
        value: cameraState.settings.sensitivity,
        min: 0.1,
        max: 1.0,
        step: 0.05,
        onChange: (value) => cameraState.setSensitivity(value),
        // hint: 'Mouse sensitivity multiplier',
      },
      fov: {
        value: cameraState.settings.fov,
        min: 60,
        max: 110,
        step: 1,
        onChange: (value) => cameraState.setFOV(value),
        // hint: 'Field of view in degrees',
      },
      'Position Smoothing': {
        value: cameraState.settings.positionLerpFactor,
        min: 0.01,
        max: 1.0,
        step: 0.01,
        onChange: (value) => cameraState.setPositionLerpFactor(value),
        // hint: 'How quickly camera position follows the target',
      },
      'Rotation Smoothing': {
        value: cameraState.settings.rotationLerpFactor,
        min: 0.01,
        max: 1.0,
        step: 0.01,
        onChange: (value) => cameraState.setRotationLerpFactor(value),
        // hint: 'How quickly camera rotation responds to input',
      },
    }),
    
    // Third-person settings
    'Third-Person Settings': folder({
      distance: {
        value: cameraState.settings.distance,
        min: 1,
        max: 10,
        step: 0.5,
        onChange: (value) => cameraState.setDistance(value),
        // hint: 'Distance from player',
      },
      height: {
        value: cameraState.settings.height,
        min: 0,
        max: 5,
        step: 0.1,
        onChange: (value) => cameraState.setHeight(value),
        // hint: 'Camera height offset',
      },
      offsetX: {
        value: cameraState.settings.offsetX,
        min: -2,
        max: 2,
        step: 0.1,
        onChange: (value) => cameraState.setOffsetX(value),
        // hint: 'Horizontal offset (for over-shoulder view)',
      },
    }, { collapsed: cameraMode !== CameraMode.ThirdPerson }),
    
    // First-person settings
    'First-Person Settings': folder({
      fpHeight: {
        value: cameraState.settings.fpHeight,
        min: 0.5,
        max: 2.5,
        step: 0.1,
        onChange: (value) => cameraState.setFPHeight(value),
        // hint: 'Camera height from ground (eye level)',
      },
    }, { collapsed: cameraMode !== CameraMode.FirstPerson }),
    
    // Reset camera button
    'Reset Camera': button(() => {
      cameraState.setSensitivity(0.2);
      cameraState.setFOV(75);
      cameraState.setDistance(4);
      cameraState.setHeight(1.5);
      cameraState.setOffsetX(0);
      cameraState.setFPHeight(1.6);
      cameraState.setRotationLerpFactor(0.1);
      cameraState.setPositionLerpFactor(0.1);
    }),
  }), { store }, [cameraMode]);
  
  // Return null because LevaPanel renders the controls into the global UI
  return null;
} 