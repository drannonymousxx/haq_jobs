import type { Metadata } from "next";
import { Poppins } from "next/font/google";
import localFont from "next/font/local";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import "./globals.css";

const manrope = localFont({
  src: "../../public/fonts/Manrope/Manrope-VariableFont_wght.ttf",
  variable: "--font-manrope",
  weight: "100 900",
  display: "swap",
});

const poppins = Poppins({ 
  weight: ['400', '500', '600', '700', '800', '900'],
  subsets: ['latin'],
  variable: '--font-poppins',
});

export const metadata: Metadata = {
  title: "HAQJobs - Discover Legal Opportunities",
  description: "Legal career platform connecting law students and lawyers with internships, jobs, and career opportunities.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${manrope.className} ${manrope.variable} ${poppins.variable}`}>
        <Navbar />
        <main>{children}</main>
        <Footer />
      </body>
    </html>
  );
}
