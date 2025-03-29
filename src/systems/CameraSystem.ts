import * as THREE from 'three';
import { CameraMode, useCameraStore } from '../state/CameraState';
import { getMouseDelta } from '../state/InputState';
import RAPIER from '@dimforge/rapier3d-compat';
import { PhysicsSystem } from './PhysicsSystem';

/**
 * Manages camera positioning, rotation, and behavior based on the current camera mode.
 * Uses quaternions for smooth rotation and avoids gimbal lock issues.
 */
export class CameraSystem {
  private camera: THREE.PerspectiveCamera;
  private physicsSystem: PhysicsSystem;
  
  // Core camera state
  private targetPosition = new THREE.Vector3();
  private targetQuaternion = new THREE.Quaternion();
  private currentRotationX = 0; // Pitch (looking up/down)
  private currentRotationY = 0; // Yaw (looking left/right)
  
  // Reusable objects to avoid garbage collection
  private cameraDirection = new THREE.Vector3();
  private tempVec = new THREE.Vector3();
  private yawQuaternion = new THREE.Quaternion();
  private pitchQuaternion = new THREE.Quaternion();
  private upVector = new THREE.Vector3(0, 1, 0);
  private rightVector = new THREE.Vector3(1, 0, 0);
  private forwardVector = new THREE.Vector3(0, 0, -1);
  private playerPosition = new THREE.Vector3();
  private cameraOffset = new THREE.Vector3();
  
  constructor(camera: THREE.PerspectiveCamera, physicsSystem: PhysicsSystem) {
    this.camera = camera;
    this.physicsSystem = physicsSystem;
    this.targetPosition.copy(camera.position);
    this.targetQuaternion.copy(camera.quaternion);
    
    // Initialize rotation values from camera's initial orientation
    const euler = new THREE.Euler().setFromQuaternion(camera.quaternion, 'YXZ');
    this.currentRotationX = euler.x;
    this.currentRotationY = euler.y;
    
    console.log('CameraSystem initialized');
  }
  
  /**
   * Returns the camera's current forward vector (horizontal plane only).
   * @returns A normalized vector representing the camera's forward direction.
   */
  public getForwardVector(): THREE.Vector3 {
    // Get camera's raw forward vector (-Z axis)
    const forward = new THREE.Vector3(0, 0, -1);
    forward.applyQuaternion(this.camera.quaternion);
    
    // Project onto horizontal plane
    forward.y = 0;
    forward.normalize();
    
    return forward;
  }
  
  /**
   * Returns the camera's current right vector (horizontal plane only).
   * @returns A normalized vector representing the camera's right direction.
   */
  public getRightVector(): THREE.Vector3 {
    // Get camera's raw right vector (X axis)
    const right = new THREE.Vector3(1, 0, 0);
    right.applyQuaternion(this.camera.quaternion);
    
    // Project onto horizontal plane
    right.y = 0;
    right.normalize();
    
    return right;
  }
  
  /**
   * Updates camera position and rotation based on current mode and input.
   * @param playerBody The physics body of the player
   * @param playerMesh The visual mesh of the player
   * @param delta Time since last frame
   */
  public update(playerBody: RAPIER.RigidBody, playerMesh: THREE.Object3D, delta: number): void {
    const { mode, settings, enabled } = useCameraStore.getState();
    
    if (!enabled || !playerBody) return;
    
    // Get mouse movement for camera rotation
    const mouseDelta = getMouseDelta();
    
    // Update camera FOV if it changed
    if (this.camera.fov !== settings.fov) {
      this.camera.fov = settings.fov;
      this.camera.updateProjectionMatrix();
    }
    
    // Get player position from physics body
    const position = playerBody.translation();
    this.playerPosition.set(position.x, position.y, position.z);
    
    // Update camera rotation angles based on mouse input
    this.updateRotation(mouseDelta, settings.sensitivity);
    
    // Update player orientation based on camera mode
    this.updatePlayerOrientation(playerBody, playerMesh, mode);
    
    // Position camera based on current camera mode
    if (mode === CameraMode.FirstPerson) {
      this.updateFirstPersonCamera(settings);
    } else {
      // Both ThirdPerson and Orbital mode use the same camera positioning logic
      this.updateThirdPersonCamera(settings);
    }
    
    // Apply smoothing
    this.applySmoothing(settings.rotationLerpFactor, settings.positionLerpFactor);
    
    // Update player mesh visibility based on mode
    playerMesh.visible = mode !== CameraMode.FirstPerson;
  }
  
