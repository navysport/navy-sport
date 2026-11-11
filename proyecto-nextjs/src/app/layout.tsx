import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Navy Sport - Catálogo & Uniformes Deportivos',
  description: 'Catálogo interactivo y consulta de stock en tiempo real de camisetas deportivas y sublimación personalizada.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es">
      <body className="antialiased selection:bg-blue-600 selection:text-white">
        {children}
      </body>
    </html>
  );
}
