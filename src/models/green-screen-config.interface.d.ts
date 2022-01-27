import { MaskSettings } from './masksettings.interface';
import { IBodyPixConfig } from './bodypix-config.interface';
import { GreenScreenStreamBodyPixMode } from './bodypixmode.enum';
export interface IGreenScreenConfig {
    maskSettings?: MaskSettings;
    bodyPixMode?: GreenScreenStreamBodyPixMode;
    bodyPixConfig?: IBodyPixConfig;
}
