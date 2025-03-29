import React, { useEffect, useRef, useState } from 'react';
import { useControls, folder, button, useStoreContext, monitor } from 'leva';
import * as THREE from 'three';
import RAPIER from '@dimforge/rapier3d-compat';
import { GameScene } from '../scenes/GameScene'; // Adjust path if needed
import { PlayerSystem } from '../systems/PlayerSystem'; // Import PlayerSystem class

interface SceneDebugPanelProps {
    gameScene: GameScene | null; // Pass the loaded GameScene instance
    playerSystem?: PlayerSystem; // Optional PlayerSystem reference
}

/**
 * A React component that provides Leva debug controls 
 * for a given GameScene instance.
 * It renders the controls within its own LevaPanel instance
 * to avoid potential global store conflicts if multiple panels are used.
 */
export function SceneDebugPanel({ gameScene, playerSystem }: SceneDebugPanelProps): React.ReactElement | null {
    // Create a unique store for this panel instance
    const store = useStoreContext();
    
    // State to track physics values that need frequent updates
    const [playerPos, setPlayerPos] = useState({ x: 0, y: 0, z: 0 });
    const [playerVel, setPlayerVel] = useState({ x: 0, y: 0, z: 0 });
    const [isGrounded, setIsGrounded] = useState(false);

    // Track movement parameters for debug UI
    const [moveSpeed, setMoveSpeed] = useState(5.0);
    const [jumpForce, setJumpForce] = useState(7.0);

    // Refs to hold the scene objects
    const cubeRef = useRef<THREE.Mesh | null>(null);
    const planeRef = useRef<THREE.Mesh | null>(null);
    const ambientLightRef = useRef<THREE.AmbientLight | null>(null);
    const directionalLightRef = useRef<THREE.DirectionalLight | null>(null);
    const cubeBodyRef = useRef<RAPIER.RigidBody | null>(null);
    
    // Update interval for physics data
    useEffect(() => {
        if (!gameScene) return;
        
        // Update on each animation frame for smoother display
        const updateFrame = () => {
            if (cubeBodyRef.current) {
                const pos = cubeBodyRef.current.translation();
                const vel = cubeBodyRef.current.linvel();
                
                setPlayerPos({ 
                    x: parseFloat(pos.x.toFixed(2)), 
                    y: parseFloat(pos.y.toFixed(2)), 
                    z: parseFloat(pos.z.toFixed(2)) 
                });
                
                setPlayerVel({ 
                    x: parseFloat(vel.x.toFixed(2)), 
                    y: parseFloat(vel.y.toFixed(2)), 
                    z: parseFloat(vel.z.toFixed(2)) 
                });
                
                // Get the grounded state using the PlayerSystem's check if available
                if (playerSystem && cubeBodyRef.current) {
                    setIsGrounded(playerSystem.checkIfGrounded(cubeBodyRef.current));
                } else {
                    // Fall back to our own check if playerSystem is not available
                    // 1. Check if velocity is low (not bouncing/jumping)
                    const lowVerticalVelocity = Math.abs(vel.y) < 0.2; 
                    
                    // 2. Check if close enough to ground level
                    const playerHeight = 1.8;
                    // Calculate height of feet from ground (y=0)
                    const feetPosition = pos.y - (playerHeight / 2);
                    // Add small tolerance for ground check
                    const groundDistance = Math.max(0, feetPosition);
                    const isCloseToGround = groundDistance < 0.15; 
                    
                    setIsGrounded(lowVerticalVelocity && isCloseToGround);
                }
            }
            
            // Continue the update loop
            requestID = requestAnimationFrame(updateFrame);
        };
        
        // Start the update loop
        let requestID = requestAnimationFrame(updateFrame);
        
        // Cleanup function
        return () => {
            if (requestID) {
                cancelAnimationFrame(requestID);
            }
        };
    }, [gameScene]);

    // Effect to update refs when gameScene is available
    useEffect(() => {
        if (gameScene) {
            cubeRef.current = gameScene.cube;
            planeRef.current = gameScene.plane;
            ambientLightRef.current = gameScene.ambientLight;
            directionalLightRef.current = gameScene.directionalLight;
            cubeBodyRef.current = gameScene.cubeBody;
        }
    }, [gameScene]);

    // Initialize movement parameters from PlayerSystem
    useEffect(() => {
        if (playerSystem) {
            setMoveSpeed(playerSystem.moveSpeed);
            setJumpForce(playerSystem.jumpForce);
        }
    }, [playerSystem]);

    // --- Player Physics Controls --- 
    useControls('Player Physics', () => ({
        'Reset Player': button(() => {
            if (!cubeBodyRef.current) return;
            cubeBodyRef.current.setTranslation({ x: 0, y: 3, z: 0 }, true);
            cubeBodyRef.current.setLinvel({ x: 0, y: 0, z: 0 }, true);
            cubeBodyRef.current.setAngvel({ x: 0, y: 0, z: 0 }, true);
        }),
        gravityScale: {
            label: 'Gravity Scale',
            value: cubeBodyRef.current?.gravityScale() ?? 1.0,
            min: -2, max: 5, step: 0.1,
            onChange: (v) => { cubeBodyRef.current?.setGravityScale(v, true); },
            transient: false
        },
        'Apply Impulse Up': button(() => {
            if (!cubeBodyRef.current) return;
            cubeBodyRef.current.applyImpulse({ x: 0, y: 10, z: 0 }, true);
        }),
    }), { store }, [gameScene]);
    
    // --- Movement Settings ---
    useControls('Movement Settings', () => ({
        moveSpeed: {
            value: moveSpeed,
            min: 1, max: 20, step: 0.5,
            onChange: (v) => { 
                setMoveSpeed(v);
                if (playerSystem) playerSystem.moveSpeed = v;
            },
        },
        jumpForce: {
            value: jumpForce,
            min: 1, max: 20, step: 0.5,
            onChange: (v) => { 
                setJumpForce(v);
                if (playerSystem) playerSystem.jumpForce = v;
            },
        },
    }), { store }, [moveSpeed, jumpForce, playerSystem]);

    // --- Player State Monitoring ---
    useControls('Player State', () => ({
        // Position
        'Position X': monitor(() => playerPos.x),
        'Position Y': monitor(() => playerPos.y),
        'Position Z': monitor(() => playerPos.z),
        
        // Velocity
        'Velocity X': monitor(() => playerVel.x),
        'Velocity Y': monitor(() => playerVel.y), 
        'Velocity Z': monitor(() => playerVel.z),
        
        // Ground state
        'Is Grounded': monitor(() => isGrounded),
    }), { store }, [playerPos, playerVel, isGrounded]);

    useControls('Scene Objects', () => ({
        Player: folder({
            playerVisible: {
                label: 'Visible',
                value: cubeRef.current?.visible ?? true,
                onChange: (v) => { if (cubeRef.current) cubeRef.current.visible = v; }
            },
            playerColor: {
                label: 'Color',
                value: `#${(cubeRef.current?.material as THREE.MeshStandardMaterial)?.color?.getHexString() ?? '00ff00'}`,
                onChange: (v: string) => { 
                    const material = cubeRef.current?.material as THREE.MeshStandardMaterial;
                    if (material?.color) { 
                        material.color.set(v);
                    }
                }
            }
        }, { collapsed: false }),
        Ground: folder({
            groundVisible: {
                label: 'Visible',
                value: planeRef.current?.visible ?? true,
                onChange: (v) => { if (planeRef.current) planeRef.current.visible = v; }
            },
            groundColor: {
                label: 'Color',
                value: `#${(planeRef.current?.material as THREE.MeshStandardMaterial)?.color?.getHexString() ?? 'aaaaaa'}`,
                onChange: (v: string) => { 
                    const material = planeRef.current?.material as THREE.MeshStandardMaterial;
                    if (material?.color) { 
                        material.color.set(v);
                    }
                }
            }
        }, { collapsed: false })
    }), { store }, [gameScene]);

    useControls('Lighting', () => ({
        ambientIntensity: {
            value: ambientLightRef.current?.intensity ?? 0.5,
            min: 0, max: 2, step: 0.1,
            onChange: (v) => { if (ambientLightRef.current) ambientLightRef.current.intensity = v; }
        },
        directionalIntensity: {
            value: directionalLightRef.current?.intensity ?? 1.0,
            min: 0, max: 5, step: 0.1,
            onChange: (v) => { if (directionalLightRef.current) directionalLightRef.current.intensity = v; }
        },
        directionalPosition: {
            value: {
                x: directionalLightRef.current?.position.x ?? 5,
                y: directionalLightRef.current?.position.y ?? 10,
                z: directionalLightRef.current?.position.z ?? 7.5,
            },
            step: 0.5,
            onChange: (v: { x: number, y: number, z: number }) => {
                directionalLightRef.current?.position.set(v.x, v.y, v.z);
            }
        },
    }), { store }, [gameScene]);

    // Return null because LevaPanel renders the controls into the global UI
    return null;
} 