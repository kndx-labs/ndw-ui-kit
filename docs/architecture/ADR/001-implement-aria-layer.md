# 001 Implement ARIA layer

- Status: Accepted
- Date: 2026-03-26

## Context and Problem Statement

We want to make our UI components more accessible. This is one of the goals driving
the development of the UI system that this project (NDW UI kit) implements for Angular.

The Angular team introduced a collection of headless, accessible directives called
[@angular/aria](https://angular.dev/guide/aria/overview#) that can help
with implementing such components. However, the `ndw-ui-kit` currently targets
Angular 19+, while the `@angular/aria` package is only available starting from Angular 21.

We can implement a similar set of primitives, closely following the API of
`@angular/aria`, and use them in our components. This way, once we upgrade to Angular 21,
we can easily switch to the official package.

## Considered Options

1. Continue implementing components without an ARIA layer;
   implement accessibility features directly in the components.

2. Switch to Angular 21 and use the official `@angular/aria` package;

3. Implement a custom ARIA layer, similar to `@angular/aria`, and use it in our components.

## Decision Outcome

Option 3 ("Implement a custom ARIA layer...") was chosen.
We will start by implementing a subset of the `@angular/aria` directives
that are related to select-like components (e.g., regular select, multi-select, autocomplete),
since we already implemented them in the `ndw-ui-kit`.

See [RFC #001](../RFC/001-implement-aria-layer.md) for more details on the implementation plan.

## Consequences

### Pros:

- It will be easier to implement accessible select-like components in the `ndw-ui-kit`.
- Different parts of a complex component will be split between a few specialized primitives.

### Cons:

- We will need to maintain our custom ARIA layer until we can switch to Angular 21 and use the official package.
- The overall complexity of the codebase will increase due to the additional layer of abstraction.
