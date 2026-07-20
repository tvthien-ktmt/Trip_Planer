import { UserLayoutClient } from '../../components/layout/UserLayoutClient';

export default function UserLayout({ children }: { children: React.ReactNode }) {
  return <UserLayoutClient>{children}</UserLayoutClient>;
}
