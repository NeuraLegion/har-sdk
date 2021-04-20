import { directories, locales } from '../helpers';
import { Generators } from './Generators';
import faker from 'faker';

export class DefaultGenerators implements Generators {
  private readonly LOCALES: ReadonlyArray<string> = locales;
  private readonly DIRECTORY_PATHS: ReadonlyArray<string> = directories;

  public guid(): string {
    return faker.random.uuid();
  }

  // The current timestamp
  public timestamp(): number {
    return Math.round(Date.now() / 1000);
  }

  // The current ISO timestamp at zero UTC
  public isoTimestamp(): string {
    return new Date().toISOString();
  }

  // A random integer between 1 and 1000
  public randomInt(): number {
    // eslint-disable-next-line no-bitwise
    return ~~(Math.random() * (1000 + 1));
  }

  // faker.phone.phoneNumber returns phone number with or without
  // extension randomly. this only returns a phone number without extension.
  // A random 10-digit phone number
  public randomPhoneNumber(): string {
    return faker.phone.phoneNumberFormat(0);
  }

  // faker.phone.phoneNumber returns phone number with or without
  // extension randomly. this only returns a phone number with extension.
  // A random phone number with extension (12 digits)
  public randomPhoneNumberExt(): string {
    return `${faker.random.number({
      min: 1,
      max: 99
    })}-${faker.phone.phoneNumberFormat(0)}`;
  }

  // faker's random.locale only returns 'en'. this returns from a list of
  // random locales
  // A random two-letter language code (ISO 639-1)
  public randomLocale(): string {
    return faker.random.arrayElement(this.LOCALES);
  }

  // fakers' random.words returns random number of words between 1, 3.
  // this returns number of words between 2, 5.
  // Some random words
  public randomWords(): string {
    const words = [];

    for (
      let i = 0, count = faker.random.number({ min: 2, max: 5 });
      i < count;
      i++
    ) {
      words.push(faker.random.word());
    }

    return words.join(' ');
  }

  // faker's system.filePath retuns nothing. this returns a path for a file.
  // A random file path
  public randomFilePath(): string {
    return this.randomDirectoryPath() + '/' + faker.system.fileName();
  }

  // faker's system.directoryPath retuns nothing. this returns a path for
  // a directory.
  // A random directory path
  public randomDirectoryPath(): string {
    return faker.random.arrayElement(this.DIRECTORY_PATHS);
  }

  // A random city name
  public randomCity(): string {
    return faker.address.city();
  }

  // A random street name
  public randomStreetName(): string {
    return faker.address.streetName();
  }

  // A random street address (e.g. 1234 Main Street)
  public randomStreetAddress(): string {
    return faker.address.streetAddress();
  }

  // A random country
  public randomCountry(): string {
    return faker.address.country();
  }

  // A random 2-letter country code (ISO 3166-1 alpha-2)
  public randomCountryCode(): string {
    return faker.address.countryCode();
  }

  // A random latitude coordinate
  public randomLatitude(): string {
    return faker.address.latitude();
  }

  // A random longitude coordinate
  public randomLongitude(): string {
    return faker.address.longitude();
  }

  // A random color
  public randomColor(): string {
    return faker.commerce.color();
  }

  // A random commerce category (e.g. electronics, clothing)
  public randomDepartment(): string {
    return faker.commerce.department();
  }

  // A random product name (e.g. handmade concrete tuna)
  public randomProductName(): string {
    return faker.commerce.productName();
  }

  // A random product adjective (e.g. tasty, eco-friendly)
  public randomProductAdjective(): string {
    return faker.commerce.productAdjective();
  }

  // A random product material (e.g. steel, plastic, leather)
  public randomProductMaterial(): string {
    return faker.commerce.productMaterial();
  }

  // A random product (e.g. shoes, table, chair)
  public randomProduct(): string {
    return faker.commerce.product();
  }

  // A random company name
  public randomCompanyName(): string {
    return faker.company.companyName();
  }

  // A random company suffix (e.g. Inc, LLC, Group)
  public randomCompanySuffix(): string {
    return faker.company.companySuffix();
  }

  // A random catchphrase
  public randomCatchPhrase(): string {
    return faker.company.catchPhrase();
  }

  // A random phrase of business speak
  public randomBs(): string {
    return faker.company.bs();
  }

  // A random catchphrase adjective
  public randomCatchPhraseAdjective(): string {
    return faker.company.catchPhraseAdjective();
  }

  // A random catchphrase descriptor
  public randomCatchPhraseDescriptor(): string {
    return faker.company.catchPhraseDescriptor();
  }

  // Randomly generates a catchphrase noun
  public randomCatchPhraseNoun(): string {
    return faker.company.catchPhraseNoun();
  }

  // A random business speak adjective
  public randomBsAdjective(): string {
    return faker.company.bsAdjective();
  }

