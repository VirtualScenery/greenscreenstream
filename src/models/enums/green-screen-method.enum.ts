/**
 * Enum representing the available methods for applying a green screen effect.
 *
 * @remarks
 * - `VirtualBackground`: Applies a virtual background without requiring a physical green screen.
 * - `VirtualBackgroundUsingGreenScreen`: Applies a virtual background using a physical green screen for improved effect.
 */
export enum GreenScreenMethod {
    VirtualBackground,
    VirtualBackgroundUsingGreenScreen
}