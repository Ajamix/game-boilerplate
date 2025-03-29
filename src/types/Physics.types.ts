import * as THREE from 'three';
import RAPIER from '@dimforge/rapier3d-compat';

/**
 * Represents a link between a Three.js mesh and its corresponding Rapier physics body
 */
export interface PhysicsEntity {
    /** The Three.js object that visually represents the entity */
    mesh: THREE.Object3D;
    
    /** The Rapier rigid body that handles physics simulation */
    body: RAPIER.RigidBody;
    
    // Optional: Collider if needed for direct access, though body.collider(0) often works
    // collider: RAPIER.Collider;
} 