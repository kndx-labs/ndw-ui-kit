<a name="0.2.0"></a>
# 0.2.0 (2026-10-02)

### core/components
| Commit       | Type      | Description                                                                                                                                                                                                                                                   |
| ------------ | --------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| [e1c03fa714] | refactor  | extract modal transition management to a separate class ([#4])                                                                                                                                                                                                |
| [8c2e111d45] | feat      | implement chips component ([#7])                                                                                                                                                                                                                              |
| [8c2e111d45] | fix!      | `ndwuButton`, `ndwuIconButton` and `ndwuTimingButton` render `type="button"` and no longer submit forms: add `type="submit"` where needed ([#7])                                                                                                              |
| [3b02bd7527] | fix!      | use `<div>` as root element instead of `<form>`: wrap the fields in your own `<form>` to submit them ([#13])                                                                                                                                                  |
| [7dbab04d7c] | refactor! | remove `href` and `routerLink` inputs: use the native `href`, or import `RouterLink` and put `routerLink` on the same `<a ndwuLink>` ([#14])                                                                                                                  |
| [5be2921703] | fix       | add `role="switch"` to toggle input ([#16])                                                                                                                                                                                                                   |
| [a060c85c3c] | feat      | implement animated router loader component `ndwu-router-loader` ([#15])                                                                                                                                                                                       |
| [647637cdb0] | fix       | float input label on autofill ([#18])                                                                                                                                                                                                                         |
| [97ec97eba3] | fix       | fix `ndwuInput` invalid state without Angular forms ([#19])                                                                                                                                                                                                   |
| [76a65e3234] | fix!      | show focus with a focus ring: `--ndwu-form-field-icon-focus-color` and `--ndwu-form-field-icon-invalid-color` are removed, override `--ndwu-form-field-focus-ring` and `--ndwu-form-field-invalid-focus-ring` instead ([#22])                                 |
| [dc5d96a0ac] | fix       | fix scroll visibility in select on mobile ([#21])                                                                                                                                                                                                             |
| [5f0ad84cdb] | fix       | ignore keyboard activation on loading buttons ([#20])                                                                                                                                                                                                         |
| [6ca3ca53a9] | feat      | forward `id`, `name`, `value`, `required` and `aria-*` attributes of checkbox, radio and toggle to the native input instead of the host element; add `ndwuRequired` to `ndwu-checkbox-field` and `ndwu-radio-field`, `inputId` to `ndwu-toggle-field` ([#25]) |

### form-field
| Commit       | Type  | Description                                                                                                                                                                                     |
| ------------ | ----- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| [146d302365] | feat! | add `NdwuValidators` and `ndwuWrapValidator` with translated error messages; rename the `required` input of the input, password-input, select and multi-select fields to `ndwuRequired` ([#11]) |

### l10n
| Commit       | Type      | Description                                                                                                                                     |
| ------------ | --------- | ----------------------------------------------------------------------------------------------------------------------------------------------- |
| [0cd6aa6ab9] | refactor! | make `ngx-translate` optional: `provideNdwUiKitNgxTranslate` and `NgxTranslationService` moved to `@ndw-ui-kit/core/l10n/ngx-translate` ([#17]) |

### lib
| Commit       | Type      | Description                                                                                                                                                                               |
| ------------ | --------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| [2b1304a759] | feat      | add table icons (`chevron_left_S`, `chevron_right_S`, `first_S`, `last_S`) to the base icon list                                                                                          |
| [6f18b91878] | refactor! | prefix exported symbols with `Ndwu`, `NDWU_` or `ndwu`, e.g. `ButtonVariant` -> `NdwuButtonVariant`, `ICON_NAME` -> `NDWU_ICON_NAME`, `normalizeOptions` -> `ndwuNormalizeOptions` ([#9]) |

### styles
| Commit       | Type      | Description                                                                                                                                     |
| ------------ | --------- | ----------------------------------------------------------------------------------------------------------------------------------------------- |
| [da6094d382] | refactor! | deduplicate CSS custom property declarations in themes: `:root.dark` is removed, use the `ndwu-theme-dark` class ([#6])                         |
| [32a2553750] | fix       | re-emit component tokens in scoped themes, make toggle focus gap follow the theme                                                               |
| [4045f02811] | refactor! | update design tokens: `$form-color-helper-default` -> `$form-color-callout-default`, `$form-color-helper-disabled` -> `$callout-color-disabled` |
| [42501d3b00] | feat      | export styles and assets as `@ndw-ui-kit/core/styles/*` and `@ndw-ui-kit/core/assets/*` ([#23])                                                 |

### table
| Commit       | Type | Description                |
| ------------ | ---- | -------------------------- |
| [f4c8d7fe28] | feat | add table component ([#8]) |

### widgets
| Commit       | Type      | Description                                                                                                                      |
| ------------ | --------- | -------------------------------------------------------------------------------------------------------------------------------- |
| [5a8c8dd1dd] | refactor! | move `ndwu-empty-state`, `ndwu-file-upload` and `ndwu-schedule-editor` to the new `@ndw-ui-kit/core/widgets` entry point ([#10]) |

[e1c03fa714]: https://github.com/kndx-labs/ndw-ui-kit/commit/e1c03fa7148197d72679c9624ebbe1d9eb988bb1
[#4]: https://github.com/kndx-labs/ndw-ui-kit/pull/4
[8c2e111d45]: https://github.com/kndx-labs/ndw-ui-kit/commit/8c2e111d45ceb245e4f21780b803dbc57f53f08a
[#7]: https://github.com/kndx-labs/ndw-ui-kit/pull/7
[3b02bd7527]: https://github.com/kndx-labs/ndw-ui-kit/commit/3b02bd75272b73b1ed031c89ce122c76684bef4b
[#13]: https://github.com/kndx-labs/ndw-ui-kit/pull/13
[7dbab04d7c]: https://github.com/kndx-labs/ndw-ui-kit/commit/7dbab04d7cf10f3a69504204ef8698061f211bec
[#14]: https://github.com/kndx-labs/ndw-ui-kit/pull/14
[5be2921703]: https://github.com/kndx-labs/ndw-ui-kit/commit/5be29217039f6fb0d9d32344f8a15b13ecf68a00
[#16]: https://github.com/kndx-labs/ndw-ui-kit/pull/16
[a060c85c3c]: https://github.com/kndx-labs/ndw-ui-kit/commit/a060c85c3c3c2468bc8b86cf27f51d33bda7d0b2
[#15]: https://github.com/kndx-labs/ndw-ui-kit/pull/15
[647637cdb0]: https://github.com/kndx-labs/ndw-ui-kit/commit/647637cdb0410011bd481e3edd1a20d0bf71d919
[#18]: https://github.com/kndx-labs/ndw-ui-kit/pull/18
[97ec97eba3]: https://github.com/kndx-labs/ndw-ui-kit/commit/97ec97eba362fe207d76d37a65128ce7aa474b0f
[#19]: https://github.com/kndx-labs/ndw-ui-kit/pull/19
[76a65e3234]: https://github.com/kndx-labs/ndw-ui-kit/commit/76a65e32344fb7dc69fa373b0f0446ce5037ec85
[#22]: https://github.com/kndx-labs/ndw-ui-kit/pull/22
[dc5d96a0ac]: https://github.com/kndx-labs/ndw-ui-kit/commit/dc5d96a0ac1898f97e2a4177b0f51ba170012b30
[#21]: https://github.com/kndx-labs/ndw-ui-kit/pull/21
[5f0ad84cdb]: https://github.com/kndx-labs/ndw-ui-kit/commit/5f0ad84cdbb878071852d76fd92521a0373afa7d
[#20]: https://github.com/kndx-labs/ndw-ui-kit/pull/20
[6ca3ca53a9]: https://github.com/kndx-labs/ndw-ui-kit/commit/6ca3ca53a9a66b14d8df770e50518906d34596d3
[#25]: https://github.com/kndx-labs/ndw-ui-kit/pull/25
[146d302365]: https://github.com/kndx-labs/ndw-ui-kit/commit/146d3023659c436b8368ba4a7512f5366bd8ce46
[#11]: https://github.com/kndx-labs/ndw-ui-kit/pull/11
[0cd6aa6ab9]: https://github.com/kndx-labs/ndw-ui-kit/commit/0cd6aa6ab94e09901811ebcce65ae54e5eddc6fe
[#17]: https://github.com/kndx-labs/ndw-ui-kit/pull/17
[2b1304a759]: https://github.com/kndx-labs/ndw-ui-kit/commit/2b1304a7591aa5d158c745d37465bff7e7e3e94f
[6f18b91878]: https://github.com/kndx-labs/ndw-ui-kit/commit/6f18b91878099bbce7fc5d7e29b9a00cd8310c4e
[#9]: https://github.com/kndx-labs/ndw-ui-kit/pull/9
[da6094d382]: https://github.com/kndx-labs/ndw-ui-kit/commit/da6094d3823ab5a5ab35b186e84a4e9d5e712222
[#6]: https://github.com/kndx-labs/ndw-ui-kit/pull/6
[32a2553750]: https://github.com/kndx-labs/ndw-ui-kit/commit/32a25537504b2f65cae4bd07c5a6ebf132a0ccb5
[4045f02811]: https://github.com/kndx-labs/ndw-ui-kit/commit/4045f02811cde27a621e6d2b39e86576db1a5349
[42501d3b00]: https://github.com/kndx-labs/ndw-ui-kit/commit/42501d3b007f98037bacd8f3410d13cd5383aade
[#23]: https://github.com/kndx-labs/ndw-ui-kit/pull/23
[f4c8d7fe28]: https://github.com/kndx-labs/ndw-ui-kit/commit/f4c8d7fe282e6e9ea75940726994c68b3f5562f5
[#8]: https://github.com/kndx-labs/ndw-ui-kit/pull/8
[5a8c8dd1dd]: https://github.com/kndx-labs/ndw-ui-kit/commit/5a8c8dd1ddd61518d9ab4af0005fb9f264bd9bed
[#10]: https://github.com/kndx-labs/ndw-ui-kit/pull/10

<!-- CHANGELOG SPLIT MARKER -->

<a name="0.1.2"></a>
# 0.1.2 (2026-09-04)

### core/components
| Commit       | Type | Description                                                                                 |
| ------------ | ---- | ------------------------------------------------------------------------------------------- |
| [f7f3996d04] | fix  | fix clipped outline of the active option and the scrollbar track overlapping options ([#1]) |
| [f7f3996d04] | feat | add `ndwu-styled-group-header` child component ([#1])                                       |

### form-field
| Commit       | Type | Description                                                                                       |
| ------------ | ---- | ------------------------------------------------------------------------------------------------- |
| [f7f3996d04] | feat | support hidden options, non-localized options and option groups in select and multi-select ([#1]) |

### l10n
| Commit       | Type | Description                  |
| ------------ | ---- | ---------------------------- |
| [f7f3996d04] | feat | add `localizeIf` pipe ([#1]) |

[f7f3996d04]: https://github.com/kndx-labs/ndw-ui-kit/commit/f7f3996d04034e6411ba68da6bf6195e99f9780f
[#1]: https://github.com/kndx-labs/ndw-ui-kit/pull/1

<!-- CHANGELOG SPLIT MARKER -->

<a name="0.1.1"></a>
# 0.1.1 (2026-08-28)

No library code changes. This release upgraded Angular dependencies and synced design tokens and icons.

<!-- CHANGELOG SPLIT MARKER -->

<a name="0.1.0"></a>
# 0.1.0 (2026-08-28)

Initial release ([d08c3a1d8a]).

[d08c3a1d8a]: https://github.com/kndx-labs/ndw-ui-kit/commit/d08c3a1d8a1c1ae5b7d0bfb0b4e2dc9c179b2356
