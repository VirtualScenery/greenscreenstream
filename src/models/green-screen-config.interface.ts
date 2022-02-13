import { IMaskSettings } from './masksettings.interface';
import { IBodyPixConfig } from './bodypix-config.interface';
import { BodyPixMode } from './bodypixmode.enum';

export interface IGreenScreenConfig {
    maskSettings?: IMaskSettings,
    bodyPixMode?: BodyPixMode,
    bodyPixConfig?: IBodyPixConfig
}