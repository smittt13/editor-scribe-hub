
import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { useAuth } from '@/context/AuthContext';
import { 
  LayoutDashboard, 
  FileText, 
  Plus, 
  Settings, 
  LogOut, 
  User,
  PenSquare
} from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

interface LayoutProps {
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const location = useLocation();
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const navigation = [
    { name: 'Dashboard', href: '/', icon: LayoutDashboard },
    { name: 'Blogs', href: '/blogs', icon: FileText },
    { name: 'New Blog', href: '/blogs/new', icon: Plus },
  ];
  
  const handleLogout = () => {
    logout();
  };

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase();
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="flex h-screen overflow-hidden">
        {/* Sidebar */}
        <div className="hidden md:flex md:flex-shrink-0">
          <div className="flex flex-col w-64">
            <div className="flex flex-col flex-grow pt-5 overflow-y-auto bg-sidebar rounded-r-xl shadow-md">
              <div className="flex items-center flex-shrink-0 px-6 mb-6">
                <h1 className="text-2xl font-bold text-gradient glow-effect">BlogAdmin</h1>
              </div>
              
              {user && (
                <div className="flex items-center px-6 mb-6 mt-2">
                  <Avatar className="h-10 w-10 border-2 border-primary/20">
                    <AvatarImage src={user.avatar} alt={user.username} />
                    <AvatarFallback className="bg-secondary text-primary">
                      {getInitials(user.username)}
                    </AvatarFallback>
                  </Avatar>
                  <div className="ml-3">
                    <p className="text-sm font-medium text-foreground">{user.username}</p>
                    <p className="text-xs text-muted-foreground truncate max-w-[160px]">{user.email}</p>
                  </div>
                </div>
              )}
              
              <div className="flex flex-col flex-grow px-4 mt-2">
                <nav className="flex-1 space-y-2">
                  {navigation.map((item) => {
                    const isActive = location.pathname === item.href || 
                                    (item.href === '/' && location.pathname === '/blogs');
                    return (
                      <Link
                        key={item.name}
                        to={item.href}
                        className={cn(
                          "group flex items-center px-4 py-3 text-sm font-medium rounded-lg transition-all duration-200",
                          isActive
                            ? "bg-primary text-primary-foreground shadow-lg"
                            : "text-foreground hover:text-primary hover:bg-secondary"
                        )}
                      >
                        <item.icon
                          className={cn(
                            "mr-3 flex-shrink-0 h-5 w-5",
                            isActive ? "text-primary-foreground" : "text-foreground group-hover:text-primary"
                          )}
                          aria-hidden="true"
                        />
                        {item.name}
                      </Link>
                    );
                  })}
                </nav>

                <div className="mt-auto pb-6 space-y-2">
                  <Button
                    variant="ghost"
                    onClick={() => navigate('/settings')}
                    className="w-full justify-start text-foreground hover:text-primary hover:bg-secondary"
                  >
                    <Settings className="mr-3 flex-shrink-0 h-5 w-5" aria-hidden="true" />
                    Settings
                  </Button>
                  <Button
                    variant="ghost"
                    onClick={handleLogout}
                    className="w-full justify-start text-foreground hover:text-destructive hover:bg-secondary"
                  >
                    <LogOut className="mr-3 flex-shrink-0 h-5 w-5" aria-hidden="true" />
                    Log Out
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Mobile header */}
        <div className="flex flex-col flex-1 w-0 overflow-hidden">
          <div className="md:hidden flex items-center justify-between p-4 border-b border-border">
            <h1 className="text-xl font-bold text-gradient">BlogAdmin</h1>
            <div className="flex items-center space-x-2">
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => navigate('/blogs/new')}
                    >
                      <PenSquare size={20} />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>New Blog</TooltipContent>
                </Tooltip>
              </TooltipProvider>
              
              {user && (
                <Avatar className="h-8 w-8 border-2 border-primary/20 cursor-pointer"
                  onClick={() => navigate('/settings')}>
                  <AvatarImage src={user.avatar} alt={user.username} />
                  <AvatarFallback className="bg-secondary text-primary text-xs">
                    {getInitials(user.username)}
                  </AvatarFallback>
                </Avatar>
              )}
            </div>
          </div>
          
          {/* Content */}
          <main className="relative flex-1 overflow-y-auto focus:outline-none">
            <div className="py-6 mx-auto px-4 sm:px-6 md:px-8">
              {children}
            </div>
          </main>
          
          {/* Mobile bottom nav */}
          <div className="md:hidden flex items-center justify-around py-2 border-t border-border bg-card">
            {navigation.map((item) => {
              const isActive = location.pathname === item.href || 
                              (item.href === '/' && location.pathname === '/blogs');
              return (
                <Link
                  key={item.name}
                  to={item.href}
                  className={cn(
                    "flex flex-col items-center py-1 px-3",
                    isActive ? "text-primary" : "text-muted-foreground"
                  )}
                >
                  <item.icon className="h-5 w-5" />
                  <span className="text-xs mt-1">{item.name}</span>
                </Link>
              );
            })}
            <Button
              variant="ghost"
              size="sm"
              className="flex flex-col items-center p-1 h-auto text-muted-foreground"
              onClick={handleLogout}
            >
              <LogOut className="h-5 w-5" />
              <span className="text-xs mt-1">Logout</span>
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Layout;
