import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";

// FiraGO — Mozilla's neo-humanist sans extended with native Mkhedruli + Mtavruli
// by Akaki Razmadze. Single family, harmonized metrics across Latin and Georgian,
// so the bilingual marketplace reads as one typographic voice rather than two
// mismatched fallbacks (the previous Inter + Noto-Sans-Georgian pair).
// Subsetted (Latin + Latin-Ext + Cyrillic + Georgian + Mtavruli + currency/lari)
// down to ~82 KB per weight via pyftsubset.
const firaGo = localFont({
  variable: "--font-sans",
  display: "swap",
  // Per next/font/local docs: the first src whose unicode-range matches is used.
  // We list four weights from light-medium to bold to cover headlines + body + numerics.
  src: [
    {
      path: "../../public/fonts/firago/FiraGO-Book.woff2",
      weight: "400",
      style: "normal",
    },
    {
      path: "../../public/fonts/firago/FiraGO-Medium.woff2",
      weight: "500",
      style: "normal",
    },
    {
      path: "../../public/fonts/firago/FiraGO-SemiBold.woff2",
      weight: "600",
      style: "normal",
    },
    {
      path: "../../public/fonts/firago/FiraGO-Bold.woff2",
      weight: "700",
      style: "normal",
    },
  ],
});

export const metadata: Metadata = {
  title: "MOVELI — საქართველოს ონლაინ მარკეტპლეისი",
  description:
    "საუკეთესო პროდუქტები საუკეთესო ფასებად. უფასო მიწოდება ₾80-დან.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      className={`${firaGo.variable} h-full antialiased`}
      suppressHydrationWarning
    >
      <body className="min-h-full flex flex-col font-sans">{children}</body>
    </html>
  );
}
