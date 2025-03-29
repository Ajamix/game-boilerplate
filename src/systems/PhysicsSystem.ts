import * as THREE from 'three';
import RAPIER from '@dimforge/rapier3d-compat';

// Interface to link a Three.js mesh with its Rapier rigid body
interface PhysicsEntity {
    mesh: THREE.Object3D; // Use Object3D for flexibility (Mesh, Group, etc.)
    body: RAPIER.RigidBody;
    // Optional: Collider if needed for direct access, though body.collider(0) often works
    // collider: RAPIER.Collider;
}

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

        const body = this.world.createRigidBody(bodyDesc);
        this.world.createCollider(colliderDesc, body);

        this.entities.push({ mesh, body });
        console.log(`Physics body added for mesh: ${mesh.name || 'Unnamed'}`);
        return body;
    }

    /**
     * Steps the physics simulation forward by the given delta time
     * and updates the corresponding Three.js mesh positions and rotations.
     *
     * @param delta - Time step in seconds.
     */
    public step(delta: number): void {
        // Step the simulation
        // Clamp delta to avoid instability with large time steps
        const effectiveDelta = Math.min(delta, 0.1); 
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

        // --- Handle Physics Events (Example: Collision logging) ---
        // this.eventQueue.drainCollisionEvents((handle1, handle2, started) => {
        //     // Find entities corresponding to handles if needed
        //     console.log(`Collision event: ${handle1}, ${handle2}, Started: ${started}`);
        // });

        // this.eventQueue.drainContactForceEvents(event => {
        //     // Handle contact forces
        //     console.log(`Contact force event on handle: ${event.collider1()}`);
        // });
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