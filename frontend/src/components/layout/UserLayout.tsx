
import { Header } from './Header';
import { Footer } from './Footer';
import { UserSidebar } from './UserSidebar';
import { useUIStore } from '../../stores';
import { ProtectedRoute } from '../common/ProtectedRoute';

export const UserLayout = ({ children }: { children?: React.ReactNode }) => {
  const { theme } = useUIStore();

  return (
    <ProtectedRoute>
      <div className={`min-h-screen flex flex-col ${theme === 'dark' ? 'dark bg-gray-950' : 'bg-gray-50'}`}>
        <Header />
        <main className="flex-1 flex py-8 max-w-7xl mx-auto w-full px-4 gap-8">
          <UserSidebar />
          <div className="flex-1 min-w-0">
            {children}
          </div>
        </main>
        <Footer />
      </div>
    </ProtectedRoute>
  );
};
