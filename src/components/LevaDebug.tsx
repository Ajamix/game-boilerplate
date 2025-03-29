import React from 'react';
import { Leva } from 'leva';

interface LevaDebugProps {
  isInitiallyVisible?: boolean;
}

/**
 * Renders the Leva debug panel UI.
 * Allows controlling visibility via props or environment variables.
 */
export function LevaDebug({ isInitiallyVisible = true }: LevaDebugProps): React.ReactElement | null {
  // Allow hiding the panel entirely via an environment variable for production builds
  const showPanel = import.meta.env.VITE_SHOW_DEBUG_PANEL !== 'false';

  if (!showPanel) {
    return null;
  }

  return <Leva collapsed={!isInitiallyVisible} titleBar={{ title: 'Debug Controls' }} />;
} 