import {
  bodyPixFast,
  bodyPixMaximum,
  bodyPixPrecise,
  bodyPixStandard,
} from '../models/bodypix-config';
import { IBodyPixConfig } from '../models/bodypix-config.interface';
import { BodyPixMode } from '../models/enums/bodypixmode.enum';

/**
 * Returns the BodyPix configuration object corresponding to the specified mode.
 *
 * @param mode - The desired BodyPix mode (e.g., Fast, Precise, Maximum, Standard).
 * @returns The configuration object for the given BodyPix mode.
 * 
 * If the provided mode is not recognized, the function defaults to returning the standard configuration.
 */
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
