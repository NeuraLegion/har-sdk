import { ScalarSampler } from '../src/converter/input-samplers/ScalarSampler';
import { type InputSamplerOptions } from '../src/converter/input-samplers/InputSampler';
import { graphQLParseValue } from '../src/utils/graphql-parse-value';
import { type IntrospectionInputTypeRef } from 'graphql';

describe('ScalarSampler', () => {
  let sut!: ScalarSampler;

  beforeEach(() => {
    sut = new ScalarSampler();
  });

  describe('sample', () => {
    it.each([
      { input: 'String', expected: '"lorem"' },
      { input: 'Int', expected: '42' },
      { input: 'Boolean', expected: 'true' },
      { input: 'Float', expected: '123.45' },
      { input: 'ID', expected: '"f323fed3-ae3e-41df-abe2-540859417876"' },
      { input: 'Date', expected: '"2023-12-17"' },
      { input: 'Time', expected: '"09:09:06.13Z"' },
      { input: 'DateTime', expected: '"2023-02-01T00:00:00.000Z"' },
      { input: 'DateTimeISO', expected: '"2023-02-01T00:00:00.000Z"' },
      { input: 'Timestamp', expected: '1705494979' },
      { input: 'TimeZone', expected: '"America/Chicago"' },
      { input: 'UtcOffset', expected: '"+05:00"' },
      { input: 'Duration', expected: '"PT65H40M22S"' },
      { input: 'ISO8601Duration', expected: '"P1D"' },
      { input: 'LocalDate', expected: '"2023-01-01"' },
      { input: 'LocalTime', expected: '"23:59:59.999"' },
      { input: 'LocalDateTime', expected: '"2023-01-01T12:00:00+01:00"' },
      { input: 'LocalEndTime', expected: '"23:59:59.999"' },
      { input: 'EmailAddress', expected: '"root@example.com"' },
      { input: 'NegativeFloat', expected: '-123.45' },
      { input: 'NegativeInt', expected: '-42' },
      { input: 'NonEmptyString', expected: 'lorem' },
      { input: 'NonNegativeFloat', expected: '0.0' },
      { input: 'NonNegativeInt', expected: '0' },
      { input: 'NonPositiveFloat', expected: '0.0' },
      { input: 'NonPositiveInt', expected: '0' },
      { input: 'PhoneNumber', expected: '"+16075551234"' },
      { input: 'PositiveFloat', expected: '123.45' },
      { input: 'PositiveInt', expected: '42' },
      { input: 'PostalCode', expected: '"60031"' },
      { input: 'UnsignedFloat', expected: '123.45' },
      { input: 'UnsignedInt', expected: '42' },
      { input: 'URL', expected: '"https://example.com"' },
      { input: 'BigInt', expected: '9007199254740992' },
      { input: 'Long', expected: '42' },
      { input: 'Byte', expected: '"ff"' },
      { input: 'UUID', expected: '"6d400c98-207b-416b-885b-1b1812c25d18"' },
      { input: 'GUID', expected: '"e982c909-c347-4fbc-8ebc-e42ae5cb3312"' },
      { input: 'Hexadecimal', expected: '"123456789ABCDEF"' },
      { input: 'HexColorCode', expected: '"#ffcc00"' },
      { input: 'HSL', expected: '"hsl(270, 60%, 70%)"' },
      { input: 'HSLA', expected: '"hsla(240, 100%, 50%, .05)"' },
      { input: 'IP', expected: '"127.0.0.1"' },
      { input: 'IPv4', expected: '"127.0.0.1"' },
      { input: 'IPv6', expected: '"1080:0:0:0:8:800:200C:417A"' },
      { input: 'ISBN', expected: '"ISBN 978-0615-856"' },
      {
        input: 'JWT',
        expected:
          '"eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwiaWF0IjoxNTE2MjM5MDIyLCJwcm9qZWN0IjoiZ3JhcGhxbC1zY2FsYXJzIn0.nYdrSfE2nNRAgpiEU1uKgn2AYYKLo28Z0nhPXvsuIww"'
      },
      { input: 'Latitude', expected: '41.89193' },
      { input: 'Longitude', expected: '-74.00597' },
      { input: 'MAC', expected: '"01:23:45:67:89:ab"' },
      { input: 'Port', expected: '1337' },
      { input: 'RGB', expected: '"rgb(255, 0, 153)"' },
      { input: 'RGBA', expected: '"rgba(51, 170, 51, .7)"' },
      { input: 'SafeInt', expected: '42' },
      { input: 'USCurrency', expected: '"$22,900.00"' },
      { input: 'Currency', expected: '"USD"' },
      { input: 'JSON', expected: '{foo:{bar:"baz"}}' },
      { input: 'JSONObject', expected: '{foo:{bar:"baz"}}' },
      { input: 'IBAN', expected: '"GE29NB0000000101904917"' },
      { input: 'ObjectID', expected: '"5e5677d71bdc2ae76344968c"' },
      { input: 'DID', expected: '"did:example:123456789abcdefghi"' },
      { input: 'CountryCode', expected: '"US"' },
      { input: 'Locale', expected: '"en-US"' },
      { input: 'RoutingNumber', expected: '"111000025"' },
      { input: 'AccountNumber', expected: '"1234567890ABCDEF1"' },
      { input: 'Cuid', expected: '"cjld2cyuq0000t3rmniod1foy"' },
      { input: 'SemVer', expected: '"1.2.3"' },
      { input: 'DeweyDecimal', expected: '1234.56' },
      { input: 'LCCSubclass', expected: '"KBM"' },
      { input: 'IPCPatent', expected: '"F16K 27/02"' },
      { input: 'Regex', expected: '"^(.*)$"' },
      { input: 'SByte', expected: '"ef"' },
      { input: 'SignedByte', expected: '"ef"' },
      { input: 'Char', expected: '"a"' },
      { input: 'Single', expected: '123.45' },
      { input: 'Half', expected: '123.45' },
      { input: 'Double', expected: '123.45' },
      { input: 'Decimal', expected: '123.45' },
      { input: 'BigDecimal', expected: '123.45' },
      { input: 'Int16', expected: '42' },
      { input: 'Short', expected: '42' },
      { input: 'UInt16', expected: '42' },
      { input: 'UnsignedShort', expected: '42' },
      { input: 'Int32', expected: '42' },
      { input: 'UInt32', expected: '42' },
      { input: 'UnsignedInt', expected: '42' },
      { input: 'Int64', expected: '42' },
      { input: 'Long', expected: '42' },
      { input: 'UInt64', expected: '42' },
      { input: 'UnsignedLong', expected: '42' },
      { input: 'TimeSpan', expected: '"00:00:10"' },
      { input: 'DateTimeOffset', expected: '"2009-06-15T13:45:30.000Z"' },
      { input: 'Uri', expected: '"https://example.com/api/v1"' }
    ])('should sample $input', ({ input, expected }) => {
      // arrange
      const typeRef: IntrospectionInputTypeRef = {
        kind: 'SCALAR',
        name: input
      };

      // act
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      const result = sut.sample(typeRef, {} as unknown as InputSamplerOptions)!;

      // assert
      expect(result).toBe(expected);
      expect(() => graphQLParseValue(result)).not.toThrow();
    });

    it('should return null when type is unknown', () => {
      // arrange
      const typeRef: IntrospectionInputTypeRef = {
        kind: 'SCALAR',
        name: 'SomeUnknownType'
      };

      // act
      const result = sut.sample(typeRef, {} as unknown as InputSamplerOptions);

      // assert
      expect(result).toBe('null');
    });

    it.each([
      { input: 'UnsignedLongLong', expected: '42' },
      { input: 'FuzzyDateInt', expected: '42' },
      { input: 'ValidatedEmailAddress', expected: '"root@example.com"' }
    ])(
      'should return a value when $input is similar to known',
      ({ input, expected }) => {
        // arrange
        const typeRef: IntrospectionInputTypeRef = {
          kind: 'SCALAR',
          name: input
        };

        // act
        const result = sut.sample(
          typeRef,
          {} as unknown as InputSamplerOptions
        );

        // assert
        expect(result).toBe(expected);
      }
    );
  });
});
