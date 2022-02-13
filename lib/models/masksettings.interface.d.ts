export interface RGBA {
    r: number;
    g: number;
    b: number;
    a: number;
}
export interface IMaskSettings {
    opacity?: number;
    flipHorizontal?: boolean;
    maskBlurAmount?: number;
    foregroundColor?: RGBA;
    backgroundColor?: RGBA;
    segmentPerson?: {
        flipHorizontal?: boolean;
        internalResolution?: string;
        segmentationThreshold?: number;
        maxDetections?: number;
        quantBytes?: number;
    };
}
export declare const DEFAULT_MASK_SETTINGS: IMaskSettings;
//# sourceMappingURL=masksettings.interface.d.ts.map