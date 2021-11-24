export interface RGBA {
    r: number, g: number, b: number, a: number
}

export interface MaskSettings {
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

export const DEFAULT_MASK_SETTINGS: MaskSettings = {
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