import { Generators } from './Generators';

/* istanbul ignore next */
export class ConstantGenerators implements Generators {
  public guid(): string {
    return 'e404c70f-a628-4db6-97ed-a8fe697507c8';
  }

  public timestamp(): number {
    return 1641827921;
  }

  public isoTimestamp(): string {
    return '2022-01-10T15:18:41.293Z';
  }

  public randomInt(): number {
    return 331;
  }

  public randomPhoneNumber(): string {
    return '654-264-5647';
  }

  public randomPhoneNumberExt(): string {
    return '84-325-388-6996';
  }

  public randomLocale(): string {
    return 'sr';
  }

  public randomWords(): string {
    return 'Texas Delaware bypass functionalities infrastructures';
  }

  public randomFilePath(): string {
    return '/lib/grocery_web_enabled.eot';
  }

  public randomDirectoryPath(): string {
    return '/boot';
  }

  public randomCity(): string {
    return 'Lake Jarretthaven';
  }

  public randomStreetName(): string {
    return 'Schumm Streets';
  }

  public randomStreetAddress(): string {
    return '7868 Chanelle Isle';
  }

  public randomCountry(): string {
    return 'Montenegro';
  }

  public randomCountryCode(): string {
    return 'MF';
  }

  public randomLatitude(): string {
    return '-84.6782';
  }

  public randomLongitude(): string {
    return '-7.3219';
  }

  public randomColor(): string {
    return 'sky blue';
  }

  public randomDepartment(): string {
    return 'Home';
  }

  public randomProductName(): string {
    return 'Handmade Cotton Keyboard';
  }

  public randomProductAdjective(): string {
    return 'Intelligent';
  }

  public randomProductMaterial(): string {
    return 'Fresh';
  }

  public randomProduct(): string {
    return 'Sausages';
  }

  public randomCompanyName(): string {
    return 'Casper, Witting and Gleichner';
  }

  public randomCompanySuffix(): string {
    return 'Inc';
  }

  public randomCatchPhrase(): string {
    return 'Adaptive 4th generation system engine';
  }

  public randomBs(): string {
    return 'matrix e-business content';
  }

  public randomCatchPhraseAdjective(): string {
    return 'Automated';
  }

  public randomCatchPhraseDescriptor(): string {
    return 'upward-trending';
  }

  public randomCatchPhraseNoun(): string {
    return 'implementation';
  }

  public randomBsAdjective(): string {
    return 'extensible';
  }

  public randomBsBuzz(): string {
    return 'enable';
  }

  public randomBsNoun(): string {
    return 'schemas';
  }

  public randomDatabaseColumn(): string {
    return 'id';
  }

  public randomDatabaseType(): string {
    return 'tinyint';
  }

  public randomDatabaseCollation(): string {
    return 'cp1250_general_ci';
  }

  public randomDatabaseEngine(): string {
    return 'ARCHIVE';
  }

  public randomDatePast(): Date {
    return new Date('2010-12-01T10:25:27.849Z');
  }

  public randomDateFuture(): Date {
    return new Date('2035-03-25T10:25:27.849Z');
  }

  public randomDateRecent(): Date {
    return new Date('2022-01-10T15:25:27.849Z');
  }

  public randomMonth(): string {
    return 'February';
  }

  public randomWeekday(): string {
    return 'Friday';
  }

  public randomBankAccount(): string {
    return '73921444';
  }

  public randomBankAccountName(): string {
    return 'Personal Loan Account';
  }

  public randomCreditCardMask(): string {
    return '4252';
  }

  public randomPrice(): string {
    return '981.17';
  }

  public randomTransactionType(): string {
    return 'invoice';
  }

  public randomCurrencyCode(): string {
    return 'NOK';
  }

  public randomCurrencyName(): string {
    return 'Russian Ruble';
  }

  public randomCurrencySymbol(): string {
    return '$';
  }

  public randomBitcoin(): string {
    return '3ECQUh4wx2ctjA1EDQd5261YCkEhLcV42';
  }

  public randomBankAccountIban(): string {
    return 'NL21APDG0531400857';
  }

  public randomBankAccountBic(): string {
    return 'KSBICON1';
  }

  public randomAbbreviation(): string {
    return 'COM';
  }

  public randomAdjective(): string {
    return 'solid state';
  }

  public randomNoun(): string {
    return 'sensor';
  }

  public randomVerb(): string {
    return 'back up';
  }

  public randomIngverb(): string {
    return 'hacking';
  }

  public randomPhrase(): string {
    return 'Use the digital USB transmitter, then you can calculate the cross-platform transmitter!';
  }

  public randomAvatarImage(): string {
    return 'https://cdn.fakercloud.com/avatars/andresenfredrik_128.jpg';
  }

  public randomImageUrl(): string {
    return 'http://placeimg.com/640/480';
  }

  public randomAbstractImage(): string {
    return 'http://placeimg.com/640/480/abstract';
  }

  public randomAnimalsImage(): string {
    return 'http://placeimg.com/640/480/animals';
  }

  public randomBusinessImage(): string {
    return 'http://placeimg.com/640/480/business';
  }

  public randomCatsImage(): string {
    return 'http://placeimg.com/640/480/cats';
  }

  public randomCityImage(): string {
    return 'http://placeimg.com/640/480/city';
  }

  public randomFoodImage(): string {
    return 'http://placeimg.com/640/480/food';
  }

  public randomNightlifeImage(): string {
    return 'http://placeimg.com/640/480/nightlife';
  }

  public randomFashionImage(): string {
    return 'http://placeimg.com/640/480/fashion';
  }

  public randomPeopleImage(): string {
    return 'http://placeimg.com/640/480/people';
  }

