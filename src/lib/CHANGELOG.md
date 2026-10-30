<a name="0.3.1"></a>
# 0.3.1 (2026-10-30)

- Include the changelog covering changes through 0.3.0.

<!-- CHANGELOG SPLIT MARKER -->

<a name="0.3.0"></a>
# 0.3.0 (2026-10-30)

### aria
| Commit       | Type | Description                                                                            |
| ------------ | ---- | -------------------------------------------------------------------------------------- |
| [99583fa4d1] | fix  | fix listbox keyboard navigation and clear active options removed from the list ([#34]) |

### core/components
| Commit       | Type      | Description                                                                                                                                                                                                                                                                                                                                           |
| ------------ | --------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| [9501dca530] | fix!      | restrict drawer sizing: replace size properties with `size: NDWU_SIZE.XL` (700px) or `NDWU_SIZE.XXL` (1200px); use `NdwuDialogConfig`, `NDWU_DIALOG_CONFIG_DEFAULTS`, `NDWU_DRAWER_CONFIG_DEFAULTS` and `.ndwu-drawer--xxl` instead of `NdwuModalConfig`, `NDWU_MODAL_CONFIG_DEFAULTS`, `NDWU_DRAWER_OVERLAY_DEFAULTS` and `.ndwu-drawer--xl` ([#29]) |
| [766ef49198] | feat      | allow passing a custom `Injector` to dialogs and drawers ([#33])                                                                                                                                                                                                                                                                                      |
| [e1cbdf11b9] | feat      | add accordion component ([#30])                                                                                                                                                                                                                                                                                                                       |
| [31f92025d2] | feat      | add textarea component and textarea field ([#26])                                                                                                                                                                                                                                                                                                     |
| [4c89e5c524] | feat      | add tag component ([#31])                                                                                                                                                                                                                                                                                                                             |
| [c761d64c8f] | feat      | support external tooltip origins, template content, context and manual visibility control ([#32])                                                                                                                                                                                                                                                     |
| [f492ec7e6f] | refactor! | make modal config and signals readonly, hide lifecycle API and fix close guards and focus handling: use `setTitle()`, `setDescription()` and `setLoading()` instead of signal writes; obtain refs from `NdwuModalService` instead of constructing them or accessing overlay and transition methods ([#39])                                            |
| [a78ef3b737] | fix       | adjust dialog, drawer, popover, select and multi-select spacing, typography and mobile close buttons ([#35])                                                                                                                                                                                                                                          |
| [75a7ef64c0] | fix       | make scrollbar grow with its parent container ([#51])                                                                                                                                                                                                                                                                                                 |
| [ab22dc8903] | fix!      | limit drawer width to the viewport and remove full-width corner radii: replace `NDWU_DRAWER_WIDTH`, `NDWU_DRAWER_HEIGHT` and `--drawer-width` overrides with supported drawer size presets ([#55])                                                                                                                                                    |
| [73dea9dbbf] | fix       | use automatic dialog height on mobile ([#57])                                                                                                                                                                                                                                                                                                         |
| [60eef60ca1] | refactor! | extract scrollbar geometry, drag handling and observation; isolate nested padding and clamp thumbs to tracks: remove `trackSize` and `overflowSignal` from custom `NdwuAxisConfigEntry` objects ([#53])                                                                                                                                               |
| [451c92ceef] | feat!     | add textarea loading state and horizontal resizing, and align styles with design: resizing now defaults to both axes; set `resizeDirection="vertical"` to retain vertical-only resizing ([#59])                                                                                                                                                       |
| [bcb0d2fe04] | fix       | preserve button width while loading, block pointer clicks, expose loading ARIA state and pause timing-button countdown; let disabled state take precedence ([#60])                                                                                                                                                                                    |
| [c0500c0f1d] | feat      | add autocomplete component, autocomplete field and footer slot, styled group labels, option-row utilities and icons ([#45])                                                                                                                                                                                                                           |

### form-field
| Commit       | Type | Description                                                                                                                                                  |
| ------------ | ---- | ------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| [e0a9ee07db] | fix! | unify field validation for reactive forms, `ngModel` and standalone use: replace the select and multi-select field `invalid` signal with `isInvalid` ([#27]) |
| [b36b42cf8e] | fix  | use shared validation in textarea field to fix library compilation                                                                                           |

### l10n
| Commit       | Type | Description                                                                                                                          |
| ------------ | ---- | ------------------------------------------------------------------------------------------------------------------------------------ |
| [a5b5c124e0] | feat | add `LocalizeHtmlPipe` and preserve inline styles in translated tooltip, notification and empty-state HTML ([#38])                   |
| [d368e1e8f7] | fix! | provide a default no-op `NdwuTranslationService`: translation interpolation parameters now require `Record<string, unknown>` ([#52]) |

### lib
| Commit       | Type     | Description                                                                                                                                                                                                                                                         |
| ------------ | -------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| [87305bfff9] | fix!     | declare the `rxjs` peer dependency and relax dependency versions: provide `rxjs` matching `^7.4.0` ([#36])                                                                                                                                                          |
| [7da45d1db6] | perf     | use `OnPush` consistently, refresh form fields after value changes and update translations on translation refresh ([#40])                                                                                                                                           |
| [3ee3dbeac9] | refactor | deprecate unprefixed public symbols in favor of `Ndwu`, `NDWU_` and `ndwu` names, including `NdwuTranslationService`, `NdwuLocalizePipe`, `provideNdwuNgxTranslate`, `provideNdwuAllIcons` and `ndwuCreateDropdownController`; retain compatibility aliases ([#42]) |
| [9713d0d073] | feat     | unify component fonts and add the overridable `--ndwu-font-family` token ([#47])                                                                                                                                                                                    |

### popover
| Commit       | Type | Description                                                                                       |
| ------------ | ---- | ------------------------------------------------------------------------------------------------- |
| [c761d64c8f] | fix! | remove the desktop popover backdrop: outside pointer events now reach underlying elements ([#32]) |

### schedule-actions
| Commit       | Type      | Description                                                                                                                                                                                                                 |
| ------------ | --------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| [40fd3e0ae0] | refactor! | move schedule conversion helpers from widgets to `@ndw-ui-kit/core/schedule-actions` and preserve intervals crossing the week boundary: replace `actionsChange` with `valueChange` and `ndwuScheduleValueToActions` ([#44]) |

### styles
| Commit       | Type | Description                                                                  |
| ------------ | ---- | ---------------------------------------------------------------------------- |
| [8ef1e9a8e5] | feat | add responsive `--ndwu-lineHeight-*` tokens and corresponding SCSS variables |

### table
| Commit       | Type | Description                                                                                            |
| ------------ | ---- | ------------------------------------------------------------------------------------------------------ |
| [164da16c9c] | feat | add `sortComparator` and fix default sorting of dates, times, numeric strings and empty values ([#43]) |
| [3eefef743c] | feat | add keyboard support for column resizing and row reordering ([#46])                                    |

### widgets
| Commit       | Type | Description                                               |
| ------------ | ---- | --------------------------------------------------------- |
| [3689622c8f] | fix  | keep schedule editor tooltip inside its container ([#48]) |

[99583fa4d1]: https://github.com/kndx-labs/ndw-ui-kit/commit/99583fa4d16a6dc905714ce1e70c61a6e3ff1bea
[#34]: https://github.com/kndx-labs/ndw-ui-kit/pull/34
[9501dca530]: https://github.com/kndx-labs/ndw-ui-kit/commit/9501dca530b6c96e8ebf0e493514a8116bf168f5
[#29]: https://github.com/kndx-labs/ndw-ui-kit/pull/29
[766ef49198]: https://github.com/kndx-labs/ndw-ui-kit/commit/766ef491984a8b619817b3f96247d3db83c8e795
[#33]: https://github.com/kndx-labs/ndw-ui-kit/pull/33
[e1cbdf11b9]: https://github.com/kndx-labs/ndw-ui-kit/commit/e1cbdf11b936bc59d61e5999ecb2873839676203
[#30]: https://github.com/kndx-labs/ndw-ui-kit/pull/30
[31f92025d2]: https://github.com/kndx-labs/ndw-ui-kit/commit/31f92025d2e88e5ff2c02dd4b30403b4e453a2a7
[#26]: https://github.com/kndx-labs/ndw-ui-kit/pull/26
[4c89e5c524]: https://github.com/kndx-labs/ndw-ui-kit/commit/4c89e5c52490772bb8740d2c4d148bef9065e5fa
[#31]: https://github.com/kndx-labs/ndw-ui-kit/pull/31
[c761d64c8f]: https://github.com/kndx-labs/ndw-ui-kit/commit/c761d64c8f7ba296afd3cce5b0cf365baea76675
[#32]: https://github.com/kndx-labs/ndw-ui-kit/pull/32
[f492ec7e6f]: https://github.com/kndx-labs/ndw-ui-kit/commit/f492ec7e6f05407bb1d5fadfe28ca58bece47f04
[#39]: https://github.com/kndx-labs/ndw-ui-kit/pull/39
[a78ef3b737]: https://github.com/kndx-labs/ndw-ui-kit/commit/a78ef3b73725de11f06e0e9529c299a7185c2d86
[#35]: https://github.com/kndx-labs/ndw-ui-kit/pull/35
[75a7ef64c0]: https://github.com/kndx-labs/ndw-ui-kit/commit/75a7ef64c0022283d93a7678f074e19973b749db
[#51]: https://github.com/kndx-labs/ndw-ui-kit/pull/51
[ab22dc8903]: https://github.com/kndx-labs/ndw-ui-kit/commit/ab22dc89038264111eac7b080554060d82960dd7
[#55]: https://github.com/kndx-labs/ndw-ui-kit/pull/55
[73dea9dbbf]: https://github.com/kndx-labs/ndw-ui-kit/commit/73dea9dbbf2af84572f6f249be645eb4eb78e9bd
[#57]: https://github.com/kndx-labs/ndw-ui-kit/pull/57
[60eef60ca1]: https://github.com/kndx-labs/ndw-ui-kit/commit/60eef60ca132a9e8075dd0333b9884a11cb90400
[#53]: https://github.com/kndx-labs/ndw-ui-kit/pull/53
[451c92ceef]: https://github.com/kndx-labs/ndw-ui-kit/commit/451c92ceef173c3e0f3dc87e6f29d1a98192525a
[#59]: https://github.com/kndx-labs/ndw-ui-kit/pull/59
[bcb0d2fe04]: https://github.com/kndx-labs/ndw-ui-kit/commit/bcb0d2fe044f362c7216ddc631e3e98704611e3f
[#60]: https://github.com/kndx-labs/ndw-ui-kit/pull/60
[c0500c0f1d]: https://github.com/kndx-labs/ndw-ui-kit/commit/c0500c0f1dab6324060856fcd1c3f7580b9564d6
[#45]: https://github.com/kndx-labs/ndw-ui-kit/pull/45
[e0a9ee07db]: https://github.com/kndx-labs/ndw-ui-kit/commit/e0a9ee07dbd7a66001b0dbc949fdcb469da4ca8b
[#27]: https://github.com/kndx-labs/ndw-ui-kit/pull/27
[b36b42cf8e]: https://github.com/kndx-labs/ndw-ui-kit/commit/b36b42cf8eae44ea98edc45cd3b9b947f767f3a3
[a5b5c124e0]: https://github.com/kndx-labs/ndw-ui-kit/commit/a5b5c124e0992c3fd57131c3872a4dafd2894e91
[#38]: https://github.com/kndx-labs/ndw-ui-kit/pull/38
[d368e1e8f7]: https://github.com/kndx-labs/ndw-ui-kit/commit/d368e1e8f7f07e3397bcabf326991b48545b618f
[#52]: https://github.com/kndx-labs/ndw-ui-kit/pull/52
[87305bfff9]: https://github.com/kndx-labs/ndw-ui-kit/commit/87305bfff96dedcc251e48ed0ae06dcff7f98a76
[#36]: https://github.com/kndx-labs/ndw-ui-kit/pull/36
[7da45d1db6]: https://github.com/kndx-labs/ndw-ui-kit/commit/7da45d1db602ed4cd1e813af4e34be82a58c876d
[#40]: https://github.com/kndx-labs/ndw-ui-kit/pull/40
[3ee3dbeac9]: https://github.com/kndx-labs/ndw-ui-kit/commit/3ee3dbeac9993ac1f046c42422f1ca73c7616ddd
[#42]: https://github.com/kndx-labs/ndw-ui-kit/pull/42
[9713d0d073]: https://github.com/kndx-labs/ndw-ui-kit/commit/9713d0d073972238990dbcb924a94bb6f4b90a71
[#47]: https://github.com/kndx-labs/ndw-ui-kit/pull/47
[40fd3e0ae0]: https://github.com/kndx-labs/ndw-ui-kit/commit/40fd3e0ae0aba3bfa537b7cf600a02b00728d659
[#44]: https://github.com/kndx-labs/ndw-ui-kit/pull/44
[8ef1e9a8e5]: https://github.com/kndx-labs/ndw-ui-kit/commit/8ef1e9a8e5f5aec55888b945278eb08b891ae4e5
[164da16c9c]: https://github.com/kndx-labs/ndw-ui-kit/commit/164da16c9c5f6d34746cfd4194b2504b8f9022d2
[#43]: https://github.com/kndx-labs/ndw-ui-kit/pull/43
[3eefef743c]: https://github.com/kndx-labs/ndw-ui-kit/commit/3eefef743cd427c25aeb57f1eb7b6ba9bdc18577
[#46]: https://github.com/kndx-labs/ndw-ui-kit/pull/46
[3689622c8f]: https://github.com/kndx-labs/ndw-ui-kit/commit/3689622c8fa1ad18df81cfd12bbc62373f1ddcc8
[#48]: https://github.com/kndx-labs/ndw-ui-kit/pull/48

<!-- CHANGELOG SPLIT MARKER -->

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
