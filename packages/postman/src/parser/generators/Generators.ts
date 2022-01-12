export interface Generators {
  guid(): string;

  timestamp(): number;

  isoTimestamp(): string;

  randomInt(): number;

  randomPhoneNumber(): string;

  randomPhoneNumberExt(): string;

  randomLocale(): string;

  randomWords(): string;

  randomFilePath(): string;

  randomDirectoryPath(): string;

  randomCity(): string;

  randomStreetName(): string;

  randomStreetAddress(): string;

  randomCountry(): string;

  randomCountryCode(): string;

  randomLatitude(): string;

  randomLongitude(): string;

  randomColor(): string;

  randomDepartment(): string;

  randomProductName(): string;

  randomProductAdjective(): string;

  randomProductMaterial(): string;

  randomProduct(): string;

  randomCompanyName(): string;

  randomCompanySuffix(): string;

  randomCatchPhrase(): string;

  randomBs(): string;

  randomCatchPhraseAdjective(): string;

  randomCatchPhraseDescriptor(): string;

  randomCatchPhraseNoun(): string;

  randomBsAdjective(): string;

  randomBsBuzz(): string;

  randomBsNoun(): string;

  randomDatabaseColumn(): string;

  randomDatabaseType(): string;

  randomDatabaseCollation(): string;

  randomDatabaseEngine(): string;

  randomDatePast(): Date;

  randomDateFuture(): Date;

  randomDateRecent(): Date;

  randomMonth(): string;

  randomWeekday(): string;

  randomBankAccount(): string;

  randomBankAccountName(): string;

  randomCreditCardMask(): string;

  randomPrice(): string;

  randomTransactionType(): string;

  randomCurrencyCode(): string;

  randomCurrencyName(): string;

  randomCurrencySymbol(): string;

  randomBitcoin(): string;

  randomBankAccountIban(): string;

  randomBankAccountBic(): string;

  randomAbbreviation(): string;

  randomAdjective(): string;

  randomNoun(): string;

  randomVerb(): string;

  randomIngverb(): string;

  randomPhrase(): string;

  randomAvatarImage(): string;

  randomImageUrl(): string;

  randomAbstractImage(): string;

  randomAnimalsImage(): string;

  randomBusinessImage(): string;

  randomCatsImage(): string;

  randomCityImage(): string;

  randomFoodImage(): string;

  randomNightlifeImage(): string;

  randomFashionImage(): string;

  randomPeopleImage(): string;

  randomNatureImage(): string;

  randomSportsImage(): string;

  randomTransportImage(): string;

  randomImageDataUri(): string;

  randomEmail(): string;

  randomExampleEmail(): string;

  randomUserName(): string;

  randomProtocol(): string;

  randomUrl(): string;

  randomDomainName(): string;

  randomDomainSuffix(): string;

  randomDomainWord(): string;

  randomIP(): string;

  randomIPV6(): string;

  randomUserAgent(): string;

  randomHexColor(): string;

  randomMACAddress(): string;

  randomPassword(): string;

  randomLoremWord(): string;

  randomLoremWords(): string;

  randomLoremSentence(): string;

  randomLoremSlug(): string;

  randomLoremSentences(): string;

  randomLoremParagraph(): string;

  randomLoremParagraphs(): string;

  randomLoremText(): string;

  randomLoremLines(): string;

  randomFirstName(): string;

  randomLastName(): string;

  randomFullName(): string;

  randomJobTitle(): string;

  randomNamePrefix(): string;

  randomNameSuffix(): string;

  randomJobDescriptor(): string;

  randomJobArea(): string;

  randomJobType(): string;

  randomUUID(): string;

  randomBoolean(): boolean;

  randomWord(): string;

  randomAlphaNumeric(): string;

  randomFileName(): string;

  randomCommonFileName(): string;

  randomMimeType(): string;

  randomCommonFileType(): string;

  randomCommonFileExt(): string;

  randomFileType(): string;

  randomFileExt(): string;

  randomSemver(): string;
}
