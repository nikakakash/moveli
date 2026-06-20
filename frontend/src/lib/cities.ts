// Canonical city values are Georgian because the backend free-shipping rule matches the
// stored FreeShippingCity string (Georgian). The `en` label is display-only; the value sent
// at checkout always stays Georgian so the shipping rule keeps matching.
export interface GeorgianCity {
  value: string;
  en: string;
}

export const GEORGIAN_CITIES: GeorgianCity[] = [
  { value: "თბილისი", en: "Tbilisi" },
  { value: "ბათუმი", en: "Batumi" },
  { value: "ქუთაისი", en: "Kutaisi" },
  { value: "რუსთავი", en: "Rustavi" },
  { value: "ზუგდიდი", en: "Zugdidi" },
  { value: "გორი", en: "Gori" },
  { value: "თელავი", en: "Telavi" },
  { value: "ფოთი", en: "Poti" },
];
