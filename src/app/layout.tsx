import type { Metadata } from "next";
import { Inter, Playfair_Display } from "next/font/google";
import "./globals.css";
import { CartProvider } from "@/components/CartProvider";
import Header from "@/components/Header";
import AgeGate from "@/components/AgeGate";

const inter = Inter({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  display: 'swap',
  variable: '--font-inter',
});

const playfair = Playfair_Display({
  subsets: ['latin'],
  weight: ['400', '600', '700'],
  display: 'swap',
  variable: '--font-serif',
});

export const metadata: Metadata = {
  title: "Taboo Adult Store",
    description: "PREMIUM yetişkin ürünleri.",
  icons: {
    icon: "/tabo.png",
    shortcut: "/tabo.png",
    apple: "/tabo.png",
  },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="tr" className={`${inter.variable} ${playfair.variable}`}>
      <head>
        <link
          rel="stylesheet"
          href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.1/css/all.min.css"
          integrity="sha512-DTOQO9RWCH3ppGqcWaEA1BIZOC6xxalwEsw9c2QQeAIftl+Vegovlnee1c9QX4TctnWMn13TZye+giMm8e2LwA=="
          crossOrigin="anonymous"
          referrerPolicy="no-referrer"
        />
      </head>
      <body className={`${inter.className} antialiased min-h-screen flex flex-col`}>
        <AgeGate>
          <CartProvider>
            <Header />
            <main className="flex-1 w-full relative z-[1]">{children}</main>
          {/* Footer */}
          <footer className="w-full py-10 px-6 border-t border-[var(--taboo-border)] bg-[var(--taboo-bg)] relative z-[1]">
            <div className="max-w-6xl mx-auto">
              {/* Legal disclaimer */}
              <div className="mb-8 p-5 rounded-xl bg-purple-950/20 border border-purple-500/10">
                <div className="flex items-start gap-3">
                  <i className="fa-solid fa-shield-halved text-lg text-[var(--taboo-accent)] mt-0.5" />
                  <div>
                    <h4 className="font-semibold text-sm text-[var(--taboo-accent)] mb-2">Yasal Bilgilendirme</h4>
                    <p className="text-xs text-[var(--taboo-text-muted)] leading-relaxed">
                      Taboo Adult Store, Los Santos City tarafından lisanslanmış ve onaylanmış bir yetişkin ürünleri satış noktasıdır.
                      Mağazamızda satılan tüm ürünler <span className="text-[var(--taboo-text)] font-medium">tamamen yasal</span> olup,
                      ilgili mevzuata uygun şekilde temin edilmektedir. Ürünlerimiz kalite ve güvenlik standartlarına uygundur.
                      Alışverişlerinizi güvenle yapabilirsiniz.
                    </p>
                    <p className="text-[10px] text-[var(--taboo-text-muted)] mt-2 opacity-70">
                      City İşletme Lisansı #LS-2024-TABOO | Tüm hakları saklıdır.
                    </p>
                  </div>
                </div>
              </div>

              <div className="flex flex-col md:flex-row items-center justify-between gap-4 text-xs text-[var(--taboo-text-muted)]">
                <div className="flex flex-col md:flex-row items-center gap-4">
                  <span className="text-[var(--taboo-accent)] font-semibold">TABOO</span>
                  <span><i className="fa-solid fa-location-dot mr-1" /> Palomino Ave, Vespucci Blvd. Little Seoul, Los Santos, San Andreas</span>
                  <div className="flex items-center gap-3">
                    <span><i className="fa-solid fa-phone mr-1" /> 651 24 860</span>
                    <span>527 06 458</span>
                    <span>936 78 42</span>
                  </div>
                </div>
                <p>&copy; 2026 Taboo Adult Store - Lisanslı İşletme</p>
              </div>
              <p className="text-center text-[10px] text-[var(--taboo-text-muted)] mt-4 opacity-50">
                (( Bu resmi bir GTA World websitesi değildir. Üçüncü parti yazılım. ))
              </p>
            </div>
          </footer>
          </CartProvider>
        </AgeGate>
      </body>
    </html>
  );
}
