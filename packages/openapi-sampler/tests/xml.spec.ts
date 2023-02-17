import { sample } from '../src';

describe('xml', () => {
  it('should serialize an object to XML', () => {
    const schema: {
      type: string;
      properties: Record<string, unknown>;
    } = {
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

    const result = sample(schema, { serializeToXml: true });
    expect(result).toEqual(
      `<?xml version="1.0" encoding="UTF-8"?>\n<root>\n\t<id>42</id>\n\t<title>lorem</title>\n\t<author>lorem</author>\n</root>`
    );
  });

  it('should serialize an array to XML', () => {
    const schema: {
      type: string;
      items: Record<string, unknown>;
      example: string[];
    } = {
      type: 'array',
      items: {
        type: 'string'
      },
      example: ['one', 'two', 'three']
    };

    const result = sample(schema, { serializeToXml: true });
    expect(result).toEqual(
      `<?xml version="1.0" encoding="UTF-8"?>\n<root>one</root>\n<root>two</root>\n<root>three</root>`
    );
  });

  it('should override the node name', () => {
    const schema: {
      type: string;
      properties: Record<string, unknown>;
      xml: {
        name: string;
      };
    } = {
      type: 'object',
      properties: {
        foo: {
          type: 'string',
          default: 'bar'
        }
      },
      xml: {
        name: 'x-bar'
      }
    };

    const result = sample(schema, { serializeToXml: true });
    expect(result).toEqual(
      `<?xml version="1.0" encoding="UTF-8"?>\n<x-bar>\n\t<foo>bar</foo>\n</x-bar>`
    );
  });

  it('should override the attribute name', () => {
    const schema: {
      type: string;
      properties: Record<string, unknown>;
      xml: {
        name: string;
      };
    } = {
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

    const result = sample(schema, { serializeToXml: true });
    expect(result).toEqual(
      `<?xml version="1.0" encoding="UTF-8"?>\n<book>\n\t<id>42</id>\n\t<xml-title>lorem</xml-title>\n\t<author>lorem</author>\n</book>`
    );
  });

  it('should convert the property to an attribute', () => {
    const schema: {
      type: string;
      properties: Record<string, unknown>;
      xml: {
        name: string;
      };
    } = {
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

    const result = sample(schema, { serializeToXml: true });
    expect(result).toEqual(
      `<?xml version="1.0" encoding="UTF-8"?>\n<book id="42">\n\t<title>lorem</title>\n\t<author>lorem</author>\n</book>`
    );
  });

  it('should add the namespace', () => {
    const schema: {
      type: string;
      properties: Record<string, unknown>;
      xml: {
        name: string;
        namespace: string;
      };
    } = {
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

    const result = sample(schema, { serializeToXml: true });
    expect(result).toEqual(
      `<?xml version="1.0" encoding="UTF-8"?>\n<book xmlns="http://example.com/schema">\n\t<id>42</id>\n\t<title>lorem</title>\n\t<author>lorem</author>\n</book>`
    );
  });

  it('should add the namespace and prefix', () => {
    const schema: {
      type: string;
      properties: Record<string, unknown>;
      xml: {
        name: string;
        prefix: string;
        namespace: string;
      };
    } = {
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

    const result = sample(schema, { serializeToXml: true });
    expect(result).toEqual(
      `<?xml version="1.0" encoding="UTF-8"?>\n<smp:book xmlns:smp="http://example.com/schema">\n\t<id>42</id>\n\t<title>lorem</title>\n\t<author>lorem</author>\n</smp:book>`
    );
  });

  it('should add the prefix to an attribute', () => {
    const schema: {
      type: string;
      properties: Record<string, unknown>;
      xml: {
        name: string;
      };
    } = {
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

    const result = sample(schema, { serializeToXml: true });
    expect(result).toEqual(
      `<?xml version="1.0" encoding="UTF-8"?>\n<book smp:id="42">\n\t<title>lorem</title>\n\t<author>lorem</author>\n</book>`
    );
  });

  it('should add the prefix to a children element', () => {
    const schema: {
      type: string;
      properties: Record<string, unknown>;
      xml: {
        name: string;
      };
    } = {
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

    const result = sample(schema, { serializeToXml: true });
    expect(result).toEqual(
      `<?xml version="1.0" encoding="UTF-8"?>\n<book>\n\t<smp:id>42</smp:id>\n\t<title>lorem</title>\n\t<author>lorem</author>\n</book>`
    );
  });

  it('should serialize the array as a sequence of elements', () => {
    const schema: {
      type: string;
      items: Record<string, unknown>;
      example: string[];
      xml: {
        name: string;
      };
    } = {
      type: 'array',
      items: {
        type: 'string'
      },
      example: ['one', 'two', 'three'],
      xml: {
        name: 'book'
      }
    };

    const result = sample(schema, { serializeToXml: true });
    expect(result).toEqual(
      `<?xml version="1.0" encoding="UTF-8"?>\n<book>one</book>\n<book>two</book>\n<book>three</book>`
    );
  });

  it('should wrap the items to a parent node', () => {
    const schema: {
      type: string;
      items: Record<string, unknown>;
      example: string[];
      xml: {
        name: string;
        wrapped: boolean;
      };
    } = {
      type: 'array',
      items: {
        type: 'string'
      },
      example: ['one', 'two', 'three'],
      xml: {
        name: 'book',
        wrapped: true
      }
    };

    const result = sample(schema, { serializeToXml: true });
    expect(result).toEqual(
      `<?xml version="1.0" encoding="UTF-8"?>\n<book>\n\t<book>one</book>\n\t<book>two</book>\n\t<book>three</book>\n</book>`
    );
  });

  it('should rename the wrapped items', () => {
    const schema: {
      type: string;
      items: Record<string, unknown>;
      example: string[];
      xml: {
        name: string;
        wrapped: boolean;
      };
    } = {
      type: 'array',
      items: {
        type: 'string',
        xml: {
          name: 'book'
        }
      },
      example: ['one', 'two', 'three'],
      xml: {
        name: 'books',
        wrapped: true
      }
    };

    const result = sample(schema, { serializeToXml: true });
    expect(result).toEqual(
      `<?xml version="1.0" encoding="UTF-8"?>\n<books>\n\t<book>one</book>\n\t<book>two</book>\n\t<book>three</book>\n</books>`
    );
  });
});
