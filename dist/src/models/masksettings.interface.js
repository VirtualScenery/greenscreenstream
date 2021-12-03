"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DEFAULT_MASK_SETTINGS = void 0;
;
exports.DEFAULT_MASK_SETTINGS = {
    opacity: 1.0,
    flipHorizontal: true,
    maskBlurAmount: 3,
    foregroundColor: { r: 255, g: 255, b: 255, a: 0 },
    backgroundColor: { r: 0, g: 177, b: 64, a: 255 },
    segmentPerson: {
        flipHorizontal: true,
        internalResolution: 'medium',
        segmentationThreshold: 0.7,
        maxDetections: 1,
        quantBytes: 2
    }
};
//# sourceMappingURL=masksettings.interface.js.map