import * as THREE from 'three';
import RAPIER from '@dimforge/rapier3d-compat';
import { PhysicsEntity } from '../types/Physics.types';

/**
 * Manages the Rapier physics world, bodies, and simulation stepping.
 * Handles synchronization between physics bodies and Three.js meshes.
 */
export class PhysicsSystem {
    private world: RAPIER.World;
    private entities: PhysicsEntity[] = []; // List of all physics-enabled entities
    private gravity: RAPIER.Vector;

    // Event queue for handling physics events like collisions (optional but good practice)
    private eventQueue: RAPIER.EventQueue;

    constructor() {
        this.gravity = new RAPIER.Vector3(0.0, -9.81, 0.0); // Standard gravity
        this.world = new RAPIER.World(this.gravity);
        this.eventQueue = new RAPIER.EventQueue(true); // Enable contact force event reporting
        console.log('PhysicsSystem initialized.');
    }

    /**
     * Adds a Three.js object (Mesh, Group) to the physics simulation.
     *
     * @param mesh - The Three.js Object3D to represent the physics body.
     * @param bodyDesc - Rapier RigidBodyDescriptor defining the body type (dynamic, fixed, etc.).
     * @param colliderDesc - Rapier ColliderDescriptor defining the shape and properties.
     * @returns The created Rapier RigidBody.
     */
    public addBody(mesh: THREE.Object3D, bodyDesc: RAPIER.RigidBodyDesc, colliderDesc: RAPIER.ColliderDesc): RAPIER.RigidBody {
        // Set the initial position and rotation of the body from the mesh
        bodyDesc.setTranslation(mesh.position.x, mesh.position.y, mesh.position.z);
        bodyDesc.setRotation(mesh.quaternion);

        // Create body and collider (logs removed)
        const body = this.world.createRigidBody(bodyDesc);
        const collider = this.world.createCollider(colliderDesc, body);

        // Check if creation was successful before adding
        if (body && collider) {
            this.entities.push({ mesh, body });
        } else {
            // Keep error log in case creation fails unexpectedly
            console.error(`[PhysicsSystem] FAILED to create body or collider for: ${mesh.name || 'Unnamed'}`);
        }
        
        return body;
    }

    /**
     * Steps the physics simulation forward by the given delta time
     * and updates the corresponding Three.js mesh positions and rotations.
     *
     * @param _delta - Time step in seconds.
     */
    public step(_delta: number): void {
        // Step the simulation using only the event queue (default timestep)
        this.world.step(this.eventQueue);

        // --- Synchronization: Physics -> Graphics ---
        for (const entity of this.entities) {
            // Only update dynamic bodies (fixed bodies shouldn't move)
            if (!entity.body.isFixed()) {
                const position = entity.body.translation();
                const rotation = entity.body.rotation();

                entity.mesh.position.set(position.x, position.y, position.z);
                entity.mesh.quaternion.set(rotation.x, rotation.y, rotation.z, rotation.w);
            }
        }
    }

    /**
     * Returns the vertices and colors for debug rendering the physics world.
     * @returns An object containing Float32Arrays for vertices and colors.
     */
    public getDebugRenderBuffers(): { vertices: Float32Array, colors: Float32Array } {
        return this.world.debugRender();
    }

    /**
     * Cleans up Rapier resources.
     */
    public dispose(): void {
        // Rapier world doesn't have an explicit dispose in the JS bindings typically.
        // Resources are usually managed by the garbage collector.
        // However, clearing the entities array helps.
        this.entities = [];
        // If we were manually creating shapes/colliders not attached directly,
        // we might need to free them, but Rapier usually handles attached colliders/bodies.
        console.log('PhysicsSystem resources cleared (JS GC handles Rapier world).');
    }

    /**
     * Updates a rigid body's rotation from a external quaternion (like from camera).
     * @param mesh - The mesh associated with the rigid body.
     * @param quaternion - The quaternion to apply for rotation.
     * @returns True if the body was found and updated, false otherwise.
     */
    public updateBodyRotation(mesh: THREE.Object3D, quaternion: THREE.Quaternion): boolean {
        // Find the entity with the given mesh
        const entity = this.entities.find((e) => e.mesh === mesh);
        if (!entity || entity.body.isFixed()) return false;
        
        // Convert Three.js quaternion to Rapier quaternion
        const rotation = { x: quaternion.x, y: quaternion.y, z: quaternion.z, w: quaternion.w };
        
        // Apply the rotation to the rigid body
        entity.body.setRotation(rotation, true);
        
        return true;
    }
    
    /**
     * Updates a rigid body's Y-axis rotation only (common for player characters).
     * @param mesh - The mesh associated with the rigid body.
     * @param yRotation - The Y rotation in radians.
     * @returns True if the body was found and updated, false otherwise.
     */
    public updateBodyYRotation(mesh: THREE.Object3D, yRotation: number): boolean {
        // Find the entity with the given mesh
        const entity = this.entities.find((e) => e.mesh === mesh);
        if (!entity || entity.body.isFixed()) return false;
        
        // Get current rotation
        // const _currentRotation = entity.body.rotation();
        
        // Create a quaternion from the y-axis rotation
        const quaternion = new RAPIER.Quaternion(0, Math.sin(yRotation / 2), 0, Math.cos(yRotation / 2));
        
        // Apply the rotation to the rigid body
        entity.body.setRotation(quaternion, true);
        
        return true;
    }
}

// Ensure Rapier is initialized (needs to be done once)
// We can do this here or in a more central place like main.ts
// Doing it here keeps physics-related setup contained.
let rapierInitialized = false;
export async function initializeRapier(): Promise<void> {
    if (rapierInitialized) return;
    await RAPIER.init();
    rapierInitialized = true;
    console.log('Rapier initialized successfully.');
} 