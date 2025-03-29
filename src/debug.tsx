import React from 'react';
import ReactDOM from 'react-dom/client';
import { LevaDebug } from './components/LevaDebug';
import { SceneDebugPanel } from './components/SceneDebugPanel';
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
      <SceneDebugPanel gameScene={engine.activeScene} />
    </React.StrictMode>
  );

  console.log('Debug UI initialized.');
} 