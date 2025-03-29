import React, { useEffect, useState } from 'react';
import RAPIER from '@dimforge/rapier3d-compat';
import { PlayerSystem } from '../systems/PlayerSystem';

interface GameStateDisplayProps {
  playerBody: RAPIER.RigidBody | null;
  playerSystem: PlayerSystem | null;
}

/**
 * A lightweight HUD component that displays real-time game state information
 * in the top-left corner of the screen, outside the React rendering cycle of Leva.
 */
export const GameStateDisplay: React.FC<GameStateDisplayProps> = ({ 
  playerBody, 
  playerSystem 
}) => {
  const [position, setPosition] = useState({ x: 0, y: 0, z: 0 });
  const [velocity, setVelocity] = useState({ x: 0, y: 0, z: 0 });
  const [isGrounded, setIsGrounded] = useState(false);

  useEffect(() => {
    if (!playerBody || !playerSystem) return;

    // Update at 60fps
    let animationFrameId: number;
    
    const updateState = () => {
      if (playerBody) {
        const pos = playerBody.translation();
        setPosition({
          x: parseFloat(pos.x.toFixed(2)),
          y: parseFloat(pos.y.toFixed(2)),
          z: parseFloat(pos.z.toFixed(2))
        });
        
        const vel = playerBody.linvel();
        setVelocity({
          x: parseFloat(vel.x.toFixed(2)),
          y: parseFloat(vel.y.toFixed(2)),
          z: parseFloat(vel.z.toFixed(2))
        });
        
        if (playerSystem) {
          setIsGrounded(playerSystem.checkIfGrounded(playerBody));
        }
      }
      
      animationFrameId = requestAnimationFrame(updateState);
    };
    
    updateState();
    
    return () => {
      cancelAnimationFrame(animationFrameId);
    };
  }, [playerBody, playerSystem]);

  // Skip rendering if no player body
  if (!playerBody) return null;

  return (
    <div 
      style={{
        position: 'fixed',
        top: '10px',
        left: '10px',
        backgroundColor: 'rgba(0, 0, 0, 0.7)',
        color: 'white',
        padding: '10px',
        borderRadius: '5px',
        fontFamily: 'monospace',
        fontSize: '14px',
        zIndex: 1000,
        pointerEvents: 'none', // Don't block mouse events
        maxWidth: '300px'
      }}
    >
      <div style={{ fontWeight: 'bold', marginBottom: '5px' }}>Player State</div>
      
      <div style={{ display: 'grid', gridTemplateColumns: '80px 1fr' }}>
        <div>Position:</div>
        <div>{`X:${position.x} Y:${position.y} Z:${position.z}`}</div>
        
        <div>Velocity:</div>
        <div>{`X:${velocity.x} Y:${velocity.y} Z:${velocity.z}`}</div>
        
        <div>Grounded:</div>
        <div style={{ color: isGrounded ? '#4CAF50' : '#F44336' }}>
          {isGrounded ? 'YES' : 'NO'}
        </div>
      </div>
    </div>
  );
}; 