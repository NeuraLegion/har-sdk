module.exports = {
  displayName: 'capture',
  transform: {
    '^.+\\.[tj]s$': 'ts-jest'
  },
  moduleFileExtensions: ['ts', 'js', 'json'],
  coverageDirectory: '../../coverage/capture',
  preset: '../../jest.preset.js'
};
