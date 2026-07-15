import { ReactNode } from 'react';
import { Header } from './Header';
import { Footer } from './Footer';
import { useUIStore } from '../../stores';

export const PublicLayout = ({ children }: { children: ReactNode }) => {
  const { theme } = useUIStore();

  return (
    <div className={`min-h-screen flex flex-col ${theme === 'dark' ? 'dark bg-gray-950' : 'bg-gray-50'}`}>
      <Header />
      <main className="flex-1 flex flex-col">
        {children}
      </main>
      <Footer />
    </div>
  );
};
