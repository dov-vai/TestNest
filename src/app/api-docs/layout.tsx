import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'API Documentation - TestNest',
  description: 'TestNest API Documentation',
};

export default function ApiDocsLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return <div className="h-screen w-full">{children}</div>;
}
