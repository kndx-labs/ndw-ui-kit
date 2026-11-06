import {ChangeDetectionStrategy, Component, provideZonelessChangeDetection} from '@angular/core';
import {TestBed} from '@angular/core/testing';
import {NdwuOptionLabelComponent} from './ndwu-option-label.component';

@Component({
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [NdwuOptionLabelComponent],
  template: '<ndwu-option-label><span>Projected label</span></ndwu-option-label>',
})
class NdwuOptionLabelTestHostComponent {}

describe('NdwuOptionLabelComponent', () => {
  it('projects its content', async () => {
    await TestBed.configureTestingModule({
      imports: [NdwuOptionLabelTestHostComponent],
      providers: [provideZonelessChangeDetection()],
    }).compileComponents();

    const fixture = TestBed.createComponent(NdwuOptionLabelTestHostComponent);

    fixture.detectChanges();

    const label = (fixture.nativeElement as HTMLElement).querySelector('ndwu-option-label');

    expect(label?.innerHTML).toContain('<span>Projected label</span>');
  });
});
