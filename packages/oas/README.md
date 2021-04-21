# oas2har

Transform you Swagger OAI spec files to a series of HAR request objects.

* http://swagger.io/specification/
* http://www.softwareishard.com/blog/har-12-spec/#request

## Setup

```bash
npm i --save @neuralegion/oas2har
```

## Usage

Using as a ES module:
```js
import { oasToHarList } from '@neuralegion/oas2har';
import swaggerJSON from 'your-swagger-api.json'; // e.g. http://petstore.swagger.io/v2/swagger.json

oasToHarList(swaggerJSON)
  .then((har) => {
    console.log(har);
  });
```

## Testing

```bash
npm run test
```
