module.exports = {
  require: ['ts-node/register/transpile-only', 'tsconfig-paths/register'],
  recursive: true,
  reporter: 'dot',
  spec: ['**/*.spec.ts', 'test{,s}/**/*.spec.ts'],
  jobs: 5,
  parallel: true,
  timeout: 10000
};
