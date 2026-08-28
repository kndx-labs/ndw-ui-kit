// @ts-check

const eslint = require('@eslint/js');
const tseslint = require('typescript-eslint');
const compat = require('eslint-plugin-compat');
const ngEslint = require('angular-eslint');
const globals = require('globals');
const {fixupPluginRules} = require('@eslint/compat');
const stylistic = require('@stylistic/eslint-plugin');
const _import = require('eslint-plugin-import');
const jsdoc = require('eslint-plugin-jsdoc');
const preferArrow = require('eslint-plugin-prefer-arrow');

const OFF = 'off';
const WARN = 'warn';
const ERROR = 'error';

// ------------------------------------
// ESLint rule overrides
// ------------------------------------
const JS_RULE_OVERRIDES = {
  'arrow-parens': OFF,
  'jsdoc/check-alignment': ERROR,
  'new-parens': ERROR,
  'no-multiple-empty-lines': OFF,
  'sort-keys': OFF,
  'complexity': OFF,
  'constructor-super': ERROR,
  'max-classes-per-file': OFF,
  'no-cond-assign': ERROR,
  'no-invalid-this': OFF,
  'no-unsafe-finally': ERROR,
  'use-isnan': ERROR,
  'valid-typeof': OFF,

  'space-before-function-paren': OFF,
  'brace-style': OFF,
  'curly': ERROR,
  'eol-last': ERROR,
  'eqeqeq': [ERROR, 'always'],
  'guard-for-in': ERROR,
  'id-blacklist': [1, 'e', 'cb', 'x'],
  'id-match': OFF,
  'import/no-deprecated': WARN,
  'jsdoc/no-types': ERROR,

  'max-len': [OFF],

  'max-lines-per-function': [
    WARN,
    {
      'max': 75,
    },
  ],

  'no-bitwise': ERROR,
  'no-caller': ERROR,

  'no-console': [
    ERROR,
    {
      'allow': [WARN, ERROR],
    },
  ],

  'no-debugger': ERROR,
  'no-duplicate-imports': ERROR,
  'no-empty': OFF,
  'no-eval': ERROR,
  'no-fallthrough': ERROR,
  'no-new-wrappers': ERROR,
  'no-restricted-imports': [ERROR, 'rxjs/Rx'],
  'no-throw-literal': ERROR,

  'no-trailing-spaces': [
    ERROR,
    {
      'ignoreComments': true,
    },
  ],

  'no-undef-init': ERROR,
  'no-underscore-dangle': OFF,
  'no-unused-labels': ERROR,
  'no-var': ERROR,
  'prefer-const': ERROR,
  'radix': ERROR,

  'spaced-comment': [
    ERROR,
    'always',
    {
      'markers': ['/'],
    },
  ],

  'arrow-body-style': OFF,
  'quote-props': [WARN, 'consistent-as-needed'],
  'prefer-arrow/prefer-arrow-functions': [OFF],
  'object-shorthand': OFF,
  'quotes': [ERROR, 'single'],
  'object-curly-spacing': [ERROR, 'never'],

  'padding-line-between-statements': [
    WARN,
    {
      blankLine: 'always',
      prev: '*',
      next: 'return',
    },
    {
      blankLine: 'always',
      prev: 'block-like',
      next: 'const',
    },
    {
      blankLine: 'always',
      prev: 'block-like',
      next: 'let',
    },
    {
      blankLine: 'always',
      prev: '*',
      next: ['const', 'let', 'var', 'export'],
    },
    {
      blankLine: 'always',
      prev: ['const', 'let', 'var', 'export'],
      next: '*',
    },
    {
      blankLine: 'any',
      prev: ['const', 'let', 'var', 'export'],
      next: ['const', 'let', 'var', 'export'],
    },
    {
      blankLine: 'always',
      prev: '*',
      next: ['if', 'class', 'for', 'do', 'while', 'switch', 'try'],
    },
    {
      blankLine: 'always',
      prev: ['if', 'class', 'for', 'do', 'while', 'switch', 'try'],
      next: '*',
    },
  ],

  'no-useless-escape': OFF,

  'comma-dangle': OFF,

  'jsdoc/newline-after-description': OFF,

  'one-var': OFF,
  'newline-per-chained-call': WARN,

  // @stylistic rule overrides
  '@stylistic/quotes': [ERROR, 'single'],
  '@stylistic/semi': OFF,
  '@stylistic/type-annotation-spacing': ERROR,
  '@stylistic/member-delimiter-style': [
    ERROR,
    {
      'multiline': {
        'delimiter': 'semi',
        'requireLast': true,
      },

      'singleline': {
        'delimiter': 'semi',
        'requireLast': false,
      },
    },
  ],
};

