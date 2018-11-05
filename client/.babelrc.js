module.exports = {
  presets: [
    [
      "@babel/preset-react",
      {
        development: process.env.NODE_ENV === "development",
      },
    ],
    [
      "@babel/env",
      {
        targets: {
          node: "current"
        }
      }
    ]
  ],
  plugins: [
    "@babel/plugin-proposal-class-properties"
  ]
};
