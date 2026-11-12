import { Archivo_Black, Space_Grotesk, JetBrains_Mono } from "next/font/google";
import { ProgressRuntime } from "@/components/ProgressRuntime";
import { SiteHeader } from "@/components/SiteHeader";
import "./globals.css";

const archivoBlack = Archivo_Black({
  variable: "--font-archivo-black",
  weight: "400",
  subsets: ["latin"],
  display: "swap",
});

const spaceGrotesk = Space_Grotesk({
  variable: "--font-space-grotesk",
  subsets: ["latin"],
  display: "swap",
});

const jetbrainsMono = JetBrains_Mono({
  variable: "--font-jetbrains-mono",
  subsets: ["latin"],
  display: "swap",
});

export const metadata = {
  title: {
    default: "StackPacks — aprende desarrollo abriendo sobres",
    template: "%s · StackPacks",
  },
  description:
    "Coleccionable de cartas para aprender desarrollo: abre sobres cada día, estudia cada tema y haz evolucionar tus cartas.",
};

export const viewport = {
  themeColor: "#FFF6E5",
};

export default function RootLayout({ children }) {
  return (
    <html
      lang="es"
      className={`${archivoBlack.variable} ${spaceGrotesk.variable} ${jetbrainsMono.variable}`}
    >
      <body className="min-h-dvh">
        <ProgressRuntime />
        <SiteHeader />
        {children}
      </body>
    </html>
  );
}
