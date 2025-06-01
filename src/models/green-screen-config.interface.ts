import { IBodyPixConfig } from './bodypix-config.interface';
import { BodyPixMode } from './enums/bodypixmode.enum';
import { IMaskSettings } from './masksettings.interface';

/**
 * Represents the configuration options for the green screen feature.
 *
 * @property {IMaskSettings} [maskSettings] - Optional settings for the mask applied to the green screen.
 * @property {BodyPixMode} [bodyPixMode] - Optional mode for the BodyPix segmentation algorithm.
 * @property {IBodyPixConfig} [bodyPixConfig] - Optional configuration for the BodyPix model.
 */
export interface IGreenScreenConfig {
    maskSettings?: IMaskSettings,
    bodyPixMode?: BodyPixMode,
    bodyPixConfig?: IBodyPixConfig
}