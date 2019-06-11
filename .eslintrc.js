module.exports = {
  parser: "babel-eslint",
  extends: ["airbnb", "prettier", "prettier/react"],
  plugins: ["jest", "react", "prettier", "graphql"],
  env: {
    browser: true,
    jest: true,
    node: true,
  },
  rules: {
    "prettier/prettier": "error",

    // Autofix removes debugger automatically, which makes debugging annoying.
    "no-debugger": 0,

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

    // React
    "react/require-default-props": 0,
    "react/prefer-stateless-function": 0,
    "react/no-unescaped-entities": 1,
    "react/jsx-filename-extension": [1, { extensions: [".js", ".jsx"] }],
    "jsx-a11y/mouse-events-have-key-events": 0,
    "jsx-a11y/anchor-is-valid": [
      "error",
      {
        components: ["Link"],
        specialLink: ["to"],
        aspects: ["noHref", "invalidHref", "preferButton"],
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
