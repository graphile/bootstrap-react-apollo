module.exports = {
  root: true,
  env: {
    browser: true,
    node: true
  },
  parserOptions: {
    parser: 'babel-eslint'
  },
  extends: [
    "eslint:recommended",
    // https://github.com/vuejs/eslint-plugin-vue#priority-a-essential-error-prevention
    // consider switching to `plugin:vue/strongly-recommended` or `plugin:vue/recommended` for stricter rules.
    "plugin:vue/recommended",
    "plugin:prettier/recommended"
  ],
  // required to lint *.vue files
  plugins: [
    "jest", "vue", "graphql"
  ],
  // add your custom rules here
  rules: {
    "semi": [2, "never"],
    "no-console": "off",
    "vue/max-attributes-per-line": "off",
    "prettier/prettier": ["error", { "semi": false }],
    // Autofix removes debugger automatically, which makes debugging annoying.
    "no-debugger": 0,

    "vue/html-self-closing": [
      "error",
      {
        html: {
          void: "never",
          normal: "any",
          component: "any",
        },
        svg: "always",
        math: "always",
      },
    ],
    "vue/html-indent": [
      "error",
      2,
      {
        attribute: 1,
        closeBracket: 0,
        alignAttributesVertically: true,
        ignores: [],
      },
    ],

    // GraphQL
    "graphql/template-strings": [
      "error",
      {
        env: "literal",
        schemaJson: require("./data/schema.json"),
      },
    ],
    "graphql/named-operations": [
      "error",
      {
        schemaJson: require("./data/schema.json"),
      },
    ],
    "graphql/required-fields": [
      "error",
      {
        env: "literal",
        schemaJson: require("./data/schema.json"),
        requiredFields: ["id", "nodeId"],
      },
    ],

    // Jest
    "jest/no-focused-tests": 2,
    "jest/no-identical-title": 2,

    // Embrace JavaScript...
    "no-plusplus": 0,
    "no-bitwise": 0,
    "no-confusing-arrow": 0,
    "no-else-return": 0,
    "no-return-assign": [2, "except-parens"],
    "no-underscore-dangle": 0,
    "no-unused-vars": [
      2,
      {
        argsIgnorePattern: "^_",
        varsIgnorePattern: "^_",
      },
    ],
    "no-cond-assign": [2, "except-parens"],
    "no-unused-expressions": [
      0,
      {
        allowTernary: true,
      },
    ],
    "prefer-arrow-callback": [
      "error",
      {
        allowNamedFunctions: true,
      },
    ],
    "no-param-reassign": [
      "error",
      {
        props: true,
        // Allow overwriting properties on 'memo' which is the name we tend to use in `.reduce(...)` calls
        ignorePropertyModificationsFor: ["memo", "req", "res"],
      },
    ],
    camelcase: 0,
  },
};
