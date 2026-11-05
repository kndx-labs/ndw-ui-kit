import {provideLocationMocks} from '@angular/common/testing';
import {applicationConfig, componentWrapperDecorator, moduleMetadata} from '@storybook/angular';
import {RouterLink, provideRouter} from '@angular/router';
import {SbRouterUrlComponent} from './router-url.component';

export const withRouter = [
  applicationConfig({providers: [provideRouter([{path: '**', children: []}]), provideLocationMocks()]}),
  moduleMetadata({imports: [RouterLink, SbRouterUrlComponent]}),
  componentWrapperDecorator(SbRouterUrlComponent),
];