// ------------------------------------
// `@typescript-eslint` rule overrides
// ------------------------------------
const TS_RULE_OVERRIDES = {
  '@typescript-eslint/array-type': OFF,
  '@typescript-eslint/interface-name-prefix': OFF,
  '@typescript-eslint/no-empty-function': OFF,
  '@typescript-eslint/no-explicit-any': OFF,
  '@typescript-eslint/no-inferrable-types': OFF,
  '@typescript-eslint/no-non-null-assertion': ERROR,
  '@typescript-eslint/no-parameter-properties': OFF,
  '@typescript-eslint/no-unsafe-assignment': OFF,
  '@typescript-eslint/no-var-requires': OFF,
  '@typescript-eslint/prefer-regexp-exec': OFF,
  '@typescript-eslint/restrict-plus-operands': OFF,
  '@typescript-eslint/restrict-template-expressions': OFF,
  '@typescript-eslint/no-redundant-type-constituents': OFF, // incorrectly handles `<some_type> | null`
  'dot-notation': OFF,
  '@typescript-eslint/dot-notation': WARN,

  '@typescript-eslint/explicit-member-accessibility': [
    WARN,
    {
      'accessibility': 'explicit',

      'overrides': {
        'constructors': 'no-public',
      },
    },
  ],

  '@typescript-eslint/indent': OFF,
  '@typescript-eslint/member-ordering': OFF,

  '@typescript-eslint/naming-convention': [
    ERROR,
    {
      'selector': 'variable',
      'format': ['camelCase', 'UPPER_CASE'],
      'filter': 'NDM',
    },
    {
      'selector': 'enum',
      'format': ['UPPER_CASE'],
    },
    {
      'selector': 'class',
      'format': ['StrictPascalCase'],
      'leadingUnderscore': 'allow',
    },
    {
      'selector': 'interface',
      'format': ['StrictPascalCase'],
      'leadingUnderscore': 'allow',
    },
  ],

  '@typescript-eslint/unified-signatures': ERROR,

  '@typescript-eslint/unbound-method': [
    ERROR,
    {
      'ignoreStatic': true,
    },
  ],

  'no-shadow': OFF,
  '@typescript-eslint/no-shadow': [ERROR],
  'no-use-before-define': OFF,
  '@typescript-eslint/no-use-before-define': WARN,
  '@typescript-eslint/consistent-type-assertions': OFF,

  // requires `strictNullChecks`
  '@typescript-eslint/prefer-nullish-coalescing': OFF,

  '@typescript-eslint/no-unused-vars': [
    ERROR,
    {
      'args': 'all',
      'argsIgnorePattern': '^_',
      'caughtErrors': 'all',
      'caughtErrorsIgnorePattern': '^_',
      'destructuredArrayIgnorePattern': '^_',
      'varsIgnorePattern': '^_',
      'ignoreRestSiblings': true,
    },
  ],
};

// ------------------------------------
// `@angular-eslint` rule overrides
// ------------------------------------
const NG_RULE_OVERRIDES = {
  '@angular-eslint/component-selector': [
    WARN,
    {
      type: 'element',
      prefix: ['app', 'ndwu'],
      style: 'kebab-case',
    },
  ],

  '@angular-eslint/directive-selector': [
    WARN,
    {
      type: ['attribute'],
      prefix: ['app', 'ndwu'],
      style: 'camelCase',
    },
  ],

  '@angular-eslint/no-empty-lifecycle-method': OFF,
  '@angular-eslint/prefer-inject': OFF,
  '@angular-eslint/component-class-suffix': ERROR,
  '@angular-eslint/contextual-lifecycle': ERROR,
  '@angular-eslint/directive-class-suffix': ERROR,
  '@angular-eslint/no-conflicting-lifecycle': ERROR,
  '@angular-eslint/use-lifecycle-interface': ERROR,
};

