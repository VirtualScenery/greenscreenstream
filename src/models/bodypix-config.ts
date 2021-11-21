import { IBodyPixConfig } from "./bodypix-config.interface"

export const bodyPixFast: IBodyPixConfig  = {
    architecture: 'MobileNetV1',
    outputStride: 16,
    multiplier: 0.5,
    quantBytes: 1
}

export const bodyPixStandard: IBodyPixConfig  = {
    architecture: 'MobileNetV1',
    outputStride: 16,
    multiplier: 0.75,
    quantBytes: 2
}

export const bodyPixPrecise: IBodyPixConfig  = {
    architecture: 'MobileNetV1',
    outputStride: 16,
    multiplier: 1,
    quantBytes: 2
}

export const bodyPixMaximum: IBodyPixConfig  = {
    architecture: 'ResNet50',
    outputStride: 32,
    quantBytes: 2
}


