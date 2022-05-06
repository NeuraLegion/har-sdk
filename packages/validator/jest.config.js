module.exports = {
  displayName: 'validator',
  globals: {
    'ts-jest': {
      tsconfig: '<rootDir>/tsconfig.json'
    }
  },
  transform: {
    '^.+\\.[tj]s$': 'ts-jest'
  },
  moduleFileExtensions: ['ts', 'js', 'json'],
  coverageDirectory: '../../coverage/validator',
  preset: '../../jest.preset.js'
};
