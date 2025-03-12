module.exports = {
  displayName: 'oas',
  transform: {
    '^.+\\.[tj]s$': 'ts-jest'
  },
  moduleFileExtensions: ['ts', 'js', 'json'],
  coverageDirectory: '../../coverage/oas',
  preset: '../../jest.preset.js'
};
