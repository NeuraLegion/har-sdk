export namespace Postman {
  interface Description {
    content: string;
    type?: string;
  }

  interface PropertyBaseDefinition {
    description?: string | Description;
  }

  interface Version extends PropertyBaseDefinition {
    identifier?: string;
    major: number;
    minor: number;
    patch: number;
  }

  interface Property extends PropertyBaseDefinition {
    id?: string;
    name?: string;
    disabled?: boolean;
  }

  interface UrlMatchPattern {
    pattern?: string;
  }

  interface Certificate extends Property {
    matches?: string[] | UrlMatchPattern[];
    key?:
      | {
          src?: string;
        }
      | string;
    cert?:
      | {
          src?: string;
        }
      | string;
    passphrase?: string;
  }

  interface Variable extends Property {
    value?: any;
    type?: string;
    key?: string;
  }

  interface VariableScope {
    variable: Variable[];
  }

  interface Cookie {
    key?: string;
    value?: string;
    expires?: string;
    maxAge?: number;
    domain: string;
    path: string;
    secure?: boolean;
    httpOnly?: boolean;
    hostOnly?: boolean;
    session?: boolean;
    extensions?: {
      key: string;
      value: string;
    }[];
  }

  interface FormParam extends Property {
    key: string;
    value?: string;
    contentType?: string;
    src?: string[] | string;
  }

  interface Header extends Property {
    key: string;
    value?: string;
    system?: boolean;
  }

  interface ProxyConfig extends Property {
    match?:
      | string
      | {
          pattern: string;
        }
      | UrlMatchPattern;
    host?: string;
    port?: number;
    tunnel?: boolean;
  }

  interface QueryParam extends Property {
    key: string;
    value?: string;
    system?: boolean;
  }

  interface Url extends PropertyBaseDefinition, VariableScope {
    raw?: string;
    auth?: {
      user?: string;
      password?: string;
    };
    hash?: string;
    host?: string | string[];
    path:
      | string
      | (
          | string
          | {
              type?: string;
              value?: string;
            }
        )[];
    port?: string;
    protocol?: string;
    query?: QueryParam[];
  }

  interface RequestBody extends PropertyBaseDefinition {
    mode?: 'raw' | 'urlencoded' | 'formdata' | 'file' | 'graphql';
    raw?: string;
    graphql?: Record<string, any>;
    urlencoded?: QueryParam[] | string;
    file?:
      | string
      | {
          src: string | null;
          content?: string;
        };
    formdata?: FormParam[];
    options?: Record<
      string,
      {
        language: string;
      }
    >;
  }

  interface RequestAuth extends Property {
    type:
      | 'apikey'
      | 'awsv4'
      | 'basic'
      | 'bearer'
      | 'digest'
      | 'edgegrid'
      | 'hawk'
      | 'noauth'
      | 'oauth1'
      | 'oauth2'
      | 'ntlm';
    noauth?: Variable[];
    apikey?: Variable[];
    awsv4?: Variable[];
    basic?: Variable[];
    bearer?: Variable[];
    digest?: Variable[];
    edgegrid?: Variable[];
    hawk?: Variable[];
    ntlm?: Variable[];
    oauth1?: Variable[];
    oauth2?: Variable[];
  }

  interface Request extends Property {
    url: string | Url;
    method?:
      | (
          | 'GET'
          | 'PUT'
          | 'POST'
          | 'PATCH'
          | 'DELETE'
          | 'COPY'
          | 'HEAD'
          | 'OPTIONS'
          | 'LINK'
          | 'UNLINK'
          | 'PURGE'
          | 'LOCK'
          | 'UNLOCK'
          | 'PROPFIND'
          | 'VIEW'
        )
      | string;
    header?: Header[] | string;
    body?: RequestBody;
    auth?: RequestAuth;
    proxy?: ProxyConfig;
    certificate?: Certificate;
  }

  interface Response extends Property {
    body?: string;
    code: number;
    cookie: Cookie[];
    header: Header[];
    originalRequest?: Request;
    responseTime: number;
    status: string;
    responseSize?: number;
  }

  interface Script extends Property {
    type?: string;
    src?: Url;
    exec?: string[] | string;
  }

  interface Event extends Property {
    listen?: string;
    script: string | string[] | Script;
  }

  interface Item extends Property, VariableScope {
    request?: Request;
    response?: Response[];
    event?: Event[];
  }

  interface ItemGroup extends Property, VariableScope {
    item: (Item | ItemGroup)[];
    auth?: RequestAuth;
    event?: Event[];
  }

  interface Collection extends ItemGroup {
    info: {
      schema: string;
      name?: string;
      description?: Description | string;
      version?: Version | string;
    };
  }
}
