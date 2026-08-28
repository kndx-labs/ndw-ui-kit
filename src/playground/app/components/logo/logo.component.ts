import {ChangeDetectionStrategy, Component} from '@angular/core';

@Component({
  selector: 'app-logo',
  template: '<img src="assets/logo.svg" class="logo" alt="NDW UI Kit">',
  styleUrl: './logo.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LogoComponent {}
