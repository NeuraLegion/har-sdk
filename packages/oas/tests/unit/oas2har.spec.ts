import githubSwagger from '../github_swagger.json';
import { oas2har } from '../../src';
import Har from 'har-format';
import { expect } from 'chai';
import { OpenAPIV2 } from 'openapi-types';

describe('OAS2HAR', async () => {
  it('GitHub swagger v2 JSON to HAR', async () => {
    console.log('START TEST');
    console.log(githubSwagger);

    const [firstRequest]: Har.Request[] = await oas2har(
      (githubSwagger as unknown) as OpenAPIV2.Document
    );

    console.log(firstRequest);

    expect(firstRequest.method).to.equal('GET');
    expect(firstRequest.url).to.equal('https://api.github.com/emojis');
    expect(firstRequest.httpVersion).to.equal('HTTP/1.1');
  });
});
