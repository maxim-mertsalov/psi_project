import type { Metadata } from "next";
// import { MaterialSymbols } from "next/font/google";
import "./globals.css";
import Navbar from "@/app/components/layout/Navbar";
import Footer from "@/app/components/layout/Footer";
import { CartProvider } from "./context/CartContext";

// const geistSans = MaterialSymbols({
//   variable: "--font-geist-sans",
//   subsets: ["latin"],
// });

export const metadata: Metadata = {
  title: "SmartBuy | Precision Electronics Curator",
  description: "High-end electronics curated for quality, engineered for efficiency.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`antialiased`}>
      <head>
        {/* Material Symbols через Google Fonts — наиболее эффективный способ для этого набора иконок */}
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap"
        />
      </head>
      <body className="bg-surface text-on-surface min-h-screen flex flex-col">
        <CartProvider>
          <Navbar />
          <div className="flex-1">
            {children}
          </div>
          <Footer />
        </CartProvider>
      </body>
    </html>
  );
}