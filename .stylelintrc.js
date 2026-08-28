module.exports = {
  'extends': [
    'stylelint-config-standard-scss',
    'stylelint-config-hudochenkov/order',
  ],
  'plugins': [
    'stylelint-scss',
    'stylelint-order',
    'stylelint-no-unsupported-browser-features',
  ],
  'rules': {
    'plugin/no-unsupported-browser-features': [
      true,
      {
        'ignore': ['css-nesting', 'css3-cursors'],
        'ignorePartialSupport': true,
      },
    ],
    'media-feature-range-notation': 'prefix',
    'keyframes-name-pattern': null,
    'no-empty-source': null,
    'scss/load-no-partial-leading-underscore': null,
    'selector-max-type': null,
    'selector-class-pattern': null,
    'scss/at-mixin-pattern': null,
    'scss/at-mixin-argumentless-call-parentheses': 'always',
    'scss/no-global-function-names': null,
    'no-invalid-position-declaration': [
      true,
      {
        'ignoreAtRules': ['mixin'],
      },
    ],

    'at-rule-no-unknown': null,
    'scss/at-rule-no-unknown': true,

    'function-no-unknown': null,
    'scss/function-no-unknown': true,

    'scss/at-extend-no-missing-placeholder': null,
    'no-descending-specificity': null,
    'block-no-redundant-nested-style-rules': null,
    'scss/dollar-variable-empty-line-before': null,

    'scss/dollar-variable-pattern': '^[a-z][a-zA-Z0-9]*(-[a-zA-Z0-9]+)*$',
    'scss/at-function-pattern': '^[a-z][a-z0-9]+([A-Z]+[a-z0-9]+)*$',

    'scss/dollar-variable-first-in-block': [
      true,
      {
        'ignore': [
          'comments',
          'imports',
        ],
        'except': [
          'root',
          'function',
        ],
      },
    ],
    'color-hex-length': null,
  },
  'overrides': [
    {
      'files': ['src/playground/**/*.scss'],
      'rules': {
        'plugin/no-unsupported-browser-features': null,
        'order/order': null,
      },
    },
  ],
};