  // A random business speak buzzword
  public randomBsBuzz(): string {
    return faker.company.bsBuzz();
  }

  // A random business speak noun
  public randomBsNoun(): string {
    return faker.company.bsNoun();
  }

  // A random database column name (e.g. updatedAt, token, group)
  public randomDatabaseColumn(): string {
    return faker.database.column();
  }

  // A random database type (e.g. tiny int, double, point)
  public randomDatabaseType(): string {
    return faker.database.type();
  }

  // A random database collation (e.g. cp1250_bin)
  public randomDatabaseCollation(): string {
    return faker.database.collation();
  }

  // A random database engine (e.g. Memory, Archive, InnoDB)
  public randomDatabaseEngine(): string {
    return faker.database.engine();
  }

  // A random past datetime
  public randomDatePast(): Date {
    return faker.date.past();
  }

  // A random future datetime
  public randomDateFuture(): Date {
    return faker.date.future();
  }

  // A random recent datetime
  public randomDateRecent(): Date {
    return faker.date.recent();
  }

  // A random month
  public randomMonth(): string {
    return faker.date.month();
  }

  // A random weekday
  public randomWeekday(): string {
    return faker.date.weekday();
  }

  // A random 8-digit bank account number
  public randomBankAccount(): string {
    return faker.finance.account();
  }

  // A random bank account name (e.g. savings account, checking account)
  public randomBankAccountName(): string {
    return faker.finance.accountName();
  }

  // A random masked credit card number
  public randomCreditCardMask(): string {
    return faker.finance.mask();
  }

  // A random price between 100.00 and 999.00
  public randomPrice(): string {
    return faker.finance.amount();
  }

  // A random transaction type (e.g. invoice, payment, deposit)
  public randomTransactionType(): string {
    return faker.finance.transactionType();
  }

  // A random 3-letter currency code (ISO-4217)
  public randomCurrencyCode(): string {
    return faker.finance.currencyCode();
  }

  // A random currency name
  public randomCurrencyName(): string {
    return faker.finance.currencyName();
  }

  // A random currency symbol
  public randomCurrencySymbol(): string {
    return faker.finance.currencySymbol();
  }

  // A random bitcoin address
  public randomBitcoin(): string {
    return faker.finance.bitcoinAddress();
  }

  // A random 15-31 character IBAN (International Bank Account Number)
  public randomBankAccountIban(): string {
    return faker.finance.iban();
  }

  // A random BIC (Bank Identifier Code)
  public randomBankAccountBic(): string {
    return faker.finance.bic();
  }

  // A random abbreviation
  public randomAbbreviation(): string {
    return faker.hacker.abbreviation();
  }

  // A random adjective
  public randomAdjective(): string {
    return faker.hacker.adjective();
  }

  // A random noun
  public randomNoun(): string {
    return faker.hacker.noun();
  }

  // A random verb
  public randomVerb(): string {
    return faker.hacker.verb();
  }

  // A random verb ending in “-ing”
  public randomIngverb(): string {
    return faker.hacker.ingverb();
  }

  // A random phrase
  public randomPhrase(): string {
    return faker.hacker.phrase();
  }

  // A random avatar image
  public randomAvatarImage(): string {
    return faker.image.avatar();
  }

  // A URL for a random image
  public randomImageUrl(): string {
    return faker.image.imageUrl();
  }

  // A URL for a random abstract image
  public randomAbstractImage(): string {
    return faker.image.abstract();
  }

  // A URL for a random animal image
  public randomAnimalsImage(): string {
    return faker.image.animals();
  }

  // A URL for a random stock business image
  public randomBusinessImage(): string {
    return faker.image.business();
  }

  // A URL for a random cat image
  public randomCatsImage(): string {
    return faker.image.cats();
  }

  // A URL for a random city image
  public randomCityImage(): string {
    return faker.image.city();
  }

  // A URL for a random food image
  public randomFoodImage(): string {
    return faker.image.food();
  }

  // A URL for a random nightlife image
  public randomNightlifeImage(): string {
    return faker.image.nightlife();
  }

  // A URL for a random fashion image
  public randomFashionImage(): string {
    return faker.image.fashion();
  }

  // A URL for a random image of a person
  public randomPeopleImage(): string {
    return faker.image.people();
  }

  // A URL for a random nature image
  public randomNatureImage(): string {
    return faker.image.nature();
  }

  // A URL for a random sports image
  public randomSportsImage(): string {
    return faker.image.sports();
  }

  // A URL for a random transportation image
  public randomTransportImage(): string {
    return faker.image.transport();
  }

  // A random image data URI
  public randomImageDataUri(): string {
    return faker.image.dataUri();
  }

  // A random email address
  public randomEmail(): string {
    return faker.internet.email();
  }

  // A random email address from an “example” domain (e.g. ben@example.com)
  public randomExampleEmail(): string {
    return faker.internet.exampleEmail();
  }