  public randomNatureImage(): string {
    return 'http://placeimg.com/640/480/nature';
  }

  public randomSportsImage(): string {
    return 'http://placeimg.com/640/480/sports';
  }

  public randomTransportImage(): string {
    return 'http://placeimg.com/640/480/transport';
  }

  public randomImageDataUri(): string {
    return 'data:image/svg+xml;charset=UTF-8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20version%3D%221.1%22%20baseProfile%3D%22full%22%20width%3D%22undefined%22%20height%3D%22undefined%22%3E%3Crect%20width%3D%22100%25%22%20height%3D%22100%25%22%20fill%3D%22grey%22%2F%3E%3Ctext%20x%3D%22NaN%22%20y%3D%22NaN%22%20font-size%3D%2220%22%20alignment-baseline%3D%22middle%22%20text-anchor%3D%22middle%22%20fill%3D%22white%22%3Eundefinedxundefined%3C%2Ftext%3E%3C%2Fsvg%3E';
  }

  public randomEmail(): string {
    return 'Felicita.Carter@yahoo.com';
  }

  public randomExampleEmail(): string {
    return 'Lue_Heaney@example.org';
  }

  public randomUserName(): string {
    return 'Erik_Doyle';
  }

  public randomProtocol(): string {
    return 'http';
  }

  public randomUrl(): string {
    return 'http://fabian.org';
  }

  public randomDomainName(): string {
    return 'maddison.info';
  }

  public randomDomainSuffix(): string {
    return 'name';
  }

  public randomDomainWord(): string {
    return 'ramona';
  }

  public randomIP(): string {
    return '66.84.180.68';
  }

  public randomIPV6(): string {
    return '5d9a:368d:1201:2d43:2aac:515d:29e8:625e';
  }

  public randomUserAgent(): string {
    return 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_10_2 rv:5.0; ZH) AppleWebKit/534.0.1 (KHTML, like Gecko) Version/5.1.6 Safari/534.0.1';
  }

  public randomHexColor(): string {
    return '#1c5541';
  }

  public randomMACAddress(): string {
    return 'ba:4e:de:3a:45:f0';
  }

  public randomPassword(): string {
    return 'ZM4aWX5ESu79_MK';
  }

  public randomLoremWord(): string {
    return 'rerum';
  }

  public randomLoremWords(): string {
    return 'quas et sed';
  }

  public randomLoremSentence(): string {
    return 'Et sequi dolor molestias velit quis reprehenderit debitis quaerat ducimus.';
  }

  public randomLoremSlug(): string {
    return 'ducimus-laborum-unde';
  }

  public randomLoremSentences(): string {
    return 'Dolorum maxime eum laborum iusto similique molestias eveniet. Adipisci commodi et quod error veniam reiciendis sequi. Vero vero sed qui. Temporibus officiis excepturi dolorum qui quae saepe odio voluptatem veniam.';
  }

  public randomLoremParagraph(): string {
    return 'Voluptate dolorem quis sed qui architecto velit cupiditate. Repudiandae deleniti sunt placeat vero illo possimus. Exercitationem aut debitis. Accusantium fuga tenetur nisi est. Nobis molestiae a numquam temporibus sunt quis neque quo.';
  }

  public randomLoremParagraphs(): string {
    return `Necessitatibus cumque placeat aut tenetur velit. Recusandae eius aperiam voluptas autem sunt. Voluptatem ex tempore perferendis reprehenderit laborum fuga quo. Aut perspiciatis perferendis facere dolore temporibus. Qui tempora architecto amet.
Eos voluptas voluptas ipsam dolor in officia aut maxime. Quos officiis placeat commodi voluptatem eos. Architecto perspiciatis aperiam consequatur enim.
Ut dicta alias reprehenderit nobis dolore nihil et. Quas sed neque. Aliquam dolores odio. Eius ad quos occaecati.`;
  }

  public randomLoremText(): string {
    return 'Aut fugit a.';
  }

  public randomLoremLines(): string {
    return `Sit alias dicta delectus excepturi nemo id.
Dolor quidem aut explicabo deserunt iste et.
Inventore reprehenderit eum.
Aut voluptates omnis voluptas tempora et qui modi beatae.
Qui non animi iusto sed doloremque quis labore sed.`;
  }

  public randomFirstName(): string {
    return 'Christop';
  }

  public randomLastName(): string {
    return 'Hills';
  }

  public randomFullName(): string {
    return 'Sheri Sauer';
  }

  public randomJobTitle(): string {
    return 'District Program Liaison';
  }

  public randomNamePrefix(): string {
    return 'Mrs.';
  }

  public randomNameSuffix(): string {
    return 'III';
  }

  public randomJobDescriptor(): string {
    return 'Dynamic';
  }

  public randomJobArea(): string {
    return 'Data';
  }

  public randomJobType(): string {
    return 'Agent';
  }

  public randomUUID(): string {
    return '4eca517a-10bf-403e-a8fc-b7dca5440629';
  }

  public randomBoolean(): boolean {
    return true;
  }

  public randomWord(): string {
    return 'District';
  }

  public randomAlphaNumeric(): string {
    return 'd';
  }

  public randomFileName(): string {
    return 'handmade_indexing_florida.mscml';
  }

  public randomCommonFileName(): string {
    return 'capability.jpg';
  }

  public randomMimeType(): string {
    return 'application/mpeg4-generic';
  }

  public randomCommonFileType(): string {
    return 'audio';
  }

  public randomCommonFileExt(): string {
    return 'mpe';
  }

  public randomFileType(): string {
    return 'x-shader';
  }

  public randomFileExt(): string {
    return 'b';
  }

  public randomSemver(): string {
    return '3.2.1';
  }
}
