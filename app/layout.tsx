import type { Metadata } from 'next';
import './globals.css';
export const metadata: Metadata = {title: 'Central Eye — National Infrastructure Intelligence', description: 'Explore Bangladesh’s electricity and telecom infrastructure.'};
export default function RootLayout({children}: Readonly<{children: React.ReactNode}>) {return <html lang="en"><body>{children}</body></html>}
