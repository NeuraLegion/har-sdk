import 'chai/register-should';
import { captureHar } from '../src';
import nock from 'nock';

describe('Capture HAR', () => {
  before(() => {
    nock.disableNetConnect();
    nock.enableNetConnect('127.0.0.1');
  });

  afterEach(() => nock.cleanAll());

  after(() => nock.enableNetConnect());

  it('should capture a simple GET requests', async () => {
    // arrange
    const url = 'http://localhost:8000/';

    nock(url)
      .replyContentLength()
      .get(`/`)
      .reply(200, 'body', { 'content-type': 'text/plain' });

    // act
    const har = await captureHar({ url });

    // assert
    har.should.have.nested.property('log.entries[0].request.method', 'GET');
    har.should.have.nested.property('log.entries[0].request.url', url);
    har.should.have.nested.property(
      'log.entries[0].request.headers[0].name',
      'host'
    );
    har.should.have.nested.property(
      'log.entries[0].request.headers[0].value',
      `localhost:8000`
    );

    har.should.have.nested.property('log.entries[0].response.status', 200);
    har.should.have.nested.property('log.entries[0].response.content.size', 4);
    har.should.have.nested.property(
      'log.entries[0].response.content.mimeType',
      'text/plain'
    );
    har.should.have.nested.property(
      'log.entries[0].response.content.text',
      'body'
    );
  });

  it('should parse set-cookie', async () => {
    // arrange
    const url = 'http://localhost:8000/';

    nock(url)
      .replyContentLength()
      .get(`/`)
      .reply(200, 'body', {
        'set-cookie': [
          'foo=bar; Path=/; Domain=example.com',
          'equation=E%3Dmc%5E2; Path=/; Domain=example.com'
        ]
      });

    // act
    const har = await captureHar(`http://localhost:8000/`);

    // assert
    har.should.have.nested.property(
      'log.entries[0].response.cookies[0].name',
      `foo`
    );
    har.should.have.nested.property(
      'log.entries[0].response.cookies[0].value',
      `bar`
    );
    har.should.have.nested.property(
      'log.entries[0].response.cookies[1].name',
      `equation`
    );
    har.should.have.nested.property(
      'log.entries[0].response.cookies[1].value',
      `E=mc^2`
    );
  });

  it('should accept a url directly', async () => {
    // arrange
    const url = 'http://localhost:8000/';

    nock(url)
      .replyContentLength()
      .get(`/`)
      .reply(200, 'body', { 'content-type': 'text/plain' });

    // act
    const har = await captureHar(`http://localhost:8000/`);

    // assert
    har.should.have.nested.property(
      'log.entries[0].request.url',
      `http://localhost:8000/`
    );
  });

  it('should rewrite the host header when it is defined', async () => {
    // arrange
    const url = 'http://localhost:8000/';
    const redirectUrl = 'http://localhost:3000/';

    nock(url)
      .replyContentLength()
      .get(`/`)
      .reply(301, '', { location: redirectUrl });

    nock(redirectUrl).replyContentLength().get(`/`).reply(200);

    // act
    const har = await captureHar({
      url,
      followRedirect: true
    });

    // assert
    har.should.have.nested.property('log.entries[0].request.url', url);
    har.should.have.nested.property(
      'log.entries[0].response.redirectURL',
      redirectUrl
    );
    har.should.have.nested.property('log.entries[1].request.url', redirectUrl);
    har.should.have.nested.property(
      'log.entries[0].request.headers[0].name',
      'host'
    );
    har.should.have.nested.property(
      'log.entries[0].request.headers[0].value',
      `localhost:8000`
    );
    har.should.have.nested.property(
      'log.entries[1].request.headers[0].name',
      'host'
    );
    har.should.have.nested.property(
      'log.entries[1].request.headers[0].value',
      `localhost:3000`
    );
  });

  it('should resolve relative URLs', async () => {
    // arrange
    const url = 'http://localhost:8000/';

    nock(url)
      .replyContentLength()
      .get(`/`)
      .reply(301, '', { location: '../../../../' });

    // act
    const har = await captureHar({
      url,
      followRedirect: true,
      maxRedirects: 1
    });

    // assert
    har.should.have.nested.property('log.entries[0].response.status', 301);
    har.should.have.nested.property('log.entries[0].response.redirectURL', url);
  });

  it('should ignore fragments in request URLs', async () => {
    // arrange
    const expected = 'http://localhost:8000/pdf';
    const url = `${expected}#print`;

    nock(url)
      .replyContentLength()
      .get(`/`)
      .reply(200, 'body', { 'content-type': 'text/plain' });

    // act
    const har = await captureHar({
      url,
      followRedirect: true,
      maxRedirects: 1
    });

    // assert
    har.should.have.nested.property('log.entries[0].request.url', expected);
  });

  it('should parse querystring', async () => {
    // arrange
    const url = 'http://localhost:8000/';

    nock(url)
      .replyContentLength()
      .get(`/`)
      .query({ param1: 'bar', param2: 'foo' })
      .reply(200, 'body', { 'content-type': 'text/plain' });

    const har = await captureHar({
      url: `http://localhost:8000?param1=bar&param2=foo`
    });

    har.should.have.nested.property(
      'log.entries[0].request.queryString[0].name',
      'param1'
    );
    har.should.have.nested.property(
      'log.entries[0].request.queryString[0].value',
      'bar'
    );
    har.should.have.nested.property(
      'log.entries[0].request.queryString[1].name',
      'param2'
    );
    har.should.have.nested.property(
      'log.entries[0].request.queryString[1].value',
      'foo'
    );
  });

  it('should handle ENOTFOUND (DNS level error)', async () => {
    // arrange
    nock.enableNetConnect();

    // act
    const har = await captureHar({ url: 'http://x' });

    // assert
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
