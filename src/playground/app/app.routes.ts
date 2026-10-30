import {Routes} from '@angular/router';
import {AppComponent} from './app.component';
import {
  COMPONENTS_LIST,
  COMPONENT_TABS,
  EXAMPLES_LIST,
  ICON_REGISTRY_PATH,
  WIDGETS_LIST,
  WIDGET_TABS,
} from './app.constants';
import type {ComponentName, WidgetName} from './app.types';

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

const widgetRoutes: Routes = WIDGETS_LIST.map(
  (widgetName: WidgetName) => {
    const tabRoutes = WIDGET_TABS[widgetName].map((tabId) => {
      return {
        path: tabId,
        children: [] as Routes,
      };
    });

    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    const firstTab = WIDGET_TABS[widgetName][0]!;

    return {
      path: `widget/${widgetName}`,
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
  ...widgetRoutes,
  ...exampleRoutes,
  {
    path: ICON_REGISTRY_PATH,
    component: AppComponent,
  },
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
    path: 'widget/:widgetName',
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
