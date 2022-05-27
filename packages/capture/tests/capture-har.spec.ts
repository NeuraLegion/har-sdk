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
    expect(har).toMatchObject({
      log: {
        entries: [
          {
            request: {
              url,
              method: 'GET',
              headers: [{ name: 'host', value: 'localhost:8000' }]
            },
            response: {
              status: 200,
              content: { size: 4, mimeType: 'text/plain', text: 'body' }
            }
          }
        ]
      }
    });
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

    expect(har).toMatchObject({
      log: {
        entries: [
          {
            response: {
              cookies: [
                {
                  name: 'foo',
                  value: 'bar'
                },
                {
                  name: 'equation',
                  value: 'E=mc^2'
                }
              ]
            }
          }
        ]
      }
    });
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

    expect(har).toMatchObject({
      log: {
        entries: [
          {
            request: {
              url: `http://localhost:8000/`
            }
          }
        ]
      }
    });
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
    expect(har).toMatchObject({
      log: {
        entries: [
          {
            request: {
              url,
              headers: [
                {
                  name: 'host',
                  value: 'localhost:8000'
                }
              ]
            },
            response: {
              redirectURL: redirectUrl
            }
          },
          {
            request: {
              url: redirectUrl,
              headers: [
                {
                  name: 'host',
                  value: 'localhost:3000'
                }
              ]
            }
          }
        ]
      }
    });
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
    expect(har).toMatchObject({
      log: {
        entries: expect.arrayContaining([
          expect.objectContaining({
            response: expect.objectContaining({
              status: 301,
              redirectURL: url
            })
          })
        ])
      }
    });
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
    expect(har).toMatchObject({
      log: {
        entries: [
          {
            request: {
              url: expected
            }
          }
        ]
      }
    });
  });

  it('should parse querystring', async () => {
    // arrange
    const url = 'http://localhost:8000/';

    nock(url)
      .replyContentLength()
      .get(`/`)
      .query({ param1: 'bar', param2: 'foo' })
      .reply(200, 'body', { 'content-type': 'text/plain' });
    // act
    const har = await captureHar({
      url: `http://localhost:8000?param1=bar&param2=foo`
    });
    // assert
    expect(har).toMatchObject({
      log: {
        entries: [
          {
            request: {
              queryString: [
                {
                  name: 'param1',
                  value: 'bar'
                },
                {
                  name: 'param2',
                  value: 'foo'
                }
              ]
            }
          }
        ]
      }
    });
  });

  it('should handle ENOTFOUND (DNS level error)', async () => {
    // arrange
    nock.enableNetConnect();

    // act
    const har = await captureHar({ url: 'http://a.a' });

    // assert

    expect(har).toMatchObject({
      log: {
        entries: [
          {
            request: {
              method: 'GET',
              url: 'http://a.a/'
            },
            response: {
              status: 0,
              _error: {
                code: expect.stringMatching(/EAI_AGAIN|ENOTFOUND/),
                message: expect.stringMatching(
                  /getaddrinfo EAI_AGAIN a.a|getaddrinfo ENOTFOUND a.a/
                )
              },
              content: {
                mimeType: 'x-unknown'
              }
            }
          }
        ]
      }
    });
  });
});
