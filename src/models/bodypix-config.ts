import { IBodyPixConfig } from './bodypix-config.interface';

/**
 * Configuration object for BodyPix using the fast MobileNetV1 architecture.
 *
 * - `architecture`: Specifies the neural network architecture to use. 'MobileNetV1' is optimized for speed.
 * - `outputStride`: The output stride of the model. Lower values increase accuracy but reduce speed. 16 is a good trade-off for real-time applications.
 * - `multiplier`: Controls the number of parameters in the model. 0.5 reduces model size and increases speed at the cost of some accuracy.
 * - `quantBytes`: Number of bytes used for weight quantization. 1 byte provides the smallest model size and fastest inference.
 *
 * This configuration is suitable for applications where real-time performance is prioritized over maximum accuracy.
 */
export const bodyPixFast: IBodyPixConfig  = {
    architecture: 'MobileNetV1',
    outputStride: 16,
    multiplier: 0.5,
    quantBytes: 1
}


/**
 * Standard configuration for the BodyPix model using the MobileNetV1 architecture.
 *
 * @remarks
 * This configuration is optimized for a balance between performance and accuracy.
 *
 * @property {string} architecture - The model architecture to use ('MobileNetV1').
 * @property {number} outputStride - The output stride, which affects accuracy and speed (16).
 * @property {number} multiplier - The depth multiplier for the MobileNet model (0.75).
 * @property {number} quantBytes - Number of bytes used for weight quantization (2).
 *
 * @see {@link https://github.com/tensorflow/tfjs-models/tree/master/body-pix BodyPix documentation}
 */
export const bodyPixStandard: IBodyPixConfig  = {
    architecture: 'MobileNetV1',
    outputStride: 16,
    multiplier: 0.75,
    quantBytes: 2
}

/**
 * Configuration object for BodyPix model with precise settings.
 *
 * - `architecture`: Specifies the model architecture to use. 'MobileNetV1' is a lightweight model suitable for real-time applications.
 * - `outputStride`: The stride at which output is computed. Lower values increase accuracy but reduce speed. 16 is a balanced choice.
 * - `multiplier`: Controls the number of parameters in the model. 1 means the full model is used for maximum accuracy.
 * - `quantBytes`: Number of bytes used for weight quantization. 2 provides a balance between model size and accuracy.
 *
 * This configuration is optimized for precise segmentation results.
 */
export const bodyPixPrecise: IBodyPixConfig  = {
    architecture: 'MobileNetV1',
    outputStride: 16,
    multiplier: 1,
    quantBytes: 2
}

/**
 * The maximum quality configuration for BodyPix using the ResNet50 architecture.
 * 
 * @remarks
 * This configuration prioritizes accuracy and detail in segmentation results.
 * 
 * @property architecture - The model architecture to use ('ResNet50' for higher accuracy).
 * @property outputStride - The output stride; lower values increase accuracy but reduce speed (32 is the slowest, most accurate).
 * @property quantBytes - Number of bytes used for weight quantization (2 balances model size and performance).
 */
export const bodyPixMaximum: IBodyPixConfig  = {
    architecture: 'ResNet50',
    outputStride: 32,
    quantBytes: 2
}


