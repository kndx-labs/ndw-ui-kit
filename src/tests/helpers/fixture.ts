import {type Type} from '@angular/core';
import {ComponentFixture, TestBed} from '@angular/core/testing';
import {afterEach} from 'vitest';

// Creates a host-component fixture, attaches it to document.body, and tracks it
// so the afterEach below destroys and detaches every one after each test.
//
// The hook is registered in this module — reachable only through a spec file
// (via mount.ts / select.ts) — rather than in src/tests/setup.ts: setupFiles
// are loaded by Vite's dev pipeline, not the Angular-aware esbuild bundle that
// resolves the "@ndw-ui-kit/core" tsconfig path, and only files reachable from
// a *.spec.ts entry point get that resolution.
const mounted: ComponentFixture<unknown>[] = [];

afterEach(() => {
  while (mounted.length > 0) {
    const fixture = mounted.pop();

    fixture?.destroy();
    (fixture?.nativeElement as HTMLElement | undefined)?.remove();
  }
});

export const createTrackedHost = <T>(type: Type<T>): ComponentFixture<T> => {
  const fixture = TestBed.createComponent(type);

  document.body.appendChild(fixture.nativeElement as HTMLElement);
  mounted.push(fixture);

  return fixture;
};
