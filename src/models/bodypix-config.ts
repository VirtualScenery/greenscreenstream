import { BodyPixConfig } from "./bodypix-config.interface"

export const bodyPixFast: BodyPixConfig  = {
    architecture: 'MobileNetV1',
    outputStride: 16,
    multiplier: 0.5,
    quantBytes: 1
}

export const bodyPixStandard: BodyPixConfig  = {
    architecture: 'MobileNetV1',
    outputStride: 16,
    multiplier: 0.75,
    quantBytes: 2
}

export const bodyPixPrecise: BodyPixConfig  = {
    architecture: 'MobileNetV1',
    outputStride: 16,
    multiplier: 1,
    quantBytes: 2
}

export const bodyPixMaximum: BodyPixConfig  = {
    architecture: 'ResNet50',
    outputStride: 32,
    quantBytes: 2
}


