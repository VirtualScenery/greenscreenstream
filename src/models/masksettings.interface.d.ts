export interface MaskSettings {
    opacity?: number;
    flipHorizontal?: boolean;
    maskBlurAmount?: number;
    foregroundColor?: {
        r: number;
        g: number;
        b: number;
        a: number;
    };
    backgroundColor?: {
        r: number;
        g: number;
        b: number;
        a: number;
    };
    segmentPerson?: {
        flipHorizontal?: boolean;
        internalResolution?: string;
        segmentationThreshold?: number;
        maxDetections?: number;
        quantBytes?: number;
    };
}
