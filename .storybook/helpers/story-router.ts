import {provideLocationMocks} from '@angular/common/testing';
import {applicationConfig, componentWrapperDecorator, moduleMetadata} from '@storybook/angular';
import {RouterLink, provideRouter} from '@angular/router';
import {SbRouterUrlComponent} from './router-url.component';

const ROUTER_PROVIDERS = [
  provideRouter([{path: '**', children: []}]),
  provideLocationMocks(),
];

export const withRouter = [
  applicationConfig({providers: ROUTER_PROVIDERS}),
  moduleMetadata({imports: [RouterLink, SbRouterUrlComponent]}),
  componentWrapperDecorator(SbRouterUrlComponent),
];
