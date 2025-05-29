
/**
 * Represents the settings for texture processing, including configuration for background and webcam textures.
 *
 * @property background - Configuration for the background texture.
 * @property background.fn - A function associated with the background texture.
 * @property webcam - Configuration for the webcam texture.
 * @property webcam.fn - A function associated with the webcam texture.
 */
export interface ITextureSettings {
    background: {
        fn: Function
    }
    webcam: {
        fn: Function
    }
}