module.exports = {
  displayName: 'editor',
  transform: {
    '^.+\\.[tj]s$': 'ts-jest'
  },
  moduleFileExtensions: ['ts', 'js', 'json'],
  coverageDirectory: '../../coverage/editor',
  preset: '../../jest.preset.js'
};
