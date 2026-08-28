import {Component, input} from '@angular/core';

export type NdwuPasswordStrength = 'weak' | 'average' | 'strong';

@Component({
  selector: 'ndwu-password-strength-indicator',
  templateUrl: './ndwu-password-strength-indicator.component.html',
  styleUrl: './ndwu-password-strength-indicator.component.scss',
})
export class NdwuPasswordStrengthIndicatorComponent {
  public readonly strength = input<NdwuPasswordStrength | null>(null);
  public readonly segments = Array(3).fill(null);
}
