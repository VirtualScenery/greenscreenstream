import { Vector2 } from './../models/vector2';
import { VideoResolution } from './../models/enums/video-resolution.enum';

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
            resolution = new Vector2(1024, 576);
            break;
    }
    console.log(resolution.toString(), resolution.toMediaConstraint())
    return resolution;
}