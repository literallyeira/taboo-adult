import type { Metadata } from "next";
import { Inter } from "next/font/google";
import Script from "next/script";
import "./globals.css";
import { Providers } from "./providers";

const inter = Inter({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  display: 'swap',
  variable: '--font-inter',
});

export const metadata: Metadata = {
  title: "MatchUp - Kapandı",
  description: "MatchUp servisini kapattık. Sorularınız için Discord üzerinden louchesaints'e ulaşabilirsiniz.",
  icons: {
    icon: "/favicon.png",
    shortcut: "/favicon.png",
    apple: "/favicon.png",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="tr" className={inter.variable}>
      <head>
        <link rel="preconnect" href="https://cdnjs.cloudflare.com" crossOrigin="anonymous" />
      </head>
      <body className={`${inter.className} antialiased min-h-screen flex flex-col`}>
        <Script id="font-awesome-loader" strategy="afterInteractive">{`
          var l = document.createElement('link');
          l.rel = 'stylesheet';
          l.href = 'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.1/css/all.min.css';
          document.head.appendChild(l);
        `}</Script>

        <Providers>
        <div className="flex-1 w-full">
          {children}
        </div>

        <footer className="w-full py-6 px-6 border-t border-white/5 bg-[#0a0a0a]/80">
          <div className="max-w-7xl mx-auto flex flex-col items-center gap-4 text-xs">
            <a
              href="https://forum-tr.gta.world"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:opacity-80 transition-opacity"
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="https://forum-tr.gta.world/uploads/monthly_2025_02/logo.png.3fe10156c1213bdb8f59cd9bc9e15781.png"
                alt="GTA World TR"
                className="h-6 w-auto opacity-70"
                loading="lazy"
              />
            </a>
            <div className="text-gray-600 text-[10px] text-center space-y-1">
              <p>(( MatchUp resmi bir GTAW web sitesi değildir, üçüncü parti bir yazılımdır. ))</p>
              <p>© 2026 MatchUp</p>
            </div>
          </div>
        </footer>
        </Providers>
      </body>
    </html>
  );
}
