module.exports = {
  displayName: 'openapi-sampler',
  transform: {
    '^.+\\.[tj]s$': 'ts-jest'
  },
  moduleFileExtensions: ['ts', 'js', 'json'],
  coverageDirectory: '../../coverage/openapi-sampler',
  preset: '../../jest.preset.js'
};
