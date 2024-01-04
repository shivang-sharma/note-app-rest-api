module.exports = {
    parser: "@typescript-eslint/parser",
    parserOptions: {
      project: "tsconfig.json",
      tsconfigRootDir: __dirname,
      sourceType: "module",
    },
    extends: [
        "eslint:recommended",
        "plugin:@typescript-eslint/recommended"
    ],
};