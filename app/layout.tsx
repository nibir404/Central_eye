import type { Metadata } from 'next';
import './globals.css';
export const metadata: Metadata = {
  title: 'Central Eye — National Infrastructure Intelligence',
  description: 'Explore Bangladesh’s electricity and telecom infrastructure.',
  icons: {
    icon: [
      { url: '/puku-ai.png' },
      { url: '/favicon.ico' },
      { url: '/favicon.svg', type: 'image/svg+xml' },
    ],
    shortcut: '/puku-ai.png',
    apple: '/puku-ai.png',
  },
};
export default function RootLayout({children}: Readonly<{children: React.ReactNode}>) {
  return (
    <html lang="en">
      <head>
        <link rel="icon" type="image/png" href="/puku-ai.png" />
        <link rel="icon" type="image/x-icon" href="/favicon.ico" />
        <link rel="apple-touch-icon" href="/puku-ai.png" />
      </head>
      <body>{children}</body>
    </html>
  );
}
