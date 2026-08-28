import {Routes} from '@angular/router';
import {AppComponent} from './app.component';
import {COMPONENTS_LIST, COMPONENT_TABS, EXAMPLES_LIST} from './app.constants';
import type {ComponentName} from './app.types';

const componentRoutes: Routes = COMPONENTS_LIST.map(
  (componentName: ComponentName) => {
    const tabRoutes = COMPONENT_TABS[componentName].map((tabId) => {
      return {
        path: tabId,
        children: [] as Routes,
      };
    });

    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    const firstTab = COMPONENT_TABS[componentName][0]!;

    return {
      path: `component/${componentName}`,
      component: AppComponent,
      children: [
        {
          path: '',
          redirectTo: firstTab,
          pathMatch: 'full',
        },
        ...tabRoutes,
      ],
    };
  },
);

const exampleRoutes: Routes = EXAMPLES_LIST.map((name) => ({
  path: `example/${name}`,
  component: AppComponent,
  children: [],
}));

export const routes: Routes = [
  ...componentRoutes,
  ...exampleRoutes,
  {
    path: 'component/:componentName',
    component: AppComponent,
    children: [
      {
        path: '',
        redirectTo: 'overview',
        pathMatch: 'full',
      },
      {
        path: 'overview',
        children: [],
      },
    ],
  },
  {
    path: '',
    component: AppComponent,
    pathMatch: 'full',
  },
];
