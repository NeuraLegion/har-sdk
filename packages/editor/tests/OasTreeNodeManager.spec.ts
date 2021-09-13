import { OasTreeNodeManager } from '../src/parser/OasTreeNodeManager';
import { readFileSync } from 'fs';
import { resolve } from 'path';
import 'chai/register-should';

describe('OasTreeNodeManager', () => {
  const manager = new OasTreeNodeManager();
  const gitHubSwagger = readFileSync(
    resolve('./tests/github.swagger.json'),
    'utf-8'
  );

  describe('parse', () => {
    it('should successfully parse document', async () => {
      const tree = manager.parse(gitHubSwagger);
    });
  });
});
