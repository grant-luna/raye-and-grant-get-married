import "bootstrap/dist/css/bootstrap.min.css";
import localFont from "next/font/local";
import "./globals.css";

/* BODY — Cormorant Garamond */
const bodyFont = localFont({
  src: [
    { path: "../public/fonts/CormorantGaramond-Light.ttf", weight: "300", style: "normal" },
    { path: "../public/fonts/CormorantGaramond-Regular.ttf", weight: "400", style: "normal" },
    { path: "../public/fonts/CormorantGaramond-Medium.ttf", weight: "500", style: "normal" },
    { path: "../public/fonts/CormorantGaramond-SemiBold.ttf", weight: "600", style: "normal" },
    { path: "../public/fonts/CormorantGaramond-Bold.ttf", weight: "700", style: "normal" },
    { path: "../public/fonts/CormorantGaramond-LightItalic.ttf", weight: "300", style: "italic" },
    { path: "../public/fonts/CormorantGaramond-Italic.ttf", weight: "400", style: "italic" },
    { path: "../public/fonts/CormorantGaramond-MediumItalic.ttf", weight: "500", style: "italic" },
    { path: "../public/fonts/CormorantGaramond-SemiBoldItalic.ttf", weight: "600", style: "italic" },
    { path: "../public/fonts/CormorantGaramond-BoldItalic.ttf", weight: "700", style: "italic" },
  ],
  variable: "--font-body",
  display: "swap",
});

/* SUBHEADERS — Cormorant SC */
const subheaderFont = localFont({
  src: [
    { path: "../public/fonts/CormorantSC-Light.ttf", weight: "300", style: "normal" },
    { path: "../public/fonts/CormorantSC-Regular.ttf", weight: "400", style: "normal" },
    { path: "../public/fonts/CormorantSC-Medium.ttf", weight: "500", style: "normal" },
    { path: "../public/fonts/CormorantSC-SemiBold.ttf", weight: "600", style: "normal" },
    { path: "../public/fonts/CormorantSC-Bold.ttf", weight: "700", style: "normal" },
  ],
  variable: "--font-subheader",
  display: "swap",
});

/* HEADERS — MADE TheArtist Script */
const headerFont = localFont({
  src: "../public/fonts/MADE-TheArtist-Script.otf",
  variable: "--font-header",
  display: "swap",
});

export default function RootLayout({ children }) {
  return (
    <html
      lang="en"
      className={`${bodyFont.variable} ${subheaderFont.variable} ${headerFont.variable}`}
    >
      <body>{children}</body>
    </html>
  );
}
