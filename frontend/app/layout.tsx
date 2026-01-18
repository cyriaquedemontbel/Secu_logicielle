import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Security Scanner',
  description: 'Analyse de sécurité web',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="fr">
      <body className="min-h-screen bg-gray-50">
        {/* Header simple */}
        <header className="bg-white border-b border-gray-200 px-4 py-3">
          <div className="max-w-6xl mx-auto">
            <div className="flex items-center justify-between">
              <a href="/" className="text-lg font-semibold text-gray-900">
                Security Scanner
              </a>
              <span className="text-sm text-gray-500">ISEP</span>
            </div>
          </div>
        </header>

        {/* Contenu principal */}
        <main className="max-w-6xl mx-auto px-4 py-8">
          {children}
        </main>

        {/* Footer simple */}
        <footer className="bg-white border-t border-gray-200 px-4 py-4 mt-8">
          <div className="max-w-6xl mx-auto text-center text-sm text-gray-500">
            <p>Projet étudiant ISEP - 2026</p>
          </div>
        </footer>
      </body>
    </html>
  );
}