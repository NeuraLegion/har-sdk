import { Server } from './mocks/Server';
import { captureHar } from '../src';
import 'chai/register-should';

describe('Capture HAR', () => {
  const server: Server = new Server();

  beforeEach(() => server.stop());

  it('Captures simple requests', async () => {
    const address = await server.start((_, res) => res.end('body'));

    const har = await captureHar({ url: `http://localhost:${address.port}` });

    har.should.have.nested.property('log.entries[0].request.method', 'GET');
    har.should.have.nested.property(
      'log.entries[0].request.url',
      `http://localhost:${address.port}/`
    );
    har.should.have.nested.property(
      'log.entries[0].request.headers[0].name',
      'host'
    );
    har.should.have.nested.property(
      'log.entries[0].request.headers[0].value',
      `localhost:${address.port}`
    );

    har.should.have.nested.property('log.entries[0].response.status', 200);
    har.should.have.nested.property('log.entries[0].response.content.size', 4);
    har.should.have.nested.property(
      'log.entries[0].response.content.mimeType',
      'x-unknown'
    );
    har.should.have.nested.property(
      'log.entries[0].response.content.text',
      'body'
    );
    har.should.have.nested.property(
      'log.entries[0].response._remoteAddress',
      '127.0.0.1'
    );
  });

  it('Accepts a url directly', async () => {
    const address = await server.start((_, res) => res.end('body'));

    const har = await captureHar(`http://localhost:${address.port}`);

    har.should.have.nested.property(
      'log.entries[0].request.url',
      `http://localhost:${address.port}/`
    );
  });

  it('Parses querystring', async () => {
    const address = await server.start((_, res) => res.end('body'));

    const har = await captureHar({
      url: `http://localhost:${address.port}?param1=value1&param2=value2`
    });

    har.should.have.nested.property(
      'log.entries[0].request.queryString[0].name',
      'param1'
    );
    har.should.have.nested.property(
      'log.entries[0].request.queryString[0].value',
      'value1'
    );
    har.should.have.nested.property(
      'log.entries[0].request.queryString[1].name',
      'param2'
    );
    har.should.have.nested.property(
      'log.entries[0].request.queryString[1].value',
      'value2'
    );
  });

  it('Handles ENOTFOUND (DNS level error)', async () => {
    const har = await captureHar({ url: 'http://x' });

    har.should.have.nested.property('log.entries[0].request.method', 'GET');
    har.should.have.nested.property('log.entries[0].request.url', 'http://x/');

    har.should.have.nested.property('log.entries[0].response.status', 0);
    har.should.have.nested
      .property('log.entries[0].response._error.code')
      .oneOf(['EAI_AGAIN', 'ENOTFOUND']);
    har.should.have.nested
      .property('log.entries[0].response._error.message')
      .oneOf(['getaddrinfo EAI_AGAIN x', 'getaddrinfo ENOTFOUND x']);
    har.should.have.nested.property(
      'log.entries[0].response.content.mimeType',
      'x-unknown'
    );
  });
});
