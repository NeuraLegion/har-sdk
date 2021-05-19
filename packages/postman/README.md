# @har-sdk/postman

Transform you Postman collection to a series of HAR request objects.

- https://schema.getpostman.com/collection/json/v2.1.0/draft-07/docs/index.html
- http://www.softwareishard.com/blog/har-12-spec/#request

## Setup

```bash
npm i --save @har-sdk/postman
```

## 🚀 Usage

Using as a ES module:

```ts
import { postman2har } from '@har-sdk/postman';
import collection from 'your-postman-collection.json';

postman2har(collection).then((requests) => {
  console.log(requests);
});
```

If you want to pass additional data to resolve environment variables you can pass them via options:
```ts
postman2har(collection, {
  environment: { baseUrl: 'https://example.com' }
}).then((requests) => {
  console.log(requests);
});
```
