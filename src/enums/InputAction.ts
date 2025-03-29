/**
 * Defines the constant values used for input actions throughout the application.
 * Using 'as const' provides stricter typing, similar to an enum.
 */
export const InputAction = {
    Forward: 'FORWARD',
    Backward: 'BACKWARD',
    Left: 'LEFT',
    Right: 'RIGHT',
    Jump: 'JUMP',
    Run: 'RUN',
    Action1: 'ACTION_1'
} as const;

/**
 * Represents the possible string values derived from the InputAction object.
 * This type is used where an action value is expected.
 */
export type InputActionValue = typeof InputAction[keyof typeof InputAction]; 