module.exports = tseslint.config(
  // @see https://typescript-eslint.io/getting-started/typed-linting/
  {
    languageOptions: {
      'sourceType': 'module',

      parserOptions: {
        'projectService': true,
        'tsconfigRootDir': __dirname,
      },
    },
  },
  {
    files: ['**/*.ts'],
    ignores: [
      'scripts/**/*.ts', // build scripts
    ],
    extends: [
      eslint.configs.recommended,
      compat.configs['flat/recommended'],

      // https://github.com/typescript-eslint/typescript-eslint/blob/main/packages/eslint-plugin/src/configs/eslintrc/recommended-type-checked.ts
      ...tseslint.configs.recommendedTypeChecked,

      // https://github.com/typescript-eslint/typescript-eslint/blob/main/packages/eslint-plugin/src/configs/eslintrc/stylistic-type-checked.ts
      ...tseslint.configs.stylisticTypeChecked,

      // @see https://github.com/angular-eslint/angular-eslint/blob/main/docs/CONFIGURING_FLAT_CONFIG.md
      ...ngEslint.configs.tsRecommended,
    ],
    plugins: {
      import: fixupPluginRules(_import),
      jsdoc,
      'prefer-arrow': preferArrow,
      '@stylistic': stylistic,
    },

    // This allows your inline Component templates to be extracted and linted with the same
    // rules as your external .html template files
    // @see https://github.com/angular-eslint/angular-eslint/blob/main/docs/CONFIGURING_FLAT_CONFIG.md#configuration-example
    processor: ngEslint.processInlineTemplates,

    rules: {
      ...JS_RULE_OVERRIDES,
      ...TS_RULE_OVERRIDES,
      ...NG_RULE_OVERRIDES,
    },
  },
  // Angular templates
  {
    files: ['**/*.html'],
    extends: [
      ...ngEslint.configs.templateRecommended,
      ...ngEslint.configs.templateAccessibility,
    ],
    rules: {
      '@angular-eslint/template/elements-content': OFF,
    },
  },
  // Extra configuration for TS files in specific directories
  {
    files: ['src/api/**/*.ts'],
    rules: {
      '@typescript-eslint/no-unsafe-return': OFF,
      '@typescript-eslint/explicit-module-boundary-types': OFF,
    },
  },
  {
    files: ['src/domain/net2/**/*.ts'],
    rules: {
      '@typescript-eslint/no-unsafe-declaration-merging': OFF,
    },
  },
  {
    files: ['src/domain/net2/entity/**/*.ts'],
    rules: {
      '@typescript-eslint/no-empty-object-type': OFF,
    },
  },
  {
    files: ['src/app/features/wizards-initial-setup/components/isw-schematic/**/*.ts'],
    rules: {
      // allowing `x` as a variable name makes sense for code that manipulates 2D coordinates
      'id-blacklist': [1, 'e', 'cb'],
    },
  },
  {
    files: ['src/lib/core/components/schedule-editor/**/*.ts'],
    rules: {
      // allowing `x` as a variable name makes sense for code that manipulates 2D coordinates
      'id-blacklist': OFF,
    },
  },
  {
    files: ['scripts/**/*.ts'],

    languageOptions: {
      globals: {
        ...globals.node,
      },
    },

    extends: [
      eslint.configs.recommended,

      // https://github.com/typescript-eslint/typescript-eslint/blob/main/packages/eslint-plugin/src/configs/eslintrc/recommended-type-checked.ts
      ...tseslint.configs.recommendedTypeChecked,

      // https://github.com/typescript-eslint/typescript-eslint/blob/main/packages/eslint-plugin/src/configs/eslintrc/stylistic-type-checked.ts
      ...tseslint.configs.stylisticTypeChecked,
    ],
    plugins: {
      import: fixupPluginRules(_import),
      jsdoc,
      'prefer-arrow': preferArrow,
      '@stylistic': stylistic,
    },

    rules: {
      ...JS_RULE_OVERRIDES,
      ...TS_RULE_OVERRIDES,
      'no-console': OFF,
    },
  },
  {
    files: ['scripts/figma/**/*.ts'],
    rules: {
      // Figma API response types use x/y for offsets and sync scripts are procedural.
      'id-blacklist': [WARN, 'e', 'cb'],
      'max-lines-per-function': OFF,
    },
  },
);
