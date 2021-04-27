module.exports = {
  env: {
    mocha: true
  },
  ignorePatterns: ['!**/*'],
  extends: ['../../../.eslintrc.js'],
  overrides: [
    {
      files: ['*.ts'],
      parserOptions: {
        project: ['../tsconfig.spec.json'],
        tsconfigRootDir: __dirname
      }
    }
  ]
};
