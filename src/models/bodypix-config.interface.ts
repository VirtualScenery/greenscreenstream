/**
 * Configuration options for the BodyPix model.
 *
 * @property architecture - The model architecture to use (e.g., 'MobileNetV1', 'ResNet50').
 * @property outputStride - The output stride of the model, which affects accuracy and speed.
 * @property multiplier - (Optional) The depth multiplier for the model, controlling model size.
 * @property quantBytes - Number of bytes used for weight quantization (e.g., 1, 2, or 4).
 */
export interface IBodyPixConfig {
    architecture: string;
    outputStride: number;
    multiplier?: number;
    quantBytes: number;
}