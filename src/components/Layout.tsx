
import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { LayoutDashboard, FileText, Plus, Settings, LogOut } from 'lucide-react';

interface LayoutProps {
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const location = useLocation();

  const navigation = [
    { name: 'Dashboard', href: '/', icon: LayoutDashboard },
    { name: 'Blogs', href: '/blogs', icon: FileText },
    { name: 'New Blog', href: '/blogs/new', icon: Plus },
  ];

  return (
    <div className="min-h-screen bg-background">
      <div className="flex h-screen overflow-hidden">
        {/* Sidebar */}
        <div className="hidden md:flex md:flex-shrink-0">
          <div className="flex flex-col w-64">
            <div className="flex flex-col flex-grow pt-5 overflow-y-auto bg-sidebar border-r border-border rounded-r-xl shadow-sm">
              <div className="flex items-center flex-shrink-0 px-6 mb-10">
                <h1 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-primary to-purple-400">BlogAdmin</h1>
              </div>
              <div className="flex flex-col flex-grow px-4 mt-5">
                <nav className="flex-1 space-y-2 bg-sidebar">
                  {navigation.map((item) => {
                    const isActive = location.pathname === item.href;
                    return (
                      <Link
                        key={item.name}
                        to={item.href}
                        className={cn(
                          "group flex items-center px-4 py-3 text-sm font-medium rounded-lg transition-all duration-200",
                          isActive
                            ? "bg-primary text-primary-foreground shadow-md"
                            : "text-sidebar-foreground hover:text-primary hover:bg-sidebar-accent"
                        )}
                      >
                        <item.icon
                          className={cn(
                            "mr-3 flex-shrink-0 h-5 w-5",
                            isActive ? "text-primary-foreground" : "text-sidebar-foreground group-hover:text-primary"
                          )}
                          aria-hidden="true"
                        />
                        {item.name}
                      </Link>
                    );
                  })}
                </nav>

                <div className="mt-auto pb-6 space-y-2">
                  <Link
                    to="/"
                    className="group flex items-center px-4 py-3 text-sm font-medium rounded-lg text-sidebar-foreground hover:text-primary hover:bg-sidebar-accent"
                  >
                    <Settings className="mr-3 flex-shrink-0 h-5 w-5 text-sidebar-foreground group-hover:text-primary" aria-hidden="true" />
                    Settings
                  </Link>
                  <Link
                    to="/"
                    className="group flex items-center px-4 py-3 text-sm font-medium rounded-lg text-sidebar-foreground hover:text-primary hover:bg-sidebar-accent"
                  >
                    <LogOut className="mr-3 flex-shrink-0 h-5 w-5 text-sidebar-foreground group-hover:text-primary" aria-hidden="true" />
                    Log Out
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="flex flex-col flex-1 w-0 overflow-hidden">
          <main className="relative flex-1 overflow-y-auto focus:outline-none">
            <div className="py-6 mx-auto max-w-7xl px-4 sm:px-6 md:px-8">
              {children}
            </div>
          </main>
        </div>
      </div>
    </div>
  );
};

export default Layout;
