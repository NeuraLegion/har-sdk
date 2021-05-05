# capture-har

**THIS REPO HAS BEEN DEPRECATED. THE DEVELOPMENT HAS MOVED TO A NEW REPOSITORY: https://github.com/NeuraLegion/har-recorder**

Fetch requests in HAR format

This module makes a request and captures it as a [HAR](http://www.softwareishard.com/blog/har-12-spec/) object.
Under the covers it uses [request](https://www.npmjs.com/package/request) and just passes through all options.
Currently only GET requests are supported although other methods will probably work. The request body might not be properly captured though.

It can now be also used in stream mode. This means that it will stream data events containing the body of the response and then at the end event, the HAR object will be accessible.

## API

```js
// Promise mode
const captureHar = require('@neuralegion/capture-har');
captureHar({
  url: 'http://www.google.com'
}, { withContent: false })
  .then(har => {
    console.log(JSON.stringify(har, null, 2));
  });

// Stream mode
const CaptureHar = require('@neuralegion/capture-har').CaptureHar;
const captureHar = new CaptureHar(require('request'));
captureHar.start({ url: 'http://www.google.com' })
  .on('data', data => // data event will contain the response body as it is received)
  .on('end', () => {
    const har = captureHar.stop();
    // har will contain the HAR object
    })
```

The result of code this can be found in [example.json](https://github.com/Woorank/capture-har/blob/master/example.json).

### `captureHar`

```
captureHar(Object|String requestOptions, [ Object harOptions ]) -> Promise<Object>
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
