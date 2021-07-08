module.exports = {
  require: ['ts-node/register', 'tsconfig-paths/register'],
  recursive: true,
  reporter: 'dot',
  jobs: 5,
  parallel: true,
  timeout: 10000
};
