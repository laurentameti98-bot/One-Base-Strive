import { ReactNode } from 'react';
import { useLogout, useMe } from '@/hooks/useAuth';
import { Button } from './ui/button';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { cn } from '@/lib/utils';

interface LayoutProps {
  children: ReactNode;
}

export function Layout({ children }: LayoutProps) {
  const { data: user } = useMe();
  const logout = useLogout();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = async () => {
    await logout.mutateAsync();
    navigate('/login');
  };

  const navItems = [
    { label: 'Dashboard', path: '/' },
    { label: 'Accounts', path: '/crm/accounts' },
    { label: 'Contacts', path: '/crm/contacts' },
    { label: 'Deals', path: '/crm/deals' },
    { label: 'Activities', path: '/crm/activities' },
    { label: 'Invoices', path: '/erp/invoices' },
    { label: 'Customers', path: '/erp/customers' },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-8">
              <div className="flex items-center">
                <h1 className="text-xl font-bold text-primary">Strive</h1>
                <span className="ml-2 text-sm text-muted-foreground">One Base</span>
              </div>

              <nav className="flex items-center gap-1">
                {navItems.map((item) => {
                  const isActive = location.pathname === item.path || 
                    (item.path !== '/' && location.pathname.startsWith(item.path));
                  
                  return (
                    <Link
                      key={item.path}
                      to={item.path}
                      className={cn(
                        'px-3 py-2 text-sm font-medium rounded-md transition-colors',
                        isActive
                          ? 'bg-primary/10 text-primary'
                          : 'text-muted-foreground hover:bg-gray-100 hover:text-foreground'
                      )}
                    >
                      {item.label}
                    </Link>
                  );
                })}
              </nav>
            </div>

            <div className="flex items-center gap-4">
              {user && (
                <>
                  <span className="text-sm text-muted-foreground">{user.email}</span>
                  <Button variant="outline" size="sm" onClick={handleLogout}>
                    Logout
                  </Button>
                </>
              )}
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">{children}</main>
    </div>
  );
}
