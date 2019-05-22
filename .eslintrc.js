module.exports = {
  parser: "babel-eslint",
  extends: ["airbnb", "prettier", "plugin:vue/recommended",],
  plugins: ["jest", "react", "prettier", "graphql"],
  env: {
    browser: true,
    jest: true,
    node: true,
  },
  rules: {
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
    "vue/max-attributes-per-line": [
      2,
      {
        singleline: 2,
        multiline: {
          max: 1,
          allowFirstLine: false,
        },
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
        ignoreFragmentSpreads: true,
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
