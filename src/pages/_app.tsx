import '@/styles/globals.css';
import type { AppProps } from 'next/app';
import Layout from '@/components/Layout';
import { useEffect } from 'react';

export default function App({ Component, pageProps }: AppProps) {
  // Add dark mode by default
  useEffect(() => {
    document.documentElement.classList.add('dark');
  }, []);

  return (
    <Layout>
      <Component {...pageProps} />
    </Layout>
  );
} 