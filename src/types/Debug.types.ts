/**
 * Configuration for debug features
 */
export interface DebugConfig {
  /** Master debug mode toggle */
  DEBUG_MODE: boolean;
  
  /** Whether to show the debug panel */
  SHOW_DEBUG_PANEL: boolean;
  
  /** Whether to show physics debug visualizations */
  SHOW_PHYSICS_DEBUG: boolean;
  
  /** Whether to show the FPS counter */
  SHOW_FPS_COUNTER: boolean;
  
  /** Check if a debug feature is enabled */
  isEnabled: (feature: keyof Omit<DebugConfig, 'isEnabled'>) => boolean;
} 