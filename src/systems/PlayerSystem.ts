import * as RAPIER from '@dimforge/rapier3d-compat';
import { useInputStore } from '../state/InputState';
import { InputAction } from '../enums/InputAction';
import * as THREE from 'three'; // Use THREE for Vector3

/**
 * Handles player movement based on input actions.
 */
export class PlayerSystem {
    public moveSpeed: number = 5.0; // Movement speed multiplier
    public jumpForce: number = 7.0; // Jump impulse strength
    public maxSpeed: number = 10.0; // Maximum horizontal velocity
    public damping: number = 0.90; // Damping factor (0-1, closer to 0 = stronger damping)
    private movementDirection = new THREE.Vector3();
    
    // Constants for ground check
    private readonly PLAYER_HEIGHT = 1.8;
    private readonly GROUND_THRESHOLD = 0.15;
    private readonly LOW_VELOCITY_THRESHOLD = 0.2;

    constructor() {
        console.log('PlayerSystem initialized.');
    }
    
    /**
     * Checks if the player is considered grounded.
     * @param playerBody The player's rigid body
     * @returns True if the player is on the ground
     */
    private isGrounded(playerBody: RAPIER.RigidBody): boolean {
        const position = playerBody.translation();
        const velocity = playerBody.linvel();
        
        // Calculate feet position
        const feetPosition = position.y - (this.PLAYER_HEIGHT / 2);
        const groundDistance = Math.max(0, feetPosition);
        
        // Check both distance to ground and vertical velocity
        return groundDistance < this.GROUND_THRESHOLD && 
               Math.abs(velocity.y) < this.LOW_VELOCITY_THRESHOLD;
    }

    /**
     * Public method to check if a player body is grounded.
     * Useful for external components like debug UI.
     * @param playerBody The player's rigid body
     * @returns True if the player is on the ground
     */
    public checkIfGrounded(playerBody: RAPIER.RigidBody): boolean {
        return this.isGrounded(playerBody);
    }

    /**
     * Updates the player's rigid body based on current input.
     * @param playerBody The RAPIER.RigidBody of the player.
     * @param delta Time since last frame (optional, for frame-rate independent force).
     */
    public update(playerBody: RAPIER.RigidBody, delta: number): void {
        if (!playerBody) return; // Don't run if body doesn't exist

        const actions = useInputStore.getState().actions;
        const currentVelocity = playerBody.linvel();

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
        const horizontalVelocity = new THREE.Vector2(currentVelocity.x, currentVelocity.z);
        
        if (horizontalVelocity.lengthSq() > this.maxSpeed * this.maxSpeed) {
            horizontalVelocity.normalize().multiplyScalar(this.maxSpeed);
            playerBody.setLinvel({ x: horizontalVelocity.x, y: currentVelocity.y, z: horizontalVelocity.y }, true);
        }
        
        // --- Apply Jump Impulse --- 
        if (actions[InputAction.Jump]) {
            // Only jump if grounded
            if (this.isGrounded(playerBody)) {
                playerBody.setLinvel({ x: currentVelocity.x, y: 0, z: currentVelocity.z }, true); // Reset vertical velocity before jump
                playerBody.applyImpulse({ x: 0, y: this.jumpForce, z: 0 }, true);
            }
            
            // Immediately reset jump action to prevent multi-jump per press
            useInputStore.getState().setAction(InputAction.Jump, false);
        }

        // --- Apply Damping --- 
        // Only apply damping when there's no directional input
        if (this.movementDirection.lengthSq() === 0) {
            // Only apply horizontal damping if grounded, to avoid slowing in mid-air
            if (this.isGrounded(playerBody)) {
                playerBody.setLinvel({ 
                    x: currentVelocity.x * this.damping, 
                    y: currentVelocity.y, 
                    z: currentVelocity.z * this.damping 
                }, true);
            }
        }
    }
} 