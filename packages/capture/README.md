# @har-sdk/capture

Fetch requests in HAR format

This module makes a request and captures it as a [HAR](http://www.softwareishard.com/blog/har-12-spec/) object.
Under the covers it uses [request](https://www.npmjs.com/package/request) and just passes through all options.
Currently only GET requests are supported although other methods will probably work. The request body might not be properly captured though.

It can now be also used in stream mode. This means that it will stream data events containing the body of the response and then at the end event, the HAR object will be accessible.

## Setup

```bash
npm i --save @har-sdk/capture
```

## API

```ts
import { captureHar } from '@har-sdk/capture';

captureHar(
  {
    url: 'http://www.google.com'
  },
  { withContent: false }
).then((har) => {
  console.log(JSON.stringify(har, null, 2));
});
```

#### `requestOptions`

The [options](https://www.npmjs.com/package/request#requestoptions-callback) for making the request, is just passed through to request package.
This can accept the url directly.

#### `harOptions`

Optional configuration for the resulting HAR object.

##### `withContent`

Defaults to `true`. Specifies whether the response content object should contain the full body of the response.

##### `maxContentLength`

Defaults to `Infinity`. Limits the response body to a maximum byte size.
If the response body is larger than the specified limit, the content text won't exist and an error will be returned for this entity with the code `MAX_RES_BODY_SIZE`.
