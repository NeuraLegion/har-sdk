module.exports = {
  displayName: 'core',
  globals: {
    'ts-jest': {
      tsconfig: '<rootDir>/tsconfig.spec.json'
    }
  },
  transform: {
    '^.+\\.[tj]s$': 'ts-jest'
  },
  moduleFileExtensions: ['ts', 'js', 'json'],
  coverageDirectory: '../../coverage/core',
  preset: '../../jest.preset.js'
};
