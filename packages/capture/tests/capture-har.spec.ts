import { captureHar } from '../src';
import nock from 'nock';

describe('Capture HAR', () => {
  beforeAll(() => {
    nock.disableNetConnect();
    nock.enableNetConnect('127.0.0.1');
  });

  afterEach(() => nock.cleanAll());

  afterAll(() => nock.enableNetConnect());

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
    expect(har).toHaveProperty('log.entries[0].request.method', 'GET');
    expect(har).toHaveProperty('log.entries[0].request.url', url);
    expect(har).toHaveProperty(
      'log.entries[0].request.headers[0].name',
      'host'
    );
    expect(har).toHaveProperty(
      'log.entries[0].request.headers[0].value',
      `localhost:8000`
    );

    expect(har).toHaveProperty('log.entries[0].response.status', 200);
    expect(har).toHaveProperty('log.entries[0].response.content.size', 4);
    expect(har).toHaveProperty(
      'log.entries[0].response.content.mimeType',
      'text/plain'
    );
    expect(har).toHaveProperty('log.entries[0].response.content.text', 'body');
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
    expect(har).toHaveProperty(
      'log.entries[0].response.cookies[0].name',
      `foo`
    );
    expect(har).toHaveProperty(
      'log.entries[0].response.cookies[0].value',
      `bar`
    );
    expect(har).toHaveProperty(
      'log.entries[0].response.cookies[1].name',
      `equation`
    );
    expect(har).toHaveProperty(
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
    expect(har).toHaveProperty(
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
    expect(har).toHaveProperty('log.entries[0].request.url', url);
    expect(har).toHaveProperty(
      'log.entries[0].response.redirectURL',
      redirectUrl
    );
    expect(har).toHaveProperty('log.entries[1].request.url', redirectUrl);
    expect(har).toHaveProperty(
      'log.entries[0].request.headers[0].name',
      'host'
    );
    expect(har).toHaveProperty(
      'log.entries[0].request.headers[0].value',
      `localhost:8000`
    );
    expect(har).toHaveProperty(
      'log.entries[1].request.headers[0].name',
      'host'
    );
    expect(har).toHaveProperty(
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
    expect(har).toHaveProperty('log.entries[0].response.status', 301);
    expect(har).toHaveProperty('log.entries[0].response.redirectURL', url);
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
    expect(har).toHaveProperty('log.entries[0].request.url', expected);
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

    expect(har).toHaveProperty(
      'log.entries[0].request.queryString[0].name',
      'param1'
    );
    expect(har).toHaveProperty(
      'log.entries[0].request.queryString[0].value',
      'bar'
    );
    expect(har).toHaveProperty(
      'log.entries[0].request.queryString[1].name',
      'param2'
    );
    expect(har).toHaveProperty(
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
    expect(har).toHaveProperty('log.entries[0].request.method', 'GET');
    expect(har).toHaveProperty('log.entries[0].request.url', 'http://x/');

    expect(har).toHaveProperty('log.entries[0].response.status', 0);
    expect(har).toHaveProperty(
      'log.entries[0].response._error.code',
      expect.stringMatching(/EAI_AGAIN|ENOTFOUND/)
    );
    expect(har).toHaveProperty(
      'log.entries[0].response._error.message',
      expect.stringMatching(/getaddrinfo EAI_AGAIN x|getaddrinfo ENOTFOUND x/)
    );
    expect(har).toHaveProperty(
      'log.entries[0].response.content.mimeType',
      'x-unknown'
    );
  });
});
