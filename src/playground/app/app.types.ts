export type ExampleName = 'user-profile-form';

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
  | 'ndwu-context-menu'
  | 'ndwu-tooltip'
  | 'ndwu-popover'
  | 'ndwu-dialog'
  | 'ndwu-drawer'
  | 'ndwu-schedule-editor'
  | 'ndwu-spokes-loader'
  | 'ndwu-router-loader'
  | 'ndwu-progress-bar'
  | 'ndwu-file-upload'
  | 'ndwu-toggle'
  | 'ndwu-badge'
  | 'ndwu-notification'
  | 'ndwu-card'
  | 'ndwu-chip'
  | 'ndwu-tabs'
  | 'ndwu-pictogram'
  | 'ndwu-empty-state'
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
