import { MaskSettings } from './masksettings.type';
import { BodyPixConfig } from './bodypix-config.interface';
import { BodyPixMode } from './bodypixmode.enum';

export type GreenScreenConfig = {
    maskSettings?: MaskSettings,
    bodyPixMode?: BodyPixMode,
    bodyPixConfig?: BodyPixConfig
}