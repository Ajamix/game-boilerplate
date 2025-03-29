import * as THREE from 'three';
import { CameraMode, useCameraStore } from '../state/CameraState';
import { getMouseDelta } from '../state/InputState';
import RAPIER from '@dimforge/rapier3d-compat';

/**
 * Manages camera positioning, rotation, and behavior based on the current camera mode.
 * Uses quaternions for smooth rotation and avoids gimbal lock issues.
 */
export class CameraSystem {
  private camera: THREE.PerspectiveCamera;
  
  // Core camera state
  private targetPosition = new THREE.Vector3();
  private targetQuaternion = new THREE.Quaternion();
  private currentRotationX = 0; // Pitch (looking up/down)
  private currentRotationY = 0; // Yaw (looking left/right)
  
  // Reusable objects to avoid garbage collection
  private cameraDirection = new THREE.Vector3();
  private tempVec = new THREE.Vector3();
  private tempQuat = new THREE.Quaternion();
  private upVector = new THREE.Vector3(0, 1, 0);
  private rightVector = new THREE.Vector3(1, 0, 0);
  private forwardVector = new THREE.Vector3(0, 0, -1);
  private playerPosition = new THREE.Vector3();
  private cameraOffset = new THREE.Vector3();
  
  constructor(camera: THREE.PerspectiveCamera) {
    this.camera = camera;
    this.targetPosition.copy(camera.position);
    this.targetQuaternion.copy(camera.quaternion);
    
    // Initialize rotation values from camera's initial orientation
    const euler = new THREE.Euler().setFromQuaternion(camera.quaternion, 'YXZ');
    this.currentRotationX = euler.x;
    this.currentRotationY = euler.y;
    
    console.log('CameraSystem initialized');
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
    
    // Update player mesh rotation to match camera's horizontal rotation
    this.updatePlayerOrientation(playerMesh);
    
    // Position camera based on current camera mode
    if (mode === CameraMode.FirstPerson) {
      this.updateFirstPersonCamera(settings);
    } else {
      this.updateThirdPersonCamera(settings);
    }
    
    // Apply smoothing
    this.applySmoothing(settings.rotationLerpFactor, settings.positionLerpFactor);
    
    // Update player mesh visibility based on mode
    playerMesh.visible = mode !== CameraMode.FirstPerson;
  }
  
  /**
   * Updates camera rotation based on mouse input.
   * Uses separate X and Y rotations to avoid gimbal lock.
   */
  private updateRotation(mouseDelta: { x: number, y: number }, sensitivity: number): void {
    if (mouseDelta.x === 0 && mouseDelta.y === 0) return;
    
    // Scale sensitivity
    const sensitivityFactor = sensitivity * 0.01;
    
    // Update rotation angles (negative because moving mouse right should rotate right)
    this.currentRotationY -= mouseDelta.x * sensitivityFactor;
    this.currentRotationX -= mouseDelta.y * sensitivityFactor;
    
    // Clamp vertical rotation to prevent flipping
    this.currentRotationX = Math.max(-Math.PI / 2.1, Math.min(Math.PI / 2.1, this.currentRotationX));
    
    // Create quaternion from the rotation (YXZ order to prevent gimbal lock)
    // First rotate around Y axis (left/right)
    this.targetQuaternion.setFromAxisAngle(this.upVector, this.currentRotationY);
    
    // Then rotate around X axis (up/down) relative to the rotated space
    this.tempQuat.setFromAxisAngle(this.rightVector, this.currentRotationX);
    this.targetQuaternion.multiply(this.tempQuat);
  }
  
  /**
   * Updates player mesh orientation to match camera's horizontal rotation.
   */
  private updatePlayerOrientation(playerMesh: THREE.Object3D): void {
    // Only rotate player mesh around the Y axis (horizontal rotation)
    playerMesh.rotation.y = this.currentRotationY;
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