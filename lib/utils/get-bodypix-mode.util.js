"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getBodyPixMode = void 0;
const bodypix_config_1 = require("../models/bodypix-config");
const bodypixmode_enum_1 = require("../models/enums/bodypixmode.enum");
function getBodyPixMode(mode) {
    switch (mode) {
        case bodypixmode_enum_1.BodyPixMode.Fast:
            return bodypix_config_1.bodyPixFast;
        case bodypixmode_enum_1.BodyPixMode.Precise:
            return bodypix_config_1.bodyPixPrecise;
        case bodypixmode_enum_1.BodyPixMode.Maximum:
            return bodypix_config_1.bodyPixMaximum;
        case bodypixmode_enum_1.BodyPixMode.Standard:
        //Fallthrough intended
        default:
            return bodypix_config_1.bodyPixStandard;
    }
}
exports.getBodyPixMode = getBodyPixMode;
