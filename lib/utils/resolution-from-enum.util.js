"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.resolutionFromEnum = void 0;
const vector2_1 = require("./../models/vector2");
const video_resolution_enum_1 = require("./../models/enums/video-resolution.enum");
function resolutionFromEnum(videoResolution) {
    let resolution;
    switch (videoResolution) {
        case (video_resolution_enum_1.VideoResolution.UHD):
            resolution = new vector2_1.Vector2(3840, 2160);
            break;
        case (video_resolution_enum_1.VideoResolution.WQHD):
            resolution = new vector2_1.Vector2(2560, 1440);
            break;
        case (video_resolution_enum_1.VideoResolution.FullHD):
            resolution = new vector2_1.Vector2(1920, 1080);
            break;
        case (video_resolution_enum_1.VideoResolution.HD):
            resolution = new vector2_1.Vector2(1280, 720);
            break;
        case (video_resolution_enum_1.VideoResolution.SD):
            resolution = new vector2_1.Vector2(640, 360);
            break;
    }
    return resolution;
}
exports.resolutionFromEnum = resolutionFromEnum;
