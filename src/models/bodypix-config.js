"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.bodyPixMaximum = exports.bodyPixPrecise = exports.bodyPixStandard = exports.bodyPixFast = void 0;
exports.bodyPixFast = {
    architecture: 'MobileNetV1',
    outputStride: 16,
    multiplier: 0.5,
    quantBytes: 1
};
exports.bodyPixStandard = {
    architecture: 'MobileNetV1',
    outputStride: 16,
    multiplier: 0.75,
    quantBytes: 2
};
exports.bodyPixPrecise = {
    architecture: 'MobileNetV1',
    outputStride: 16,
    multiplier: 1,
    quantBytes: 2
};
exports.bodyPixMaximum = {
    architecture: 'ResNet50',
    outputStride: 32,
    quantBytes: 2
};
//# sourceMappingURL=bodypix-config.js.map