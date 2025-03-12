module.exports = {
  displayName: 'core',
  transform: {
    '^.+\\.[tj]s$': 'ts-jest'
  },
  moduleFileExtensions: ['ts', 'js', 'json'],
  coverageDirectory: '../../coverage/core',
  preset: '../../jest.preset.js'
};
