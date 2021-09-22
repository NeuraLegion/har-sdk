import { readFileSync } from 'fs';
import { resolve } from 'path';
import 'chai/register-should';

describe('PostmanTreeNodeManager', () => {
  const gitHubSwagger = readFileSync(
    resolve('./tests/postman-sample1.json'),
    'utf-8'
  );

  describe('parse', () => {
    it('should successfully parse document', async () => {
      // TODO implementation
      gitHubSwagger.should.be.not.null;
    });
  });
});
