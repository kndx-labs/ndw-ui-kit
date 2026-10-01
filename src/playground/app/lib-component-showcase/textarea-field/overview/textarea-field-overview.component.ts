import {ChangeDetectionStrategy, Component, OnInit} from '@angular/core';
import {FormControl, FormGroup, ReactiveFormsModule} from '@angular/forms';
import {NDWU_SIZE} from '@ndw-ui-kit/core';
import {NdwuTextareaFieldComponent, NdwuValidators} from '@ndw-ui-kit/core/form-field';
import {LocalizePipe} from '@ndw-ui-kit/core/l10n';
import {ShowcaseLayoutComponent} from '@app/components';

const SAMPLE_TEXT = 'This is a textarea';

const SAMPLE_CONFIG = [
  'interface GigabitEthernet0/Vlan2',
  '    description "Home network"',
  '    security-level private',
  '    ip address 192.168.1.1 255.255.255.0',
  '    ip mtu 1500',
  '    up',
  '!',
  'ip dhcp pool _WEBADMIN',
  '    range 192.168.1.33 192.168.1.152',
  '    bind GigabitEthernet0/Vlan2',
].join('\n');

@Component({
  selector: 'app-textarea-field-overview',
  templateUrl: './textarea-field-overview.component.html',
  styleUrl: './textarea-field-overview.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    ReactiveFormsModule,
    LocalizePipe,
    NdwuTextareaFieldComponent,
    ShowcaseLayoutComponent,
  ],
})
export class TextareaFieldOverviewComponent implements OnInit {
  public readonly SIZE = NDWU_SIZE;

  public readonly defaultForm = new FormGroup({
    text: new FormControl(''),
  });

  public readonly filledForm = new FormGroup({
    text: new FormControl(SAMPLE_TEXT),
  });

  public readonly sizesForm = new FormGroup({
    xxl: new FormControl(SAMPLE_TEXT),
    xl: new FormControl(SAMPLE_TEXT),
    l: new FormControl(SAMPLE_TEXT),
  });

  public readonly lineNumbersForm = new FormGroup({
    xxl: new FormControl(SAMPLE_CONFIG),
    xl: new FormControl(SAMPLE_CONFIG),
    l: new FormControl(SAMPLE_CONFIG),
  });

  public readonly invalidForm = new FormGroup({
    text: new FormControl('', [NdwuValidators.required()]),
  });

  public readonly disabledForm = new FormGroup({
    text: new FormControl({value: SAMPLE_TEXT, disabled: true}),
  });

  public readonly readonlyForm = new FormGroup({
    text: new FormControl(SAMPLE_TEXT),
  });

  public readonly fixedSizeForm = new FormGroup({
    text: new FormControl(SAMPLE_TEXT),
  });

  public ngOnInit(): void {
    this.invalidForm.controls.text.markAsTouched();
  }
}
