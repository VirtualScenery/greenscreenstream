import { VideoResolution } from '../models/enums/video-resolution.enum';
import { Vector2 } from '../models/vector2';

/**
 * Returns the pixel dimensions as a `Vector2` corresponding to the given `VideoResolution` enum value.
 *
 * @param videoResolution - The video resolution enum value to convert.
 * @returns A `Vector2` representing the width and height in pixels for the specified resolution.
 */
export function resolutionFromEnum(videoResolution: VideoResolution): Vector2 {
    let resolution: Vector2;

    switch (videoResolution) {
        case (VideoResolution.UHD):
            resolution = new Vector2(3840, 2160);
            break;
        case (VideoResolution.WQHD):
            resolution = new Vector2(2560, 1440);
            break;
        case (VideoResolution.FullHD):
            resolution = new Vector2(1920, 1080);
            break;
        case (VideoResolution.HD):
            resolution = new Vector2(1280, 720);
            break;
        case (VideoResolution.SD):
            resolution = new Vector2(640, 360);
            break;
    }
    return resolution;
}