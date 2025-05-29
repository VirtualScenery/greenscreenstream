/**
 * Enumeration representing the available modes for BodyPix processing.
 * 
 * - `Fast`: Optimized for speed, providing quicker results with lower accuracy.
 * - `Standard`: Balanced mode offering a compromise between speed and accuracy.
 * - `Precise`: Prioritizes accuracy over speed, suitable for more detailed segmentation.
 * - `Maximum`: Uses the highest level of precision, potentially at the cost of performance.
 */
export enum BodyPixMode {
    Fast,
    Standard,
    Precise,
    Maximum
}