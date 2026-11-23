import './globals.css';
import Prefs from '@/components/Prefs';
export const metadata = { title: 'DigiTani — Asisten Pertanian AI (Prototipe)', description: 'Growing Together, Growing Smarter.' };
export default function RootLayout({ children }) {
  return (
    <html lang="id">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;600;700&display=swap" rel="stylesheet" />
      </head>
      <body><Prefs />{children}</body>
    </html>
  );
}
