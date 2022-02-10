import { IMaskSettings } from './masksettings.interface';
import { IBodyPixConfig } from './bodypix-config.interface';
import { GreenScreenStreamBodyPixMode } from './bodypixmode.enum';

export interface IGreenScreenConfig {
    maskSettings?: IMaskSettings,
    bodyPixMode?: GreenScreenStreamBodyPixMode,
    bodyPixConfig?: IBodyPixConfig
}