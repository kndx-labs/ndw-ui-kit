import {type IconName} from '../../../icon-names';
import {type NdwuBadgeTone} from '../badge/ndwu-badge.component';

export type NdwuTabVariant = 'default' | 'bordered';
export type NdwuTabsScrollMode = 'auto' | 'scrollable';
export type NdwuTabWidthMode = 'content' | 'fixed';

export interface TabItem {
  id: string;
  label: string;
  icon?: IconName | null;
  badge?: string | null;
  badgeTone?: NdwuBadgeTone;
  disabled?: boolean;
  widthMode?: NdwuTabWidthMode;
}
