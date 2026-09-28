import {Routes} from '@angular/router';
import {AppComponent} from './app.component';
import {COMPONENTS_LIST, COMPONENT_TABS, EXAMPLES_LIST, WIDGETS_LIST, WIDGET_TABS} from './app.constants';

function buildShowcaseRoutes(
  prefix: string,
  names: readonly string[],
  tabsByName: Record<string, readonly string[]>,
): Routes {
  return names.map((name) => {
    const tabs = tabsByName[name] ?? [];
    const tabRoutes = tabs.map((tabId) => {
      return {
        path: tabId,
        children: [] as Routes,
      };
    });

    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    const firstTab = tabs[0]!;

    return {
      path: `${prefix}/${name}`,
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
  });
}

function buildFallbackRoute(prefix: string, param: string): Routes[number] {
  return {
    path: `${prefix}/:${param}`,
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
  };
}

const componentRoutes = buildShowcaseRoutes('component', COMPONENTS_LIST, COMPONENT_TABS);
const widgetRoutes = buildShowcaseRoutes('widget', WIDGETS_LIST, WIDGET_TABS);

const legacyWidgetRedirects: Routes = WIDGETS_LIST.flatMap((name) => [
  {
    path: `component/${name}`,
    redirectTo: `widget/${name}`,
    pathMatch: 'full' as const,
  },
  {
    path: `component/${name}/:tab`,
    redirectTo: `widget/${name}/:tab`,
  },
]);

const exampleRoutes: Routes = EXAMPLES_LIST.map((name) => ({
  path: `example/${name}`,
  component: AppComponent,
  children: [],
}));

export const routes: Routes = [
  ...componentRoutes,
  ...widgetRoutes,
  ...legacyWidgetRedirects,
  ...exampleRoutes,
  buildFallbackRoute('component', 'componentName'),
  buildFallbackRoute('widget', 'widgetName'),
  {
    path: '',
    component: AppComponent,
    pathMatch: 'full',
  },
];
