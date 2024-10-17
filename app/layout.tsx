import '@/app/ui/global.css';
import {inter} from '@/app/ui/fonts';
import {Metadata} from 'next';

export const metadata: Metadata = {
  title: {
   template: '%s  ',
    default: 'Acme Dashboard',
  },
  description: 'The official Next.js Course Dashboard, built by Acme Corp. Dashboard',
  metadataBase: new URL('https://acme-dashboard.vercel.app'),

}
export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={`${inter.className} antialiased`}>{children}</body>
    </html>
  );
}
