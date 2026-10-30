import type {Type} from '@angular/core';
import type {ComponentName} from '@app/app.types';
import {BadgeShowcaseComponent} from './badge/badge-showcase.component';
import {CardShowcaseComponent} from './card/card-showcase.component';
import {ChipShowcaseComponent} from './chip/chip-showcase.component';
import {ButtonShowcaseComponent} from './button/button-showcase.component';
import {TimingButtonShowcaseComponent} from './timing-button/timing-button-showcase.component';
import {CheckboxShowcaseComponent} from './checkbox/checkbox-showcase.component';
import {ContextMenuShowcaseComponent} from './context-menu/context-menu-showcase.component';
import {DialogShowcaseComponent} from './dialog/dialog-showcase.component';
import {DrawerShowcaseComponent} from './drawer/drawer-showcase.component';
import {FormContainerShowcaseComponent} from './form-container/form-container-showcase.component';
import {IconButtonShowcaseComponent} from './icon-button/icon-button-showcase.component';
import {IconShowcaseComponent} from './icon/icon-showcase.component';
import {LinkShowcaseComponent} from './link/link-showcase.component';
import {NotificationShowcaseComponent} from './notification/notification-showcase.component';
import {InputShowcaseComponent} from './input/input-showcase.component';
import {PasswordInputFieldShowcaseComponent} from './password-input-field/password-input-field-showcase.component';
import {MultiSelectFieldShowcaseComponent} from './multi-select-field/multi-select-field-showcase.component';
import {RadioShowcaseComponent} from './radio/radio-showcase.component';
import {RouterLoaderShowcaseComponent} from './router-loader/router-loader-showcase.component';
import {SelectFieldShowcaseComponent} from './select-field/select-field-showcase.component';
import {SpokesLoaderShowcaseComponent} from './spokes-loader/spokes-loader-showcase.component';
import {ProgressBarShowcaseComponent} from './progress-bar/progress-bar-showcase.component';
import {ToggleShowcaseComponent} from './toggle/toggle-showcase.component';
import {TooltipShowcaseComponent} from './tooltip/tooltip-showcase.component';
import {PopoverShowcaseComponent} from './popover/popover-showcase.component';
import {TabsShowcaseComponent} from './tabs/tabs-showcase.component';
import {TagShowcaseComponent} from './tag/tag-showcase.component';
import {PictogramShowcaseComponent} from './pictogram/pictogram-showcase.component';
import {ScrollbarShowcaseComponent} from './scrollbar/scrollbar-showcase.component';
import {AccordionShowcaseComponent} from './accordion/accordion-showcase.component';
import {AutocompleteShowcaseComponent} from './autocomplete/autocomplete-showcase.component';
import {TableShowcaseComponent} from './table/table-showcase.component';
import {TextareaShowcaseComponent} from './textarea/textarea-showcase.component';

export const SHOWCASE_COMPONENTS: Record<ComponentName, Type<unknown>> = {
  'ndwu-accordion': AccordionShowcaseComponent,
  'ndwu-autocomplete': AutocompleteShowcaseComponent,
  'ndwu-badge': BadgeShowcaseComponent,
  'ndwu-button': ButtonShowcaseComponent,
  'ndwu-timing-button': TimingButtonShowcaseComponent,
  'ndwu-icon-button': IconButtonShowcaseComponent,
  'ndwu-checkbox': CheckboxShowcaseComponent,
  'ndwu-form-container': FormContainerShowcaseComponent,
  'ndwu-icon': IconShowcaseComponent,
  'ndwu-link': LinkShowcaseComponent,
  'ndwu-notification': NotificationShowcaseComponent,
  'ndwu-input': InputShowcaseComponent,
  'ndwu-password-input-field': PasswordInputFieldShowcaseComponent,
  'ndwu-radio': RadioShowcaseComponent,
  'ndwu-select-field': SelectFieldShowcaseComponent,
  'ndwu-multi-select-field': MultiSelectFieldShowcaseComponent,
  'ndwu-textarea': TextareaShowcaseComponent,
  'ndwu-context-menu': ContextMenuShowcaseComponent,
  'ndwu-tooltip': TooltipShowcaseComponent,
  'ndwu-popover': PopoverShowcaseComponent,
  'ndwu-dialog': DialogShowcaseComponent,
  'ndwu-drawer': DrawerShowcaseComponent,
  'ndwu-router-loader': RouterLoaderShowcaseComponent,
  'ndwu-spokes-loader': SpokesLoaderShowcaseComponent,
  'ndwu-progress-bar': ProgressBarShowcaseComponent,
  'ndwu-toggle': ToggleShowcaseComponent,
  'ndwu-card': CardShowcaseComponent,
  'ndwu-chip': ChipShowcaseComponent,
  'ndwu-tabs': TabsShowcaseComponent,
  'ndwu-tag': TagShowcaseComponent,
  'ndwu-pictogram': PictogramShowcaseComponent,
  'ndwu-scrollbar': ScrollbarShowcaseComponent,
  'ndwu-table': TableShowcaseComponent,
};
