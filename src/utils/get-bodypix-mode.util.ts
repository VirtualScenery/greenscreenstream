import { bodyPixFast, bodyPixMaximum, bodyPixPrecise, bodyPixStandard } from "../models/bodypix-config";
import { IBodyPixConfig } from "../models/bodypix-config.interface";
import { GreenScreenStreamBodyPixMode } from "../models/bodypixmode.enum";

export function getBodyPixMode(mode: GreenScreenStreamBodyPixMode): IBodyPixConfig {
    switch (mode) {
        case GreenScreenStreamBodyPixMode.Fast:
            return bodyPixFast; 

        case GreenScreenStreamBodyPixMode.Precise:
            return bodyPixPrecise;
        
        case GreenScreenStreamBodyPixMode.Maximum:
            return bodyPixMaximum;
        
        case GreenScreenStreamBodyPixMode.Standard:
            //Fallthrough intended
        default:
            return bodyPixStandard;
    }
}
