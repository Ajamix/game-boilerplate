/**
 * Debug configuration from environment variables.
 * These are injected by Vite during build time from the .env file.
 */
import { DebugConfig } from '../types/Debug.types';

const CONFIG = {
  // Master debug mode toggle (affects logging and potentially performance)
  DEBUG_MODE: import.meta.env.VITE_DEBUG_MODE === 'true',
  
  // UI debug panel - master switch for all UI debug components
  SHOW_DEBUG_PANEL: import.meta.env.VITE_SHOW_DEBUG_PANEL === 'true',
  
  // Individual debug features (require SHOW_DEBUG_PANEL to be visible in the UI)
  SHOW_PHYSICS_DEBUG: import.meta.env.VITE_SHOW_PHYSICS_DEBUG === 'true',
  SHOW_FPS_COUNTER: import.meta.env.VITE_SHOW_FPS_COUNTER === 'true',
};

// Helper function to check if a debug feature is enabled
const isEnabled = (feature: keyof typeof CONFIG): boolean => {
  return CONFIG[feature] === true;
};

// Combine both into the exported DEBUG_CONFIG
export const DEBUG_CONFIG: DebugConfig = {
  ...CONFIG,
  isEnabled
};

// Log all active debug features on startup
const activeFeatures = Object.entries(CONFIG)
  .filter(([_key, value]) => typeof value === 'boolean' && value === true)
  .map(([key]) => key);

if (activeFeatures.length > 0) {
  console.log('🐞 Debug features enabled:', activeFeatures);
} 