module.exports = {
  displayName: 'postman',
  transform: {
    '^.+\\.[tj]s$': 'ts-jest'
  },
  moduleFileExtensions: ['ts', 'js', 'json'],
  coverageDirectory: '../../coverage/postman',
  preset: '../../jest.preset.js'
};
