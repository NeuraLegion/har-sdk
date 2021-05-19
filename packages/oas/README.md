# @har-sdk/oas

Transform you Swagger OAI spec files to a series of HAR request objects.

* http://swagger.io/specification/
* http://www.softwareishard.com/blog/har-12-spec/#request

## Setup

```bash
npm i --save @har-sdk/oas
```

## Usage

Using as a ES module:
```js
import { oas2har } from '@har-sdk/oas';
import swaggerJSON from 'your-swagger-api.json'; // e.g. http://petstore.swagger.io/v2/swagger.json

oas2har(swaggerJSON)
  .then((har) => {
    console.log(har);
  });
```
