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
    private _planeBody!: RAPIER.RigidBody;

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
    // No getter for planeBody needed typically as it's fixed

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
        // --- Debug Cube ---
        const cubeSize = 1;
        const halfExtents = cubeSize / 2;
        const geometry = new THREE.BoxGeometry(cubeSize, cubeSize, cubeSize);
        this.trackDisposable(geometry); // Track geometry
        const material = new THREE.MeshStandardMaterial({ color: 0x00ff00 });
        this.trackDisposable(material); // Track material
        this._cube = new THREE.Mesh(geometry, material);
        this._cube.position.y = 3;
        this._cube.castShadow = true;
        this._cube.receiveShadow = true;
        this._cube.name = "DebugCube";
        this.scene.add(this._cube);

        const cubeBodyDesc = RAPIER.RigidBodyDesc.dynamic();
        const cubeColliderDesc = RAPIER.ColliderDesc.cuboid(halfExtents, halfExtents, halfExtents)
            .setRestitution(0.5)
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

    }

    // --- Update & Dispose ---

    /**
     * Update logic for the scene (non-physics related).
     */
    public update(delta: number, elapsed: number): void {
        // Keep this for scene-specific animations or logic later
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