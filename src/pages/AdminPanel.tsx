
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import Layout from '@/components/Layout';
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { 
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';
import { User, Key, ShieldAlert, Eye, EyeOff } from 'lucide-react';

interface UserDetails {
  id: string;
  username: string;
  email: string;
  apiKey?: string;
  role?: 'admin' | 'user';
  requestCount?: number;
  avatar?: string;
}

const AdminPanel = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [users, setUsers] = useState<UserDetails[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showApiKeys, setShowApiKeys] = useState<Record<string, boolean>>({});
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<UserDetails | null>(null);
  const [newUsername, setNewUsername] = useState('');
  const [newEmail, setNewEmail] = useState('');

  // Check if current user is admin, if not redirect
  useEffect(() => {
    if (user && user.role !== 'admin') {
      toast.error('Access denied. Admin privileges required.');
      navigate('/dashboard');
    }
  }, [user, navigate]);

  // Fetch all users from localStorage
  useEffect(() => {
    if (user && user.role === 'admin') {
      const storedUsers = JSON.parse(localStorage.getItem('users') || '[]');
      setUsers(storedUsers.map((u: any) => {
        // Remove password field for security
        const { password, ...userWithoutPassword } = u;
        return userWithoutPassword;
      }));
      setIsLoading(false);
    }
  }, [user]);

  const toggleApiKeyVisibility = (userId: string) => {
    setShowApiKeys(prev => ({
      ...prev,
      [userId]: !prev[userId]
    }));
  };

  const regenerateApiKey = (userId: string) => {
    const newApiKey = crypto.randomUUID();
    
    // Update users state
    setUsers(prev => prev.map(u => 
      u.id === userId ? { ...u, apiKey: newApiKey } : u
    ));
    
    // Update in localStorage
    const storedUsers = JSON.parse(localStorage.getItem('users') || '[]');
    const updatedUsers = storedUsers.map((u: any) => 
      u.id === userId ? { ...u, apiKey: newApiKey } : u
    );
    localStorage.setItem('users', JSON.stringify(updatedUsers));
    
    toast.success('API key regenerated successfully');
  };

  const handleEditUser = (user: UserDetails) => {
    setSelectedUser(user);
    setNewUsername(user.username);
    setNewEmail(user.email);
    setDialogOpen(true);
  };

  const saveUserChanges = () => {
    if (!selectedUser) return;
    
    // Validation
    if (!newUsername.trim() || !newEmail.trim()) {
      toast.error('Username and email are required');
      return;
    }
    
    // Update users state
    setUsers(prev => prev.map(u => 
      u.id === selectedUser.id ? { ...u, username: newUsername, email: newEmail } : u
    ));
    
    // Update in localStorage
    const storedUsers = JSON.parse(localStorage.getItem('users') || '[]');
    const updatedUsers = storedUsers.map((u: any) => 
      u.id === selectedUser.id ? { ...u, username: newUsername, email: newEmail, ...(u.password ? { password: u.password } : {}) } : u
    );
    localStorage.setItem('users', JSON.stringify(updatedUsers));
    
    // If current user was updated, also update in user localStorage
    if (user && user.id === selectedUser.id) {
      const currentUser = JSON.parse(localStorage.getItem('user') || '{}');
      const updatedCurrentUser = { ...currentUser, username: newUsername, email: newEmail };
      localStorage.setItem('user', JSON.stringify(updatedCurrentUser));
    }
    
    setDialogOpen(false);
    toast.success('User updated successfully');
  };

  const toggleUserRole = (userId: string, currentRole: 'admin' | 'user') => {
    const newRole = currentRole === 'admin' ? 'user' : 'admin';
    
    // Update users state
    setUsers(prev => prev.map(u => 
      u.id === userId ? { ...u, role: newRole } : u
    ));
    
    // Update in localStorage
    const storedUsers = JSON.parse(localStorage.getItem('users') || '[]');
    const updatedUsers = storedUsers.map((u: any) => 
      u.id === userId ? { ...u, role: newRole } : u
    );
    localStorage.setItem('users', JSON.stringify(updatedUsers));
    
    // If current user was updated, also update in user localStorage
    if (user && user.id === userId) {
      const currentUser = JSON.parse(localStorage.getItem('user') || '{}');
      const updatedCurrentUser = { ...currentUser, role: newRole };
      localStorage.setItem('user', JSON.stringify(updatedCurrentUser));
    }
    
    toast.success(`User is now ${newRole}`);
  };

  if (isLoading) {
    return (
      <Layout>
        <div className="flex items-center justify-center h-96">
          <div className="text-lg">Loading...</div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold">Admin Panel</h1>
          <div className="flex items-center space-x-2">
            <ShieldAlert className="h-6 w-6 text-primary" />
            <span className="text-sm font-medium">Admin Access</span>
          </div>
        </div>

        <Card className="p-6">
          <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
            <User className="h-5 w-5" /> User Management
          </h2>
          
          <Table>
            <TableCaption>A list of all registered users</TableCaption>
            <TableHeader>
              <TableRow>
                <TableHead>User</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Role</TableHead>
                <TableHead>API Key</TableHead>
                <TableHead>API Requests</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {users.map((user) => (
                <TableRow key={user.id}>
                  <TableCell className="font-medium">
                    <div className="flex items-center gap-2">
                      <img 
                        src={user.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(user.username)}&background=random`} 
                        alt={user.username}
                        className="w-8 h-8 rounded-full"
                      />
                      {user.username}
                    </div>
                  </TableCell>
                  <TableCell>{user.email}</TableCell>
                  <TableCell>
                    <span 
                      className={`px-2 py-1 rounded-full text-xs ${
                        user.role === 'admin' ? 'bg-primary text-primary-foreground' : 'bg-secondary text-secondary-foreground'
                      }`}
                    >
                      {user.role || 'user'}
                    </span>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      {user.apiKey ? (
                        <>
                          <code className="text-xs bg-secondary p-1 rounded max-w-[120px] truncate">
                            {showApiKeys[user.id] ? user.apiKey : '••••••••••••••••'}
                          </code>
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            onClick={() => toggleApiKeyVisibility(user.id)}
                          >
                            {showApiKeys[user.id] ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                          </Button>
                          <Button 
                            variant="outline" 
                            size="sm" 
                            onClick={() => regenerateApiKey(user.id)}
                            className="text-xs h-7"
                          >
                            <Key className="h-3 w-3 mr-1" /> New
                          </Button>
                        </>
                      ) : (
                        <span className="text-muted-foreground text-xs">No API key</span>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>{user.requestCount || 0}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Button 
                        variant="outline" 
                        size="sm" 
                        onClick={() => handleEditUser(user)}
                        className="text-xs h-7"
                      >
                        Edit
                      </Button>
                      <Button 
                        variant={user.role === 'admin' ? 'destructive' : 'secondary'} 
                        size="sm" 
                        onClick={() => toggleUserRole(user.id, user.role || 'user')}
                        className="text-xs h-7"
                      >
                        {user.role === 'admin' ? 'Remove Admin' : 'Make Admin'}
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Card>
      </div>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit User</DialogTitle>
            <DialogDescription>
              Make changes to user information here.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <label htmlFor="username" className="text-right">
                Username
              </label>
              <Input
                id="username"
                value={newUsername}
                onChange={(e) => setNewUsername(e.target.value)}
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <label htmlFor="email" className="text-right">
                Email
              </label>
              <Input
                id="email"
                value={newEmail}
                onChange={(e) => setNewEmail(e.target.value)}
                className="col-span-3"
              />
            </div>
          </div>
          <DialogFooter>
            <Button type="submit" onClick={saveUserChanges}>Save changes</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Layout>
  );
};

export default AdminPanel;
