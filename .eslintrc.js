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
    // Autofix removes debugger automatically, which makes debugging annoying.
    "no-debugger": 0,
    "import/no-extraneous-dependencies": 0,

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

    // We install everything at root, ESLint doesn't understand this
    "import/no-extraneous-dependencies": 0,

    // I'm too lazy for propTypes; use TypeScript instead is my advice.
    "react/prop-types": 0,
    "react/forbid-prop-types": 0,

    // You don't _always_ have to use destructuring assignment
    "react/destructuring-assignment": 0,

    // Really we should use hooks, but for components lets just ignore methods that don't use this:
    "class-methods-use-this": 0,

    // You're better at determining if a default export is desired or not than ESLint is
    "import/prefer-default-export": 0,
  },
};
