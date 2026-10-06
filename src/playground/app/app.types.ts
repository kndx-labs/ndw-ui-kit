export type ExampleName = 'user-profile-form' | 'validators';

export type WidgetName =
  | 'ndwu-empty-state'
  | 'ndwu-file-upload'
  | 'ndwu-schedule-editor';

export type ComponentName =
  | 'ndwu-button'
  | 'ndwu-timing-button'
  | 'ndwu-checkbox'
  | 'ndwu-form-container'
  | 'ndwu-icon'
  | 'ndwu-link'
  | 'ndwu-input'
  | 'ndwu-password-input-field'
  | 'ndwu-icon-button'
  | 'ndwu-radio'
  | 'ndwu-select-field'
  | 'ndwu-multi-select-field'
  | 'ndwu-textarea'
  | 'ndwu-context-menu'
  | 'ndwu-tooltip'
  | 'ndwu-popover'
  | 'ndwu-dialog'
  | 'ndwu-drawer'
  | 'ndwu-router-loader'
  | 'ndwu-spokes-loader'
  | 'ndwu-progress-bar'
  | 'ndwu-toggle'
  | 'ndwu-badge'
  | 'ndwu-notification'
  | 'ndwu-card'
  | 'ndwu-chip'
  | 'ndwu-tabs'
  | 'ndwu-pictogram'
  | 'ndwu-scrollbar'
  | 'ndwu-table';

export interface MenuFlatItem {
  type: 'item';
  name: ComponentName;
}
export interface MenuGroup {
  type: 'group';
  label: string;
  children: ComponentName[];
}
export type MenuItem = MenuFlatItem | MenuGroup;
