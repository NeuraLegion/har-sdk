module.exports = {
  ignorePatterns: ['!**/*', 'node_modules'],
  extends: ['../../.eslintrc.js'],
  overrides: [
    {
      files: ['*.ts'],
      parserOptions: {
        sourceType: 'module',
        project: ['./tsconfig.json'],
        tsconfigRootDir: __dirname
      }
    },
    {
      env: {
        mocha: true
      },
      files: ['*.spec.ts'],
      parserOptions: {
        sourceType: 'module',
        project: ['./tsconfig.spec.json'],
        tsconfigRootDir: __dirname
      },
      rules: {
        'import/no-extraneous-dependencies': [
          'error',
          { devDependencies: ['src/**/*.spec.ts'] }
        ]
      }
    }
  ]
};
