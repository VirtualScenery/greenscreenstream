export interface RGBA {
    r: number, g: number, b: number, a: number
}

/**
 * Interface representing the configuration options for mask settings.
 *
 * @property {number} [opacity] - The opacity level of the mask, ranging from 0 (fully transparent) to 1 (fully opaque).
 * @property {boolean} [flipHorizontal] - Whether to flip the mask horizontally.
 * @property {number} [maskBlurAmount] - The amount of blur to apply to the mask edges.
 * @property {RGBA} [foregroundColor] - The RGBA color to use for the foreground.
 * @property {RGBA} [backgroundColor] - The RGBA color to use for the background.
 * @property {object} [segmentPerson] - Additional settings for person segmentation.
 * @property {boolean} [segmentPerson.flipHorizontal] - Whether to flip the segmentation result horizontally.
 * @property {string} [segmentPerson.internalResolution] - The internal resolution used for segmentation (e.g., 'low', 'medium', 'high').
 * @property {number} [segmentPerson.segmentationThreshold] - The threshold for segmentation confidence.
 * @property {number} [segmentPerson.maxDetections] - The maximum number of detections to process.
 * @property {number} [segmentPerson.quantBytes] - The number of bytes used for quantization in the segmentation model.
 */
export interface IMaskSettings {
    opacity?: number
    flipHorizontal?: boolean
    maskBlurAmount?: number
    foregroundColor?: RGBA
    backgroundColor?: RGBA
    segmentPerson?: {
        flipHorizontal?: boolean
        internalResolution?: string
        segmentationThreshold?: number
        maxDetections?: number
        quantBytes?: number
    }
};

/**
 * The default configuration for mask settings used in the application.
 *
 * @remarks
 * This constant provides the initial values for mask-related options, including opacity,
 * horizontal flipping, blur amount, and color settings for both foreground and background.
 * It also contains default parameters for person segmentation, such as resolution,
 * segmentation threshold, detection count, and quantization bytes.
 *
 * @const
 * @type {IMaskSettings}
 * @see IMaskSettings
 */
export const DEFAULT_MASK_SETTINGS: IMaskSettings = {
    opacity: 1.0,
    flipHorizontal: true,
    maskBlurAmount: 3,
    foregroundColor:  { r: 255, g: 255, b: 255, a: 0 },
    backgroundColor: { r: 0, g: 177, b: 64, a: 255 },
    segmentPerson: {
        flipHorizontal: true,
        internalResolution: 'medium',
        segmentationThreshold: 0.7,
        maxDetections: 1,
        quantBytes: 2
    }
}