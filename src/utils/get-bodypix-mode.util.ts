import { bodyPixFast, bodyPixMaximum, bodyPixPrecise, bodyPixStandard } from "../models/bodypix-config";
import { BodyPixConfig } from "../models/bodypix-config.interface";
import { BodyPixMode } from "../models/bodypixmode.enum";

export function getBodyPixMode(mode: BodyPixMode): BodyPixConfig {
    switch (mode) {
        case BodyPixMode.Fast:
            return bodyPixFast; 

        case BodyPixMode.Precise:
            return bodyPixPrecise;
        
        case BodyPixMode.Maximum:
            return bodyPixMaximum;
        
        case BodyPixMode.Standard:
            //Fallthrough intended
        default:
            return bodyPixStandard;
    }
}
