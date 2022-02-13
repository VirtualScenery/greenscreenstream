import { bodyPixFast, bodyPixMaximum, bodyPixPrecise, bodyPixStandard } from "../models/bodypix-config";
import { IBodyPixConfig } from "../models/bodypix-config.interface";
import { BodyPixMode } from "../models/enums/bodypixmode.enum";

export function getBodyPixMode(mode: BodyPixMode): IBodyPixConfig {
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
