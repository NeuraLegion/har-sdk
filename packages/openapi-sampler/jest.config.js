module.exports = {
  displayName: 'openapi-sampler',
  globals: {
    'ts-jest': {
      tsconfig: '<rootDir>/tsconfig.json'
    }
  },
  transform: {
    '^.+\\.[tj]s$': 'ts-jest'
  },
  moduleFileExtensions: ['ts', 'js', 'json'],
  coverageDirectory: '../../coverage/openapi-sampler',
  preset: '../../jest.preset.js'
};