  /**
   * Updates camera rotation based on mouse input.
   * Uses separate quaternions for pitch and yaw for more stable rotations.
   */
  private updateRotation(mouseDelta: { x: number, y: number }, sensitivity: number): void {
    if (mouseDelta.x === 0 && mouseDelta.y === 0) return;
    
    // Scale sensitivity
    const sensitivityFactor = sensitivity * 0.01;
    
    // Calculate movement with optional smoothing for large movements
    const smoothX = Math.sign(mouseDelta.x) * Math.min(Math.abs(mouseDelta.x), 20);
    const smoothY = Math.sign(mouseDelta.y) * Math.min(Math.abs(mouseDelta.y), 20);
    
    // Update rotation angles (negative for correct direction)
    this.currentRotationY -= smoothX * sensitivityFactor;
    this.currentRotationX -= smoothY * sensitivityFactor;
    
    // Clamp vertical rotation to prevent flipping
    this.currentRotationX = Math.max(-Math.PI / 2 + 0.1, Math.min(Math.PI / 2 - 0.1, this.currentRotationX));
    
    // Create separate quaternions for pitch and yaw
    // Yaw (Y-axis rotation)
    this.yawQuaternion.setFromAxisAngle(this.upVector, this.currentRotationY);
    
    // Pitch (X-axis rotation) - around the world X axis
    this.pitchQuaternion.setFromAxisAngle(new THREE.Vector3(1, 0, 0), this.currentRotationX);
    
    // Combine the rotations: yaw first, then pitch
    // This correctly represents a camera that first rotates horizontally, then vertically
    this.targetQuaternion.copy(this.yawQuaternion).multiply(this.pitchQuaternion);
  }
  
  /**
   * Updates player mesh orientation to match camera's horizontal rotation
   * depending on the current camera mode.
   */
  private updatePlayerOrientation(playerBody: RAPIER.RigidBody, playerMesh: THREE.Object3D, mode: CameraMode): void {
    // In FirstPerson and ThirdPerson modes, player faces where camera points
    // In Orbital mode, player orientation remains independent
    if (mode === CameraMode.FirstPerson || mode === CameraMode.ThirdPerson) {
      // Only rotate player mesh around the Y axis (horizontal rotation)
      playerMesh.rotation.y = this.currentRotationY;
      
      // Also update the physics body to match the Y rotation
      // Create a quaternion for Y rotation only (used for both mesh and physics)
      const yRotation = new THREE.Quaternion().setFromAxisAngle(this.upVector, this.currentRotationY);
      
      // Update the physics body with the Y rotation
      this.physicsSystem.updateBodyYRotation(playerMesh, this.currentRotationY);
    }
    // In Orbital mode, we don't update player orientation here - it would be handled elsewhere
  }
  
  /**
   * Updates camera for first-person perspective.
   */
  private updateFirstPersonCamera(settings: any): void {
    // In first-person, camera is positioned at eye level inside the player mesh
    this.targetPosition.copy(this.playerPosition);
    this.targetPosition.y += settings.fpHeight; // Eye height from ground
  }
  
  /**
   * Updates camera for third-person perspective with improved positioning.
   */
  private updateThirdPersonCamera(settings: any): void {
    // Get current forward direction from camera quaternion
    this.forwardVector.set(0, 0, -1);
    this.forwardVector.applyQuaternion(this.targetQuaternion);
    
    // Reverse the direction for third-person offset
    this.cameraDirection.copy(this.forwardVector).negate();
    
    // Calculate camera position based on distance and direction from player
    this.cameraOffset.copy(this.cameraDirection).multiplyScalar(settings.distance);
    
    // Add height offset
    this.cameraOffset.y += settings.height;
    
    // If there's a horizontal offset (over-the-shoulder view)
    if (settings.offsetX !== 0) {
      // Get the right vector from our camera orientation
      this.rightVector.set(1, 0, 0).applyQuaternion(this.targetQuaternion);
      this.cameraOffset.addScaledVector(this.rightVector, settings.offsetX);
    }
    
    // Set target position
    this.targetPosition.copy(this.playerPosition).add(this.cameraOffset);
    
    // TODO: Add camera collision detection to prevent going through walls
  }
  
  /**
   * Apply position and rotation smoothing.
   */
  private applySmoothing(rotationFactor: number, positionFactor: number): void {
    // Apply smoothing to camera quaternion using slerp
    this.camera.quaternion.slerp(this.targetQuaternion, rotationFactor);
    
    // Apply smoothing to camera position
    this.camera.position.lerp(this.targetPosition, positionFactor);
  }
  
  /**
   * Resets the camera to default position and rotation.
   */
  public reset(): void {
    this.currentRotationX = 0;
    this.currentRotationY = 0;
    this.targetQuaternion.set(0, 0, 0, 1); // Identity quaternion
    this.targetPosition.set(0, 2, 5);
    
    this.camera.position.copy(this.targetPosition);
    this.camera.quaternion.copy(this.targetQuaternion);
  }
}