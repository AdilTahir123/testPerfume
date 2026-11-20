// The invisible marks around the price keep "Rs. 4,500" reading left to right inside Urdu sentences.
export const formatPrice = (pkr: number) =>
  "\u2066Rs. " + pkr.toLocaleString("en-PK") + "\u2069";
