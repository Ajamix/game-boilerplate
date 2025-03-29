import React, { useEffect, useRef, useState } from 'react';
import { useControls, folder, button, useStoreContext } from 'leva';
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
    
    // Track movement parameters for debug UI
    const [moveSpeed, setMoveSpeed] = useState(5.0);
    const [jumpForce, setJumpForce] = useState(7.0);
    const [maxSpeed, setMaxSpeed] = useState(10.0);
    const [damping, setDamping] = useState(0.9);

    // Refs to hold the scene objects
    const cubeRef = useRef<THREE.Mesh | null>(null);
    const planeRef = useRef<THREE.Mesh | null>(null);
    const ambientLightRef = useRef<THREE.AmbientLight | null>(null);
    const directionalLightRef = useRef<THREE.DirectionalLight | null>(null);
    const cubeBodyRef = useRef<RAPIER.RigidBody | null>(null);
    

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
            setMaxSpeed(playerSystem.maxSpeed);
            setDamping(playerSystem.damping);
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
        maxSpeed: {
            value: maxSpeed,
            min: 1, max: 20, step: 0.5,
            onChange: (v) => { 
                setMaxSpeed(v);
                if (playerSystem) playerSystem.maxSpeed = v;
            },
        },
        damping: {
            value: damping,
            min: 0, max: 1, step: 0.01,
            onChange: (v) => { 
                setDamping(v);
                if (playerSystem) playerSystem.damping = v;
            },
        },
    }), { store }, [moveSpeed, jumpForce, maxSpeed, damping, playerSystem]);



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