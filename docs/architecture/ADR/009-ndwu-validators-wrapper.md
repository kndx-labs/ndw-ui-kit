# 009 NdwuValidators: wrapper for built-in Angular validators

- Status: Proposed
- Date: 2026-09-28
- Issue(s): NDWU-33

## Context and Problem Statement

ndwu fields show a validation message only when the control's error carries a
translation key. The default `ndwuValidationProcessor` takes the first error of
the control and reads its `errorLabel`:

```ts
const errorValue = Object.values(control.errors)[0];
return {errorMessage: String(errorValue.errorLabel), validationData: errorValue};
```

Angular's `Validators` don't know about `errorLabel`. `Validators.required`
returns `{required: true}`, `Validators.minLength(3)` returns
`{minlength: {requiredLength: 3, actualLength: 2}}`. The field turns red, but
shows no text.

Before this change, apps had two ways out, and both meant writing validation
code themselves:

- Rewrite each validator by hand so it returns an `errorLabel`. The playground
  did this with its own `ValidatorFactory` and `Validator.required`.
- Replace the processor through `NDWU_VALIDATION_PROCESSOR` and map Angular's
  error names to keys there.

We want built-in Angular validators to show a message without extra code.
Each control should still be able to pick its own message.

## Considered Options

1. **Map error names to keys in the default processor.** The processor would
   turn `minlength` into `ndwu.validation.min-length`, and so on.
   Rejected: the mapping is global, so a single control can't get a different
   message. The processor would also have to guess which error names came
   from Angular.

2. **Reimplement the validators in the library.** Rejected: this copies
   Angular's logic, which we'd then have to keep in sync. The playground's
   `ValidatorFactory` already showed the problem: its errors were named
   `REQUIRED` and `EMAIL` instead of Angular's `required` and `email`.

3. **Wrap Angular's validators and add `errorLabel` to their errors.**
   Accepted: Angular still does the validation, and the wrapper only adds the
   key. Error names stay the same, so `control.hasError('minlength')` still
   works.

## Decision Outcome

Option 3. The library exports three things from `@ndw-ui-kit/core/form-field`:

| Export | Purpose |
|---|---|
| `ndwuWrapValidator(validator, errorLabel)` | Adds `errorLabel` to every error a validator returns |
| `NdwuValidators` | Wrapped versions of Angular's `Validators`, each with a default key |
| `NDWU_VALIDATION_ERROR_LABEL` | The default keys as constants |

### How it works

`ndwuWrapValidator` runs the original validator. If there are no errors, it
returns `null`. Otherwise it copies every error, adds `errorLabel`, and keeps
the error's own fields. An error value that isn't an object (`true`) becomes
`{errorLabel}`:

```ts
{minlength: {requiredLength: 3, actualLength: 2}}
// becomes
{minlength: {requiredLength: 3, actualLength: 2, errorLabel: 'ndwu.validation.min-length'}}
```

Each factory on `NdwuValidators` wraps the matching Angular validator.
Its last argument overrides the key:

```ts
NdwuValidators.maxLength(10);                     // 'ndwu.validation.max-length'
NdwuValidators.maxLength(10, 'signup.nick-long'); // custom key for this control
```

The processor needs no changes. It reads `errorLabel` as the message key and
passes the whole error object as `validationData`. So Angular's fields become
translation placeholders: `"Enter at least {{requiredLength}} characters"`.

| Validator | Default key | Placeholders |
|---|---|---|
| `required()` | `ndwu.validation.required` | none |
| `requiredTrue()` | `ndwu.validation.required-true` | none |
| `email()` | `ndwu.validation.email` | none |
| `min(min)` | `ndwu.validation.min` | `min`, `actual` |
| `max(max)` | `ndwu.validation.max` | `max`, `actual` |
| `minLength(n)` | `ndwu.validation.min-length` | `requiredLength`, `actualLength` |
| `maxLength(n)` | `ndwu.validation.max-length` | `requiredLength`, `actualLength` |
| `pattern(p)` | `ndwu.validation.pattern` | `requiredPattern`, `actualValue` |

The library doesn't ship these translations. Each app adds the keys to its own
translation files.

### Renamed `required` input to `ndwuRequired`

The input, password, select and multi-select fields had a `required` input
that shows the asterisk. Writing `required` on an element that also has
`formControlName` attaches Angular's `RequiredValidator` directive. Its
selector is `:not([type=checkbox])[required][formControlName]`.

Angular runs directive validators after the control's own validators and
merges the results with an object spread, so the later error wins. The
directive's `{required: true}` replaced the `NdwuValidators.required()` error,
and the message disappeared.

The input is now `ndwuRequired`. It doesn't match any Angular selector.
`<ndwu-floating-label required>` keeps its name: it never sits on a form
control, so no directive attaches to it.

Angular's `email`, `minlength`, `maxlength` and `pattern` directives
collide the same way. They aren't ndwu inputs, though, so they only attach if
someone writes those attributes on an ndwu field. The README warns against it.
The `min` and `max` directives only match `input[type=number]`, so they never
attach to ndwu fields.

## Consequences

### Pros

- Angular's validators show a message with no extra code: swap
  `Validators.x` for `NdwuValidators.x()`.
- Each control can override the message key, and any validator can get a key
  through `ndwuWrapValidator`.
- Error names and their fields stay Angular's, so existing
  `hasError('...')` checks and placeholders keep working.
- The playground no longer needs its own validator factory.

### Cons

- `ndwuRequired` is a breaking change, and it fails silently: a template that
  still says `required` compiles. It loses the asterisk, and Angular's
  directive overwrites our error again.
- `NdwuValidators.required()` returns a new function on every call, so
  `control.hasValidator(Validators.required)` returns `false`. The library
  doesn't use `hasValidator`. The asterisk comes from `ndwuRequired`.
- Apps must add the `ndwu.validation.*` keys to their translations, or the
  raw key is shown as the message.
