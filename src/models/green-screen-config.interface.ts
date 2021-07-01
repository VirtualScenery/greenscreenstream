import { MaskSettings } from './masksettings.interface';
import { BodyPixConfig } from './bodypix-config.interface';
import { BodyPixMode } from './bodypixmode.enum';

export interface GreenScreenConfig {
    maskSettings?: MaskSettings,
    bodyPixMode?: BodyPixMode,
    bodyPixConfig?: BodyPixConfig
}