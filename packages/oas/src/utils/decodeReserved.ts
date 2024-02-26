const specialChars = new Map(
  Array.from(":/?#[]@!$&'()*+,;=").map((c) => [c.charCodeAt(0), c])
);

export const decodeReserved = (val: string) =>
  val.replace(/%[0-9A-Fa-f]{2}/g, (match) => {
    const decodedChar = specialChars.get(parseInt(match.substring(1), 16));

    return decodedChar ? decodedChar : match;
  });
