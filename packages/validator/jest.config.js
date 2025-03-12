module.exports = {
  displayName: 'validator',

  transform: {
    '^.+\\.[tj]s$': 'ts-jest'
  },
  moduleFileExtensions: ['ts', 'js', 'json'],
  coverageDirectory: '../../coverage/validator',
  preset: '../../jest.preset.js'
};
