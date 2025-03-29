import * as THREE from 'three';
import { Loop } from './Loop';
import { GameScene } from '../scenes/GameScene';
import { PhysicsSystem } from '../systems/PhysicsSystem';
import { InputSystem } from '../systems/InputSystem';
import { PlayerSystem } from '../systems/PlayerSystem';
import { CameraSystem } from '../systems/CameraSystem';
import { useCameraStore } from '../state/CameraState';

// For Debug Renderer
import * as BufferGeometryUtils from 'three/examples/jsm/utils/BufferGeometryUtils.js';

/**
 * Main game engine class.
 * Initializes core components like the renderer, camera, and game loop.
 * Manages the active scene and coordinates updates and rendering.
 */
export class Engine {
    public loop: Loop;
    public renderer!: THREE.WebGLRenderer;
    public camera!: THREE.PerspectiveCamera;
    public get activeScene(): GameScene { return this._activeScene; }
    public get playerSystem(): PlayerSystem { return this._playerSystem; }
    public get cameraSystem(): CameraSystem { return this._cameraSystem; }
    private _activeScene!: GameScene;
    private physicsSystem!: PhysicsSystem;
    private inputSystem!: InputSystem;
    private _playerSystem!: PlayerSystem;
    private _cameraSystem!: CameraSystem;
    private canvasElement: HTMLCanvasElement;

    // Debug rendering
    private physicsDebugLineSegments!: THREE.LineSegments;
    private showPhysicsDebug = true; // Control visibility (could be toggled via Leva)

    constructor(canvas: HTMLCanvasElement) {
        this.canvasElement = canvas;
        this.loop = new Loop();
        this.physicsSystem = new PhysicsSystem();
        this.inputSystem = new InputSystem(this.canvasElement);
        this._playerSystem = new PlayerSystem();

        this.initializeRenderer(canvas);
        this.initializeCamera();
        this._cameraSystem = new CameraSystem(this.camera);
        
        this.loadScene(new GameScene(this.physicsSystem));
        this.initializePhysicsDebugRenderer(); // Initialize debug renderer

        // Set camera target once scene is loaded
        useCameraStore.getState().setTarget(this._activeScene.cube);

        this.loop.onUpdate((delta, elapsed) => {
            this.physicsSystem.step(delta);
            
            if (this.activeScene) {
                this.activeScene.update(delta, elapsed);
                
                // Get player components
                const playerBody = this.activeScene.cubeBody; 
                const playerMesh = this.activeScene.cube;
                
                if (playerBody && playerMesh) {
                    // Update camera system first
                    this._cameraSystem.update(playerBody, playerMesh, delta);
                    
                    // Set camera vectors for the player system
                    this._playerSystem.setCameraVectors(
                        this._cameraSystem.getForwardVector(),
                        this._cameraSystem.getRightVector()
                    );
                    
                    // Then update player system
                    this._playerSystem.update(playerBody, playerMesh, delta);
                }
            }

            this.inputSystem.update();
        });

        this.loop.onRender(() => {
            if (this.renderer && this.activeScene && this.camera) {
                this.updatePhysicsDebugRenderer(); // Update debug lines
                this.renderer.render(this.activeScene.scene, this.camera);
            }
        });

        window.addEventListener('resize', this.handleResize);

        console.log('Engine initialized.');
    }

    private initializeRenderer(canvas: HTMLCanvasElement): void {
        this.renderer = new THREE.WebGLRenderer({ 
            canvas: canvas,
            antialias: true,
            alpha: true
        });
        this.renderer.setSize(window.innerWidth, window.innerHeight);
        this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
        this.renderer.outputColorSpace = THREE.SRGBColorSpace;
        this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
        this.renderer.shadowMap.enabled = true;
        this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    }

    private initializeCamera(): void {
        this.camera = new THREE.PerspectiveCamera(
            75,
            window.innerWidth / window.innerHeight,
            0.1,
            1000
        );
        this.camera.position.set(0, 2, 5);
    }

    public loadScene(scene: GameScene): void {
        if (this._activeScene) {
            this._activeScene.dispose();
        }
        
        this._activeScene = scene;
        if (!this._activeScene.scene.children.includes(this.camera)) {
            this._activeScene.scene.add(this.camera);
        }
        // Add the debug lines object to the scene when loading it
        if (this.physicsDebugLineSegments) {
             this._activeScene.scene.add(this.physicsDebugLineSegments);
        }
        console.log('Scene loaded.');
    }

    public start(): void {
        this.inputSystem.start();
        this.loop.start();
    }

    public stop(): void {
        this.inputSystem.stop();
        this.loop.stop();
    }

    public dispose(): void {
        this.stop();
        window.removeEventListener('resize', this.handleResize);
        if (this._activeScene) {
            this._activeScene.dispose();
        }
        this.physicsSystem.dispose();
        this.renderer.dispose();
        console.log('Engine disposed.');
    }

    private handleResize = (): void => {
        if (!this.camera || !this.renderer) return;

        this.camera.aspect = window.innerWidth / window.innerHeight;
        this.camera.updateProjectionMatrix();

        this.renderer.setSize(window.innerWidth, window.innerHeight);
        this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    };

    // --- Physics Debug Renderer Methods ---

    private initializePhysicsDebugRenderer(): void {
        const material = new THREE.LineBasicMaterial({ vertexColors: true });
        const geometry = new THREE.BufferGeometry();
        this.physicsDebugLineSegments = new THREE.LineSegments(geometry, material);
        this.physicsDebugLineSegments.visible = this.showPhysicsDebug;
        // Add to the current scene if it exists, otherwise it gets added in loadScene
        if (this._activeScene) {
             this._activeScene.scene.add(this.physicsDebugLineSegments);
        }
    }

    private updatePhysicsDebugRenderer(): void {
        if (!this.physicsSystem || !this.physicsDebugLineSegments) return;

        this.physicsDebugLineSegments.visible = this.showPhysicsDebug;
        if (!this.showPhysicsDebug) return;

        const buffers = this.physicsSystem.getDebugRenderBuffers();
        const geometry = this.physicsDebugLineSegments.geometry;

        // Update geometry attributes
        geometry.setAttribute('position', new THREE.BufferAttribute(buffers.vertices, 3));
        geometry.setAttribute('color', new THREE.BufferAttribute(buffers.colors, 4)); // Colors might be RGBA

        // Important: Dispose old attributes if they exist to prevent memory leaks
        // (Though in this case, we are replacing them directly)
        geometry.attributes.position.needsUpdate = true;
        geometry.attributes.color.needsUpdate = true;
    }

    // --- End Physics Debug Renderer Methods ---
} 