import React from 'react';
import ReactDOM from 'react-dom/client';
import { LevaDebug } from './components/LevaDebug';
import { SceneDebugPanel } from './components/SceneDebugPanel';
import { GameStateDisplay } from './components/GameStateDisplay';
import { CameraDebugPanel } from './components/CameraDebugPanel';
import { Engine } from './core/Engine';

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
      <LevaDebug isInitiallyVisible={true} />
      <SceneDebugPanel gameScene={engine.activeScene} playerSystem={engine.playerSystem} />
      <CameraDebugPanel />
      <GameStateDisplay 
        playerBody={engine.activeScene?.cubeBody || null} 
        playerSystem={engine.playerSystem || null} 
      />
    </React.StrictMode>
  );

  console.log('Debug UI initialized.');
} 