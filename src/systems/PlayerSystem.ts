import * as RAPIER from '@dimforge/rapier3d-compat';
import { useInputStore } from '../state/InputState';
import { InputAction } from '../enums/InputAction';
import * as THREE from 'three'; // Use THREE for Vector3

/**
 * Handles player movement based on input actions.
 */
export class PlayerSystem {
    private moveSpeed: number = 5.0; // Adjust as needed
    private jumpForce: number = 7.0;  // Adjust as needed
    private movementDirection = new THREE.Vector3();

    constructor() {
        console.log('PlayerSystem initialized.');
    }

    /**
     * Updates the player's rigid body based on current input.
     * @param playerBody The RAPIER.RigidBody of the player.
     * @param delta Time since last frame (optional, for frame-rate independent force).
     */
    public update(playerBody: RAPIER.RigidBody, delta: number): void {
        if (!playerBody) return; // Don't run if body doesn't exist

        const actions = useInputStore.getState().actions;

        // --- Calculate Movement Direction --- 
        this.movementDirection.set(0, 0, 0);
        if (actions[InputAction.Forward]) {
            this.movementDirection.z -= 1;
        }
        if (actions[InputAction.Backward]) {
            this.movementDirection.z += 1;
        }
        if (actions[InputAction.Left]) {
            this.movementDirection.x -= 1;
        }
        if (actions[InputAction.Right]) {
            this.movementDirection.x += 1;
        }

        // Normalize direction vector if needed (prevents faster diagonal movement)
        if (this.movementDirection.lengthSq() > 0) {
            this.movementDirection.normalize();
        }

        // --- Apply Movement Force/Impulse --- 
        // Using impulses for responsiveness. Multiplying by delta helps smooth it slightly.
        const moveImpulse = this.movementDirection.multiplyScalar(this.moveSpeed * delta * 10); // Adjust multiplier for desired feel
        playerBody.applyImpulse({ x: moveImpulse.x, y: 0, z: moveImpulse.z }, true);

        // --- Limit Linear Velocity --- 
        // Clamp horizontal speed to prevent runaway acceleration from impulses
        const currentVelocity = playerBody.linvel();
        const horizontalVelocity = new THREE.Vector2(currentVelocity.x, currentVelocity.z);
        const maxSpeed = this.moveSpeed; 

        if (horizontalVelocity.lengthSq() > maxSpeed * maxSpeed) {
            horizontalVelocity.normalize().multiplyScalar(maxSpeed);
            playerBody.setLinvel({ x: horizontalVelocity.x, y: currentVelocity.y, z: horizontalVelocity.y }, true);
        }
        
        // --- Apply Jump Impulse --- 
        if (actions[InputAction.Jump]) {
            // Rudimentary check: only jump if close to the ground (e.g., small vertical velocity)
            // A proper implementation would use raycasting down or shape casting.
            if (Math.abs(currentVelocity.y) < 0.1) { 
                playerBody.setLinvel({ x: currentVelocity.x, y: 0, z: currentVelocity.z }, true); // Reset vertical velocity before jump
                playerBody.applyImpulse({ x: 0, y: this.jumpForce, z: 0 }, true);
            }
            // Immediately reset jump action to prevent multi-jump per press
            useInputStore.getState().setAction(InputAction.Jump, false);
        }

        // --- Apply Damping --- 
        // Apply damping when there's no directional input to slow down
        if (this.movementDirection.lengthSq() === 0 && Math.abs(currentVelocity.y) < 0.1) { // Only damp horizontal if near ground
            const dampingFactor = 0.90; // Adjust factor (closer to 0 = stronger damping)
            playerBody.setLinvel({ x: currentVelocity.x * dampingFactor, y: currentVelocity.y, z: currentVelocity.z * dampingFactor }, true);
        }
    }
} 