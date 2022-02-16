"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.VideoResolution = exports.BodyPixMode = exports.GreenScreenMethod = exports.Vector2 = exports.GreenScreenStream = void 0;
//Classes
var green_screen_stream_1 = require("./green-screen-stream");
Object.defineProperty(exports, "GreenScreenStream", { enumerable: true, get: function () { return green_screen_stream_1.GreenScreenStream; } });
var vector2_1 = require("./models/vector2");
Object.defineProperty(exports, "Vector2", { enumerable: true, get: function () { return vector2_1.Vector2; } });
//Enums
var green_screen_method_enum_1 = require("./models/enums/green-screen-method.enum");
Object.defineProperty(exports, "GreenScreenMethod", { enumerable: true, get: function () { return green_screen_method_enum_1.GreenScreenMethod; } });
var bodypixmode_enum_1 = require("./models/enums/bodypixmode.enum");
Object.defineProperty(exports, "BodyPixMode", { enumerable: true, get: function () { return bodypixmode_enum_1.BodyPixMode; } });
var video_resolution_enum_1 = require("./models/enums/video-resolution.enum");
Object.defineProperty(exports, "VideoResolution", { enumerable: true, get: function () { return video_resolution_enum_1.VideoResolution; } });
