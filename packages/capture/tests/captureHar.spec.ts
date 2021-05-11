import { assert } from 'chai';
import { Server } from './mocks/Server';
import { captureHar } from './captureHar';

describe('Capture HAR', async () => {
  const server: Server = new Server();

  afterEach(() => {
    console.log('Stop server');
    server.stop();
  });

  it('Captures simple requests', async () => {
    await server.start(3000, (_req, res) => {
      res.end('body');
    });

    const har = await captureHar({ url: 'http://localhost:3000' });

    assert.nestedPropertyVal(har, 'log.entries[0].request.method', 'GET');
    assert.nestedPropertyVal(
      har,
      'log.entries[0].request.url',
      'http://localhost:3000/'
    );
    assert.nestedPropertyVal(
      har,
      'log.entries[0].request.headers[0].name',
      'host'
    );
    assert.nestedPropertyVal(
      har,
      'log.entries[0].request.headers[0].value',
      'localhost:3000'
    );

    assert.nestedPropertyVal(har, 'log.entries[0].response.status', 200);
    assert.nestedPropertyVal(har, 'log.entries[0].response.content.size', 4);
    assert.nestedPropertyVal(
      har,
      'log.entries[0].response.content.mimeType',
      'x-unknown'
    );
    assert.nestedPropertyVal(
      har,
      'log.entries[0].response.content.text',
      'body'
    );
    assert.nestedPropertyVal(
      har,
      'log.entries[0].response._remoteAddress',
      '127.0.0.1'
    );
  });

  it('Accepts a url directly', async () => {
    await server.start(3000, (_req, res) => {
      res.end('body');
    });

    const har = await captureHar('http://localhost:3000');

    assert.nestedPropertyVal(
      har,
      'log.entries[0].request.url',
      'http://localhost:3000/'
    );
  });

  it('Parses querystring', async () => {
    await server.start(3000, (_req, res) => res.end());

    const har = await captureHar({
      url: 'http://localhost:3000?param1=value1&param2=value2'
    });

    assert.nestedPropertyVal(
      har,
      'log.entries[0].request.queryString[0].name',
      'param1'
    );
    assert.nestedPropertyVal(
      har,
      'log.entries[0].request.queryString[0].value',
      'value1'
    );
    assert.nestedPropertyVal(
      har,
      'log.entries[0].request.queryString[1].name',
      'param2'
    );
    assert.nestedPropertyVal(
      har,
      'log.entries[0].request.queryString[1].value',
      'value2'
    );
  });

  it('Handles ENOTFOUND (DNS level error)', async () => {
    const har = await captureHar({ url: 'http://x' });

    assert.nestedPropertyVal(har, 'log.entries[0].request.method', 'GET');
    assert.nestedPropertyVal(har, 'log.entries[0].request.url', 'http://x/');

    assert.nestedPropertyVal(har, 'log.entries[0].response.status', 0);
    assert.nestedPropertyVal(
      har,
      'log.entries[0].response._error.code',
      'ENOTFOUND'
    );
    assert.nestedPropertyVal(
      har,
      'log.entries[0].response._error.message',
      'getaddrinfo ENOTFOUND x'
    );
    assert.nestedPropertyVal(
      har,
      'log.entries[0].response.content.mimeType',
      'x-unknown'
    );
  });
});
