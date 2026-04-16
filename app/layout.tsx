import type { Metadata, Viewport } from "next";
import { ToastProvider } from "@/contexts/ToastContext";
import { Toast } from "@/components/ui/Toast";
import "./globals.css";

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  themeColor: '#10b981',
};

export const metadata: Metadata = {
  title: "VillagePrep — AI-Powered Study Assistant",
  manifest: '/manifest.json',
  description: "Upload your notes, PDFs, or any study material. VillagePrep uses AI to generate flashcards, quizzes, study plans, and personalized learning — all in one place.",
  keywords: ["study", "AI", "flashcards", "quiz", "notes", "education", "learning"],
  authors: [{ name: "VillagePrep" }],
  openGraph: {
    title: "VillagePrep — AI-Powered Study Assistant",
    description: "Upload notes, generate flashcards, take quizzes, and ace your classes with AI.",
    siteName: "VillagePrep",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "VillagePrep — AI-Powered Study Assistant",
    description: "Upload notes, generate flashcards, take quizzes, and ace your classes with AI.",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full antialiased">
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              if ('serviceWorker' in navigator) {
                window.addEventListener('load', function() {
                  navigator.serviceWorker.register('/sw.js').then(
                    function(registration) {
                      // ServiceWorker registered successfully
                    },
                    function(err) {
                      // ServiceWorker registration failed - silent fail, not user-facing
                    }
                  );
                });
              }
            `,
          }}
        />
      </head>
      <body className="min-h-full flex flex-col">
        <ToastProvider>
          <div className="noise-overlay" aria-hidden="true" />
          {children}
          <Toast />
        </ToastProvider>
      </body>
    </html>
  );
}
