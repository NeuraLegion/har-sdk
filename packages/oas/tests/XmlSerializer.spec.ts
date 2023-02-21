import { XmlSerializer } from '../src/converter';
import { OpenAPIV3 } from '@har-sdk/core';

describe('XmlSerializer', () => {
  const book: { author: string; id: number; title: string } = {
    id: 42,
    title: 'lorem',
    author: 'lorem'
  };
  const titles: string[] = ['one', 'two', 'three'];

  let sut!: XmlSerializer;

  beforeEach(() => {
    sut = new XmlSerializer();
  });

  describe('serialize', () => {
    it('should serialize an object to XML', () => {
      // arrange
      const schema: OpenAPIV3.SchemaObject = {
        type: 'object',
        properties: {
          id: {
            type: 'integer'
          },
          title: {
            type: 'string'
          },
          author: {
            type: 'string'
          }
        }
      };
      // act
      const result = sut.serialize(book, schema);
      // assert
      expect(result).toEqual(
        `<?xml version="1.0" encoding="UTF-8"?>\n<root>\n\t<id>42</id>\n\t<title>lorem</title>\n\t<author>lorem</author>\n</root>`
      );
    });

    it('should serialize an array to XML', () => {
      // arrange
      const schema: OpenAPIV3.SchemaObject = {
        type: 'array',
        items: {
          type: 'string'
        }
      };
      // act
      const result = sut.serialize(titles, schema);
      // assert
      expect(result).toEqual(
        `<?xml version="1.0" encoding="UTF-8"?>\n<root>one</root>\n<root>two</root>\n<root>three</root>`
      );
    });

    it('should override the node name', () => {
      // arrange
      const schema: OpenAPIV3.SchemaObject = {
        type: 'object',
        properties: {
          id: {
            type: 'integer'
          },
          title: {
            type: 'string'
          },
          author: {
            type: 'string'
          }
        },
        xml: {
          name: 'book'
        }
      };
      // act
      const result = sut.serialize(book, schema);
      // assert
      expect(result).toEqual(
        `<?xml version="1.0" encoding="UTF-8"?>\n<book>\n\t<id>42</id>\n\t<title>lorem</title>\n\t<author>lorem</author>\n</book>`
      );
    });

    it('should override the attribute name', () => {
      // arrange
      const schema: OpenAPIV3.SchemaObject = {
        type: 'object',
        properties: {
          id: {
            type: 'integer'
          },
          title: {
            type: 'string',
            xml: {
              name: 'xml-title'
            }
          },
          author: {
            type: 'string'
          }
        },
        xml: {
          name: 'book'
        }
      };
      // act
      const result = sut.serialize(book, schema);
      // assert
      expect(result).toEqual(
        `<?xml version="1.0" encoding="UTF-8"?>\n<book>\n\t<id>42</id>\n\t<xml-title>lorem</xml-title>\n\t<author>lorem</author>\n</book>`
      );
    });

    it('should convert the property to an attribute', () => {
      // arrange
      const schema: OpenAPIV3.SchemaObject = {
        type: 'object',
        properties: {
          id: {
            type: 'integer',
            xml: {
              attribute: true
            }
          },
          title: {
            type: 'string'
          },
          author: {
            type: 'string'
          }
        },
        xml: {
          name: 'book'
        }
      };
      // act
      const result = sut.serialize(book, schema);
      // assert
      expect(result).toEqual(
        `<?xml version="1.0" encoding="UTF-8"?>\n<book id="42">\n\t<title>lorem</title>\n\t<author>lorem</author>\n</book>`
      );
    });

    it('should add the namespace', () => {
      // arrange
      const schema: OpenAPIV3.SchemaObject = {
        type: 'object',
        properties: {
          id: {
            type: 'integer'
          },
          title: {
            type: 'string'
          },
          author: {
            type: 'string'
          }
        },
        xml: {
          name: 'book',
          namespace: 'http://example.com/schema'
        }
      };
      // act
      const result = sut.serialize(book, schema);
      // assert
      expect(result).toEqual(
        `<?xml version="1.0" encoding="UTF-8"?>\n<book xmlns="http://example.com/schema">\n\t<id>42</id>\n\t<title>lorem</title>\n\t<author>lorem</author>\n</book>`
      );
    });

    it('should add the namespace and prefix', () => {
      // arrange
      const schema: OpenAPIV3.SchemaObject = {
        type: 'object',
        properties: {
          id: {
            type: 'integer'
          },
          title: {
            type: 'string'
          },
          author: {
            type: 'string'
          }
        },
        xml: {
          name: 'book',
          prefix: 'smp',
          namespace: 'http://example.com/schema'
        }
      };
      // act
      const result = sut.serialize(book, schema);
      // assert
      expect(result).toEqual(
        `<?xml version="1.0" encoding="UTF-8"?>\n<smp:book xmlns:smp="http://example.com/schema">\n\t<id>42</id>\n\t<title>lorem</title>\n\t<author>lorem</author>\n</smp:book>`
      );
    });

    it('should add the namespace and prefix to a child', () => {
      // arrange
      const schema: OpenAPIV3.SchemaObject = {
        type: 'object',
        properties: {
          id: {
            type: 'integer'
          },
          title: {
            type: 'string'
          },
          author: {
            type: 'string',
            xml: {
              prefix: 'smp',
              namespace: 'http://example.com/schema'
            }
          }
        },
        xml: {
          name: 'book'
        }
      };
      // act
      const result = sut.serialize(book, schema);
      // assert
      expect(result).toEqual(
        `<?xml version="1.0" encoding="UTF-8"?>\n<book>\n\t<id>42</id>\n\t<title>lorem</title>\n\t<smp:author xmlns:smp="http://example.com/schema">lorem</smp:author>\n</book>`
      );
    });

    it('should add the prefix to an attribute', () => {
      // arrange
      const schema: OpenAPIV3.SchemaObject = {
        type: 'object',
        properties: {
          id: {
            type: 'integer',
            xml: {
              attribute: true,
              prefix: 'smp'
            }
          },
          title: {
            type: 'string'
          },
          author: {
            type: 'string'
          }
        },
        xml: {
          name: 'book'
        }
      };
      // act
      const result = sut.serialize(book, schema);
      // assert
      expect(result).toEqual(
        `<?xml version="1.0" encoding="UTF-8"?>\n<book smp:id="42">\n\t<title>lorem</title>\n\t<author>lorem</author>\n</book>`
      );
    });

    it('should add the prefix to a children element', () => {
      // arrange
      const schema: OpenAPIV3.SchemaObject = {
        type: 'object',
        properties: {
          id: {
            type: 'integer',
            xml: {
              prefix: 'smp'
            }
          },
          title: {
            type: 'string'
          },
          author: {
            type: 'string'
          }
        },
        xml: {
          name: 'book'
        }
      };
      // act
      const result = sut.serialize(book, schema);
      // assert
      expect(result).toEqual(
        `<?xml version="1.0" encoding="UTF-8"?>\n<book>\n\t<smp:id>42</smp:id>\n\t<title>lorem</title>\n\t<author>lorem</author>\n</book>`
      );
    });

    it('should serialize the array as a sequence of elements', () => {
      // arrange
      const schema: OpenAPIV3.SchemaObject = {
        type: 'array',
        items: {
          type: 'string'
        },
        xml: {
          name: 'book'
        }
      };
      // act
      const result = sut.serialize(titles, schema);
      // assert
      expect(result).toEqual(
        `<?xml version="1.0" encoding="UTF-8"?>\n<book>one</book>\n<book>two</book>\n<book>three</book>`
      );
    });

    it('should wrap the items to a parent node', () => {
      // arrange
      const schema: OpenAPIV3.SchemaObject = {
        type: 'array',
        items: {
          type: 'string'
        },
        xml: {
          name: 'book',
          wrapped: true
        }
      };
      // act
      const result = sut.serialize(titles, schema);
      // assert
      expect(result).toEqual(
        `<?xml version="1.0" encoding="UTF-8"?>\n<book>\n\t<book>one</book>\n\t<book>two</book>\n\t<book>three</book>\n</book>`
      );
    });

    it('should rename the wrapped items', () => {
      // arrange
      const schema: OpenAPIV3.SchemaObject = {
        type: 'array',
        items: {
          type: 'string',
          xml: {
            name: 'book'
          }
        },
        xml: {
          name: 'books',
          wrapped: true
        }
      };
      // act
      const result = sut.serialize(titles, schema);
      // assert
      expect(result).toEqual(
        `<?xml version="1.0" encoding="UTF-8"?>\n<books>\n\t<book>one</book>\n\t<book>two</book>\n\t<book>three</book>\n</books>`
      );
    });
  });
});
