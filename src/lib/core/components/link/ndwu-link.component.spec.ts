import {provideLocationMocks} from '@angular/common/testing';
import {ChangeDetectionStrategy, Component, provideZonelessChangeDetection} from '@angular/core';
import {TestBed} from '@angular/core/testing';
import {Router, RouterLink, provideRouter} from '@angular/router';
import {describe, expect, it} from 'vitest';
import {NdwuLinkComponent} from './ndwu-link.component';

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <a ndwu-link routerLink="/settings">String path</a>
    <a ndwu-link [routerLink]="['/settings', 'network']">Array path</a>
    <a ndwu-link routerLink="/settings/disabled" disabled (click)="recordDisabledClick()">Disabled</a>
  `,
  imports: [NdwuLinkComponent, RouterLink],
})
class RouterLinkHostComponent {
  public disabledClickCount = 0;

  public recordDisabledClick(): void {
    this.disabledClickCount += 1;
  }
}

describe('NdwuLinkComponent with RouterLink', () => {
  it('allows enabled navigation and blocks disabled navigation', async () => {
    await TestBed.configureTestingModule({
      imports: [RouterLinkHostComponent],
      providers: [
        provideZonelessChangeDetection(),
        provideRouter([{path: '**', children: []}]),
        provideLocationMocks(),
      ],
    }).compileComponents();

    const fixture = TestBed.createComponent(RouterLinkHostComponent);

    fixture.detectChanges();
    await fixture.whenStable();

    const hostElement = fixture.nativeElement as HTMLElement;
    const links = hostElement.querySelectorAll<HTMLAnchorElement>('a');
    const stringLink = links.item(0);
    const arrayLink = links.item(1);
    const disabledLink = links.item(2);
    const router = TestBed.inject(Router);

    if (!stringLink || !arrayLink || !disabledLink) {
      throw new Error('Expected all three router links to render');
    }

    expect(stringLink.getAttribute('href')).toBe('/settings');
    stringLink.click();
    await fixture.whenStable();
    expect(router.url).toBe('/settings');

    arrayLink.click();
    await fixture.whenStable();
    expect(router.url).toBe('/settings/network');

    disabledLink.click();
    await fixture.whenStable();
    expect(router.url).toBe('/settings/network');
  });

  it('does not call consumer click handlers on a disabled link', async () => {
    await TestBed.configureTestingModule({
      imports: [RouterLinkHostComponent],
      providers: [
        provideZonelessChangeDetection(),
        provideRouter([{path: '**', children: []}]),
        provideLocationMocks(),
      ],
    }).compileComponents();

    const fixture = TestBed.createComponent(RouterLinkHostComponent);

    fixture.detectChanges();
    await fixture.whenStable();

    const hostElement = fixture.nativeElement as HTMLElement;
    const links = hostElement.querySelectorAll<HTMLAnchorElement>('a');
    const disabledLink = links.item(2);

    if (!disabledLink) {
      throw new Error('Expected the disabled router link to render');
    }

    disabledLink.click();
    await fixture.whenStable();

    expect(fixture.componentInstance.disabledClickCount).toBe(0);
  });
});
