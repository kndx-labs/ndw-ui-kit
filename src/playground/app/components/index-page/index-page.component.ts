import {ChangeDetectionStrategy, Component, output} from '@angular/core';
import {CommonModule} from '@angular/common';
import {RouterModule} from '@angular/router';
import libPackage from '../../../../lib/package.json';
import {COMPONENTS_LIST, READY_FOR_REVIEW_COMPONENTS, SHOWCASE_NAMES} from '../../app.constants';
import type {ComponentName} from '../../app.types';
import {LogoComponent} from '../logo/logo.component';

const LIB_INFO = {
  name: 'NDW UI Kit',
  version: libPackage.version,
};

const getShowcaseName = (name: ComponentName): string => SHOWCASE_NAMES[name] ?? name;

const COMPONENT_DESCRIPTIONS: Record<ComponentName, string> = {
  'ndwu-badge': 'Small status indicator for labels, counts, or states.',
  'ndwu-button': 'Primary action control with variants and sizes.',
  'ndwu-card': 'Container for grouped content with a subtle border.',
  'ndwu-checkbox': 'Binary choice input for forms and lists.',
  'ndwu-context-menu': 'Menu opened by right-click or trigger button.',
  'ndwu-dialog': 'Modal window for alerts, confirmations, or tasks.',
  'ndwu-drawer': 'Side panel that slides in from the edge.',
  'ndwu-empty-state': 'Placeholder illustration for empty content areas.',
  'ndwu-file-upload': 'Control for selecting and uploading files.',
  'ndwu-form-container': 'Layout wrapper for form fields and validation.',
  'ndwu-icon': 'Scalable SVG icon from the sprite set.',
  'ndwu-icon-button': 'Button that displays an icon instead of text.',
  'ndwu-input': 'Single-line text input with validation support.',
  'ndwu-link': 'Text hyperlink with navigation styles.',
  'ndwu-multi-select-field': 'Dropdown that allows multiple selections.',
  'ndwu-notification': 'Toast or inline message for user feedback.',
  'ndwu-password-input-field': 'Masked input for secure password entry.',
  'ndwu-pictogram': 'Large illustrative SVG graphic.',
  'ndwu-popover': 'Floating content panel anchored to an element.',
  'ndwu-progress-bar': 'Visual indicator of completion percentage.',
  'ndwu-radio': 'Single-choice selection from a group of options.',
  'ndwu-schedule-editor': 'Control for defining recurring schedules.',
  'ndwu-scrollbar': 'Custom-styled scrollable container.',
  'ndwu-select-field': 'Dropdown for single-option selection.',
  'ndwu-spokes-loader': 'Animated loading spinner.',
  'ndwu-tabs': 'Switchable content sections within a single panel.',
  'ndwu-timing-button': 'Button with a delayed or timed action.',
  'ndwu-toggle': 'On/off switch control.',
  'ndwu-tooltip': 'Small hint shown on hover or focus.',
};

const INDEX_COMPONENTS: ComponentName[] = COMPONENTS_LIST
  .filter((name) => name !== 'ndwu-context-menu')
  .sort((a, b) => getShowcaseName(a).localeCompare(getShowcaseName(b)));

@Component({
  selector: 'app-index-page',
  templateUrl: './index-page.component.html',
  styleUrl: './index-page.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule, LogoComponent, RouterModule],
})
export class IndexPageComponent {
  public readonly LIB_INFO = LIB_INFO;
  public readonly SHOWCASE_NAMES = SHOWCASE_NAMES;
  public readonly COMPONENTS = INDEX_COMPONENTS;
  public readonly DESCRIPTIONS = COMPONENT_DESCRIPTIONS;
  public readonly componentSelected = output<ComponentName>();

  public isReadyForReview(component: ComponentName): boolean {
    return READY_FOR_REVIEW_COMPONENTS.includes(component);
  }

  public select(component: ComponentName): void {
    this.componentSelected.emit(component);
  }
}
