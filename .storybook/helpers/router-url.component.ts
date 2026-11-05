import {ChangeDetectionStrategy, Component, inject} from '@angular/core';
import {toSignal} from '@angular/core/rxjs-interop';
import {NavigationEnd, Router} from '@angular/router';
import {filter, map} from 'rxjs';

@Component({
  selector: 'sb-router-url',
  template: `
    <ng-content />
    <p class="sb-note">Current URL: {{ url() }}</p>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SbRouterUrlComponent {
  private readonly router = inject(Router);

  public readonly url = toSignal(
    this.router.events
      .pipe(
        filter((event): event is NavigationEnd => event instanceof NavigationEnd),
        map((event) => event.urlAfterRedirects),
      ),
    {initialValue: this.router.url},
  );
}