  // A random username
  public randomUserName(): string {
    return faker.internet.userName();
  }

  // A random internet protocol
  public randomProtocol(): string {
    return faker.internet.protocol();
  }

  // A random URL
  public randomUrl(): string {
    return faker.internet.url();
  }

  // A random domain name (e.g. gracie.biz, trevor.info)
  public randomDomainName(): string {
    return faker.internet.domainName();
  }

  // A random domain suffix (e.g. .com, .net, .org)
  public randomDomainSuffix(): string {
    return faker.internet.domainSuffix();
  }

  // A random unqualified domain name (a name with no dots)
  public randomDomainWord(): string {
    return faker.internet.domainWord();
  }

  // A random IPv4 address
  public randomIP(): string {
    return faker.internet.ip();
  }

  // A random IPv6 address
  public randomIPV6(): string {
    return faker.internet.ipv6();
  }

  // A random user agent
  public randomUserAgent(): string {
    return faker.internet.userAgent();
  }

  // A random hex value
  public randomHexColor(): string {
    return faker.internet.color();
  }

  // A random MAC address
  public randomMACAddress(): string {
    return faker.internet.mac();
  }

  // A random 15-character alpha-numeric password
  public randomPassword(): string {
    return faker.internet.password();
  }

  // A random word of lorem ipsum text
  public randomLoremWord(): string {
    return faker.lorem.word();
  }

  // Some random words of lorem ipsum text
  public randomLoremWords(): string {
    return faker.lorem.words();
  }

  // A random sentence of lorem ipsum text
  public randomLoremSentence(): string {
    return faker.lorem.sentence();
  }

  // A random lorem ipsum URL slug
  public randomLoremSlug(): string {
    return faker.lorem.slug();
  }

  // A random 2-6 sentences of lorem ipsum text
  public randomLoremSentences(): string {
    return faker.lorem.sentences();
  }

  // A random paragraph of lorem ipsum text
  public randomLoremParagraph(): string {
    return faker.lorem.paragraph();
  }

  // 3 random paragraphs of lorem ipsum text
  public randomLoremParagraphs(): string {
    return faker.lorem.paragraphs();
  }

  // A random amount of lorem ipsum text
  public randomLoremText(): string {
    return faker.lorem.text();
  }

  // 1-5 random lines of lorem ipsum
  public randomLoremLines(): string {
    return faker.lorem.lines();
  }

  // A random first name
  public randomFirstName(): string {
    return faker.name.firstName();
  }

  // A random last name
  public randomLastName(): string {
    return faker.name.lastName();
  }

  // A random first and last name
  public randomFullName(): string {
    return faker.name.findName();
  }

  // A random job title (e.g. senior software developer)
  public randomJobTitle(): string {
    return faker.name.jobTitle();
  }

  // A random name prefix (e.g. Mr., Mrs., Dr.)
  public randomNamePrefix(): string {
    return faker.name.prefix();
  }

  // A random name suffix (e.g. Jr., MD, PhD)
  public randomNameSuffix(): string {
    return faker.name.suffix();
  }

  // A random job descriptor (e.g., senior, chief, corporate, etc.)
  public randomJobDescriptor(): string {
    return faker.name.jobDescriptor();
  }

  // A random job area (e.g. branding, functionality, usability)
  public randomJobArea(): string {
    return faker.name.jobArea();
  }

  // A random job type (e.g. supervisor, manager, coordinator, etc.)
  public randomJobType(): string {
    return faker.name.jobType();
  }

  // A random 36-character UUID
  public randomUUID(): string {
    return faker.random.uuid();
  }

  // A random boolean value (true/false)
  public randomBoolean(): boolean {
    return faker.random.boolean();
  }

  // A random word
  public randomWord(): string {
    return faker.random.word();
  }

  // A random alpha-numeric character
  public randomAlphaNumeric(): string {
    return faker.random.alphaNumeric();
  }

  // A random file name (includes uncommon extensions)
  public randomFileName(): string {
    return faker.system.fileName();
  }

  // A random file name
  public randomCommonFileName(): string {
    return faker.system.commonFileName(faker.system.commonFileExt());
  }

  // A random MIME type
  public randomMimeType(): string {
    return faker.system.mimeType();
  }

  // A random, common file type (e.g., video, text, image, etc.)
  public randomCommonFileType(): string {
    return faker.system.commonFileType();
  }

  // A random, common file extension (.doc, .jpg, etc.)
  public randomCommonFileExt(): string {
    return faker.system.commonFileExt();
  }

  // A random file type (includes uncommon file types)
  public randomFileType(): string {
    return faker.system.fileType();
  }

  // A random file extension (includes uncommon extensions)
  public randomFileExt(): string {
    return faker.system.fileExt(faker.system.mimeType());
  }

  // A random semantic version number
  public randomSemver(): string {
    return faker.system.semver();
  }
}
