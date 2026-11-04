import './globals.css';
import type { Metadata } from 'next';
import { Zen_Maru_Gothic } from 'next/font/google';

const zenMaruGothic = Zen_Maru_Gothic({
  weight: ['400', '500', '700'],
  preload: false,
});

export const metadata: Metadata = {
  title: 'えほんえらび',
  description: '親子で選ぶ、おすすめの絵本を提案するチャット',
  openGraph: {
    images: [
      {
        url: 'https://bolt.new/static/og_default.png',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    images: [
      {
        url: 'https://bolt.new/static/og_default.png',
      },
    ],
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ja">
      <body className={zenMaruGothic.className}>{children}</body>
    </html>
  );
}
