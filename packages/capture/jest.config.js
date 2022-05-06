module.exports = {
  displayName: 'capture',
  globals: {
    'ts-jest': {
      tsconfig: '<rootDir>/tsconfig.json'
    }
  },
  transform: {
    '^.+\\.[tj]s$': 'ts-jest'
  },
  moduleFileExtensions: ['ts', 'js', 'json'],
  coverageDirectory: '../../coverage/capture',
  preset: '../../jest.preset.js'
};
