import * as THREE from 'three';
import RAPIER from '@dimforge/rapier3d-compat';
import { PhysicsSystem } from '../systems/PhysicsSystem';

/**
 * Represents the main game scene.
 * Responsible for setting up the environment, lights, and objects,
 * and managing their lifecycle within the scene.
 */
export class GameScene {
    public readonly scene: THREE.Scene;
    private physicsSystem: PhysicsSystem;

    // Scene elements (make private, expose via getters)
    private _ambientLight!: THREE.AmbientLight;
    private _directionalLight!: THREE.DirectionalLight;
    private _cube!: THREE.Mesh;
    private _plane!: THREE.Mesh;
    private _cubeBody!: RAPIER.RigidBody;

    // Array to track disposable Three.js resources
    private disposables: { dispose: () => void }[] = [];

    constructor(physicsSystem: PhysicsSystem) {
        this.scene = new THREE.Scene();
        this.physicsSystem = physicsSystem;
        this.initializeScene();
        this.initializeLighting();
        this.addDebugObjects();
        console.log('GameScene initialized.');
    }

    // --- Getters for Debugging/External Access ---
    public get ambientLight(): THREE.AmbientLight { return this._ambientLight; }
    public get directionalLight(): THREE.DirectionalLight { return this._directionalLight; }
    public get cube(): THREE.Mesh { return this._cube; }
    public get plane(): THREE.Mesh { return this._plane; }
    public get cubeBody(): RAPIER.RigidBody { return this._cubeBody; }

    // --- Setters for Light Control ---
    /**
     * Sets the intensity of the ambient light
     * @param intensity New intensity value
     */
    public setAmbientLightIntensity(intensity: number): void {
        if (this._ambientLight) {
            this._ambientLight.intensity = intensity;
        }
    }

    /**
     * Sets the intensity of the directional light
     * @param intensity New intensity value
     */
    public setDirectionalLightIntensity(intensity: number): void {
        if (this._directionalLight) {
            this._directionalLight.intensity = intensity;
        }
    }

    // --- Initialization Methods ---

    private initializeScene(): void {
        this.scene.background = new THREE.Color(0x222222);
        this.scene.fog = new THREE.Fog(0x222222, 10, 50);
        this.scene.name = "GameSceneInstance";
    }

    private initializeLighting(): void {
        this._ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
        this._ambientLight.name = "AmbientLight";
        this.scene.add(this._ambientLight);

        this._directionalLight = new THREE.DirectionalLight(0xffffff, 1);
        this._directionalLight.name = "DirectionalLight";
        this._directionalLight.position.set(5, 10, 7.5);
        this._directionalLight.castShadow = true;
        this._directionalLight.shadow.mapSize.width = 1024;
        this._directionalLight.shadow.mapSize.height = 1024;
        this._directionalLight.shadow.camera.near = 0.5;
        this._directionalLight.shadow.camera.far = 50;
        this.scene.add(this._directionalLight);
        // Note: Lights don't typically have geometries/materials to dispose
    }

    private addDebugObjects(): void {
        // --- Player Character (Capsule Visual, Box Collider) ---
        const playerHeight = 1.8; // Height in meters
        const playerRadius = 0.4; // Radius in meters
        const capsuleHalfHeight = (playerHeight - 2 * playerRadius) / 2;
        
        // Create capsule visual representation
        const geometry = new THREE.CapsuleGeometry(playerRadius, capsuleHalfHeight * 2, 8, 16);
        this.trackDisposable(geometry);
        const material = new THREE.MeshStandardMaterial({ color: 0x00ff00 });
        this.trackDisposable(material);
        this._cube = new THREE.Mesh(geometry, material); // Still using _cube for compatibility
        this._cube.position.y = playerHeight / 2 + 0.5; // Position so bottom is slightly above ground
        this._cube.castShadow = true;
        this._cube.receiveShadow = true;
        this._cube.name = "PlayerCapsule"; // Update name to reflect visual
        this.scene.add(this._cube);

        // Physics Body - still using a box collider for now for compatibility
        // Keep this matching the visual size approximately
        const halfExtents = { 
            x: playerRadius,
            y: playerHeight / 2, // Half height
            z: playerRadius 
        };
        
        const cubeBodyDesc = RAPIER.RigidBodyDesc.dynamic()
            .setTranslation(this._cube.position.x, this._cube.position.y, this._cube.position.z)
            .setLinearDamping(0.5)
            .setAngularDamping(0.5)
            .lockRotations(); // Lock rotations to prevent flipping
            
        const cubeColliderDesc = RAPIER.ColliderDesc.cuboid(
            halfExtents.x, halfExtents.y, halfExtents.z
        )
            .setRestitution(0.2)
            .setFriction(0.7) // Better friction for character
            .setDensity(1.0);
            
        this._cubeBody = this.physicsSystem.addBody(this._cube, cubeBodyDesc, cubeColliderDesc);

        // --- Ground Box (Replacing Plane for Debugging) ---
        const groundSize = 20;
        const groundThickness = 0.2; // Keep it relatively thin but not extremely thin
        const groundGeometry = new THREE.BoxGeometry(groundSize, groundThickness, groundSize);
        this.trackDisposable(groundGeometry);
        const groundMaterial = new THREE.MeshStandardMaterial({ color: 0x888888 }); // Different color
        this.trackDisposable(groundMaterial);
        const groundBox = new THREE.Mesh(groundGeometry, groundMaterial);
        groundBox.position.y = -groundThickness / 2; // Position so top surface is at y=0
        groundBox.receiveShadow = true;
        groundBox.name = "GroundBox";
        this.scene.add(groundBox);

        const groundBodyDesc = RAPIER.RigidBodyDesc.fixed(); // Still fixed
        const groundColliderDesc = RAPIER.ColliderDesc.cuboid(
            groundSize / 2,
            groundThickness / 2,
            groundSize / 2
        ).setRestitution(0.1);
        // Use the groundBox mesh for physics association
        this.physicsSystem.addBody(groundBox, groundBodyDesc, groundColliderDesc);
        this._plane = groundBox; // Assign groundBox to _plane for compatibility
    }

    // --- Update & Dispose ---

    /**
     * Update logic for the scene (non-physics related).
     */
    public update(_delta: number, _elapsed: number): void {
        // Currently no update needed for a static scene
    }

    /**
     * Helper to track objects that need disposal.
     */
    private trackDisposable(resource: { dispose: () => void }): void {
        this.disposables.push(resource);
    }

    /**
     * Cleans up resources used by the scene.
     */
    public dispose(): void {
        console.log(`Disposing ${this.disposables.length} tracked resources...`);
        this.disposables.forEach(resource => resource.dispose());
        this.disposables = []; // Clear the array

        // Explicitly remove objects from scene to be thorough
        // (might be redundant if scene itself is discarded, but good practice)
        this.scene.remove(this._cube);
        this.scene.remove(this._plane);
        this.scene.remove(this._ambientLight);
        this.scene.remove(this._directionalLight);

        // Note: Physics bodies are managed by the PhysicsSystem/World

        console.log('GameScene disposed.');
    }
} 