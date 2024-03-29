import { type InputSampler, type InputSamplerOptions } from './InputSampler';
import {
  type IntrospectionInputTypeRef,
  type IntrospectionNamedTypeRef,
  type IntrospectionScalarType
} from '@har-sdk/core';

export class ScalarSampler implements InputSampler {
  private readonly SAMPLES: ReadonlyMap<string, string> = new Map<
    string,
    string
  >([
    ['String', '"lorem"'],
    ['Int', '42'],
    ['Boolean', 'true'],
    ['Float', '123.45'],
    ['ID', '"f323fed3-ae3e-41df-abe2-540859417876"'],

    // Scalar type names of Node.js platform, borrowed from 'graphql-scalars' project:
    // https://github.com/Urigo/graphql-scalars/tree/master/src/scalars

    ['Date', '"2023-12-17"'],
    ['Time', '"09:09:06.13Z"'],
    ['DateTime', '"2023-02-01T00:00:00.000Z"'],
    ['DateTimeISO', '"2023-02-01T00:00:00.000Z"'],
    ['Timestamp', '1705494979'],
    ['TimeZone', '"America/Chicago"'],
    ['UtcOffset', '"+05:00"'],
    ['Duration', '"PT65H40M22S"'],
    ['ISO8601Duration', '"P1D"'],
    ['LocalDate', '"2023-01-01"'],
    ['LocalTime', '"23:59:59.999"'],
    ['LocalDateTime', '"2023-01-01T12:00:00+01:00"'],
    ['LocalEndTime', '"23:59:59.999"'],
    ['EmailAddress', '"root@example.com"'],
    ['NegativeFloat', '-123.45'],
    ['NegativeInt', '-42'],
    ['NonEmptyString', 'lorem'],
    ['NonNegativeFloat', '0.0'],
    ['NonNegativeInt', '0'],
    ['NonPositiveFloat', '0.0'],
    ['NonPositiveInt', '0'],
    ['PhoneNumber', '"+16075551234"'],
    ['PositiveFloat', '123.45'],
    ['PositiveInt', '42'],
    ['PostalCode', '"60031"'],
    ['UnsignedFloat', '123.45'],
    ['UnsignedInt', '42'],
    ['URL', '"https://example.com"'],
    ['BigInt', '9007199254740992'],
    ['Long', '42'],
    ['Byte', '"ff"'],
    ['UUID', '"6d400c98-207b-416b-885b-1b1812c25d18"'],
    ['GUID', '"e982c909-c347-4fbc-8ebc-e42ae5cb3312"'],
    ['Hexadecimal', '"123456789ABCDEF"'],
    ['HexColorCode', '"#ffcc00"'],
    ['HSL', '"hsl(270, 60%, 70%)"'],
    ['HSLA', '"hsla(240, 100%, 50%, .05)"'],
    ['IP', '"127.0.0.1"'],
    ['IPv4', '"127.0.0.1"'],
    ['IPv6', '"1080:0:0:0:8:800:200C:417A"'],
    ['ISBN', '"ISBN 978-0615-856"'],
    [
      'JWT',
      '"eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwiaWF0IjoxNTE2MjM5MDIyLCJwcm9qZWN0IjoiZ3JhcGhxbC1zY2FsYXJzIn0.nYdrSfE2nNRAgpiEU1uKgn2AYYKLo28Z0nhPXvsuIww"'
    ],
    ['Latitude', '41.89193'],
    ['Longitude', '-74.00597'],
    ['MAC', '"01:23:45:67:89:ab"'],
    ['Port', '1337'],
    ['RGB', '"rgb(255, 0, 153)"'],
    ['RGBA', '"rgba(51, 170, 51, .7)"'],
    ['SafeInt', '42'],
    ['USCurrency', '"$22,900.00"'],
    ['Currency', '"USD"'],
    ['JSON', '{foo:{bar:"baz"}}'],
    ['JSONObject', '{foo:{bar:"baz"}}'],
    ['IBAN', '"GE29NB0000000101904917"'],
    ['ObjectID', '"5e5677d71bdc2ae76344968c"'],
    ['DID', '"did:example:123456789abcdefghi"'],
    ['CountryCode', '"US"'],
    ['Locale', '"en-US"'],
    ['RoutingNumber', '"111000025"'],
    ['AccountNumber', '"1234567890ABCDEF1"'],
    ['Cuid', '"cjld2cyuq0000t3rmniod1foy"'],
    ['SemVer', '"1.2.3"'],
    ['DeweyDecimal', '1234.56'],
    ['LCCSubclass', '"KBM"'],
    ['IPCPatent', '"F16K 27/02"'],
    ['Regex', '"^(.*)$"'],

    // Scalar type names of .netcore platform, borrowed from 'graphql-dotnet' and 'ChilliCream' projects:
    // https://github.com/graphql-dotnet/graphql-dotnet/blob/master/src/GraphQL/Types/Collections/SchemaTypes.cs
    // https://github.com/ChilliCream/graphql-platform/tree/main/src/HotChocolate/Core/src/Types.Scalars

    ['SByte', '"ef"'],
    ['SignedByte', '"ef"'],
    ['Char', '"a"'],
    ['Single', '123.45'],
    ['Half', '123.45'],
    ['Double', '123.45'],
    ['Decimal', '123.45'],
    ['BigDecimal', '123.45'],
    ['Int16', '42'],
    ['Short', '42'],
    ['UInt16', '42'],
    ['UnsignedShort', '42'],
    ['Int32', '42'],
    ['UInt32', '42'],
    ['UnsignedInt', '42'],
    ['Int64', '42'],
    ['Long', '42'],
    ['UInt64', '42'],
    ['UnsignedLong', '42'],
    ['TimeSpan', '"00:00:10"'],
    ['DateTimeOffset', '"2009-06-15T13:45:30.000Z"'],
    ['Uri', '"https://example.com/api/v1"']
  ]);

  public supportsType(
    typeRef: IntrospectionInputTypeRef
  ): typeRef is IntrospectionNamedTypeRef<IntrospectionScalarType> {
    return 'kind' in typeRef && typeRef.kind === 'SCALAR';
  }

  public sample(
    typeRef: IntrospectionInputTypeRef,
    _options: InputSamplerOptions
  ): string | undefined {
    if (!this.supportsType(typeRef)) {
      return undefined;
    }

    return (
      this.SAMPLES.get(typeRef.name) ??
      this.findSimilarTypeValue(typeRef.name) ??
      'null'
    );
  }

  private findSimilarTypeValue(typeName: string): string | undefined {
    const [typeValue]: string[] = [...this.SAMPLES.entries()]
      .filter(([name, _]: [string, string]) => typeName.endsWith(name))
      .map(([_, value]: [string, string]) => value);

    return typeValue;
  }
}
