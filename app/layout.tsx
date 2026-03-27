import type { Metadata } from 'next';
import { Toaster } from 'react-hot-toast';
import AuthProvider from '@/components/layout/AuthProvider';
import './globals.css';

export const metadata: Metadata = {
  title: 'MiniAppart - Quản lý chung cư mini',
  description: 'Nền tảng kết nối chủ nhà, môi giới và khách thuê chung cư mini',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="vi">
      <body>
        <AuthProvider>
          {children}
          <Toaster
            position="top-right"
            toastOptions={{
              duration: 3000,
              style: { borderRadius: '12px', padding: '12px 16px', fontSize: '14px' },
            }}
          />
        </AuthProvider>
      </body>
    </html>
  );
}
