import { Server } from './mocks/Server';
import { captureHar } from './captureHar';
import { assert } from 'chai';

describe('Capture HAR', () => {
  const server: Server = new Server();

  beforeEach(() => server.stop());

  it('Captures simple requests', async () => {
    const address = await server.start((_, res) => res.end('body'));

    const har = await captureHar({ url: `http://localhost:${address.port}` });

    assert.nestedPropertyVal(har, 'log.entries[0].request.method', 'GET');
    assert.nestedPropertyVal(
      har,
      'log.entries[0].request.url',
      `http://localhost:${address.port}/`
    );
    assert.nestedPropertyVal(
      har,
      'log.entries[0].request.headers[0].name',
      'host'
    );
    assert.nestedPropertyVal(
      har,
      'log.entries[0].request.headers[0].value',
      `localhost:${address.port}`
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
    const address = await server.start((_, res) => res.end('body'));

    const har = await captureHar(`http://localhost:${address.port}`);

    assert.nestedPropertyVal(
      har,
      'log.entries[0].request.url',
      `http://localhost:${address.port}/`
    );
  });

  it('Parses querystring', async () => {
    const address = await server.start((_, res) => res.end('body'));

    const har = await captureHar({
      url: `http://localhost:${address.port}?param1=value1&param2=value2`
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
      'EAI_AGAIN'
    );
    assert.nestedPropertyVal(
      har,
      'log.entries[0].response._error.message',
      'getaddrinfo EAI_AGAIN x'
    );
    assert.nestedPropertyVal(
      har,
      'log.entries[0].response.content.mimeType',
      'x-unknown'
    );
  });
});
