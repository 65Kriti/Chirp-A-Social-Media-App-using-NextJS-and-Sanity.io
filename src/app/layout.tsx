import type { Metadata } from "next";
import { Toaster } from "react-hot-toast";
import "./globals.css";

export const metadata: Metadata = {
  title: "Chirp - See what's happening",
  description: "A premium Twitter Clone built with Next.js, Tailwind CSS, and Sanity.io.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full antialiased dark">
      <body className="min-h-full flex flex-col bg-gray-950 text-gray-50">
        <Toaster 
          position="top-center" 
          toastOptions={{
            style: {
              background: '#1f2937',
              color: '#f9fafb',
              border: '1px solid rgba(255, 255, 255, 0.1)',
            },
          }} 
        />
        {children}
      </body>
    </html>
  );
}

