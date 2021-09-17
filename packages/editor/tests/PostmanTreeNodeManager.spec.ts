import { PostmanTreeNodeManager } from '../src/parser/PostmanTreeNodeManager';
import { readFileSync } from 'fs';
import { resolve } from 'path';
import 'chai/register-should';

describe('PostmanTreeNodeManager', () => {
  const manager = new PostmanTreeNodeManager();
  const gitHubSwagger = readFileSync(
    resolve('./tests/nexploit.postman.json'),
    'utf-8'
  );

  describe('parse', () => {
    it('should successfully parse document', async () => {
      const tree = manager.parse(gitHubSwagger);
      tree.children.length.should.be.greaterThan(1);
    });
  });
});
