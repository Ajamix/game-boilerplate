import React, { useEffect, useRef } from 'react';
import { useControls, folder, button, useStoreContext } from 'leva';
import * as THREE from 'three';
import RAPIER from '@dimforge/rapier3d-compat';
import { GameScene } from '../scenes/GameScene'; // Adjust path if needed

interface SceneDebugPanelProps {
    gameScene: GameScene | null; // Pass the loaded GameScene instance
}

/**
 * A React component that provides Leva debug controls 
 * for a given GameScene instance.
 * It renders the controls within its own LevaPanel instance
 * to avoid potential global store conflicts if multiple panels are used.
 */
export function SceneDebugPanel({ gameScene }: SceneDebugPanelProps): React.ReactElement | null {
    // Create a unique store for this panel instance
    const store = useStoreContext();

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
            // Force Leva to re-evaluate controls based on new refs if needed
            // (Leva might handle this automatically, but being explicit can help)
            // Note: Leva's API for forcing updates might vary or be internal.
            // Often, structuring dependencies correctly is enough.
        }
    }, [gameScene]);

    // --- Leva Controls Setup --- 
    // Use functions to define controls, ensuring they capture current ref values

    useControls('Cube Physics', () => ({ // Use function form
        'Reset Cube': button(() => {
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
            transient: false // Ensure it updates if the underlying value changes externally
        },
    }), { store }, [gameScene]); // Recreate controls if gameScene changes

    useControls('Scene Objects', () => ({ // Use function form
        Cube: folder({
            cubeVisible: {
                label: 'Visible',
                value: cubeRef.current?.visible ?? true,
                onChange: (v) => { if (cubeRef.current) cubeRef.current.visible = v; }
            },
            cubeColor: {
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
        Plane: folder({
            planeVisible: {
                label: 'Visible',
                value: planeRef.current?.visible ?? true,
                onChange: (v) => { if (planeRef.current) planeRef.current.visible = v; }
            },
            planeColor: {
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
    }), { store }, [gameScene]); // Recreate controls if gameScene changes

    useControls('Lighting', () => ({ // Use function form
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
            onChange: (v: { x: number, y: number, z: number }) => { // Add type for v
                directionalLightRef.current?.position.set(v.x, v.y, v.z);
            }
        },
    }), { store }, [gameScene]); // Recreate controls if gameScene changes

    // Return null because LevaPanel renders the controls into the global UI
    // Or, if we want it self-contained: return <LevaPanel store={store} />;
    // Let's stick with the global panel approach for now.
    return null;
} 