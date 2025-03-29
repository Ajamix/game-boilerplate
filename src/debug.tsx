import React from 'react';
import ReactDOM from 'react-dom/client';
import { LevaDebug } from './components/LevaDebug';
import { SceneDebugPanel } from './components/SceneDebugPanel';
import { GameStateDisplay } from './components/GameStateDisplay';
import { CameraDebugPanel } from './components/CameraDebugPanel';
import { FpsCounter } from './components/FpsCounter';
import { Engine } from './core/Engine';
import { DEBUG_CONFIG } from './config/debug';

/**
 * Finds the debug UI container element and mounts the React debug components.
 * @param engine - The main Engine instance to potentially get scene info from.
 */
export function initializeDebugUI(engine: Engine): void {
  const debugUiContainer = document.getElementById('debug-ui');

  if (!debugUiContainer) {
    console.error("Could not find div element with id 'debug-ui' to mount React UI.");
    return;
  }

  ReactDOM.createRoot(debugUiContainer).render(
    <React.StrictMode>
      {/* Debug Panel is the master switch for all UI debug components */}
      {DEBUG_CONFIG.isEnabled('DEBUG_MODE') && (
        <>
          {/* Leva controls */}
          <LevaDebug isInitiallyVisible={true} />

          {/* Scene and camera debug panels */}
          <SceneDebugPanel gameScene={engine.activeScene} playerSystem={engine.playerSystem} />
          <CameraDebugPanel />
          
          {/* Conditional debug displays */}
          {DEBUG_CONFIG.isEnabled('SHOW_PHYSICS_DEBUG') && (
            <GameStateDisplay 
              playerBody={engine.activeScene?.cubeBody || null} 
              playerSystem={engine.playerSystem || null} 
            />
          )}
          
          {DEBUG_CONFIG.isEnabled('SHOW_FPS_COUNTER') && <FpsCounter />}
        </>
      )}
    </React.StrictMode>
  );

  console.log('Debug UI initialized.');
} 