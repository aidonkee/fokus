import type { Metadata } from "next";
import { Roboto, Playfair_Display } from "next/font/google";
import "./globals.css";

const roboto = Roboto({ 
  weight: ['100', '300', '400', '500', '700', '900'],
  subsets: ["latin", "cyrillic"],
  variable: '--font-roboto',
});

const playfair = Playfair_Display({ 
  subsets: ["latin", "cyrillic"],
  variable: '--font-playfair',
});

export const metadata: Metadata = {
  title: "wfokus",
  description: "Современные школьные фотокниги в стиле кино, наполненные атмосферой, эмоциями и дружбой вашего класса.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ru">
      <body className={`${roboto.variable} ${playfair.variable} font-sans bg-[#1E1E1E] text-white min-h-screen antialiased selection:bg-[#ffd700] selection:text-black`}>
        {children}
      </body>
    </html>
  );
}
