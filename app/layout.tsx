import type { Metadata } from 'next';
import './globals.css';
export const metadata: Metadata = {title: 'Nibirman — National Infrastructure Intelligence', description: 'Explore Bangladesh’s electricity and telecom infrastructure. Official reference figures and transparent demonstration scenarios.'};
export default function RootLayout({children}: Readonly<{children: React.ReactNode}>) {return <html lang="en"><body>{children}</body></html>}
