
import React, { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import Layout from '@/components/Layout';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { toast } from 'sonner';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';
import { Save, Upload, User, Key, Copy, RefreshCcw } from 'lucide-react';

const Settings = () => {
  const { user, generateApiKey, regenerateApiKey } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [username, setUsername] = useState(user?.username || '');
  const [email, setEmail] = useState(user?.email || '');
  const [avatar, setAvatar] = useState(user?.avatar || '');

  const handleProfileUpdate = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    // Simulate API call delay
    setTimeout(() => {
      // In a real app, this would be an API call to update user data
      // For now, we'll just simulate success
      toast.success('Profile updated successfully');
      setIsLoading(false);
    }, 1000);
  };

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase();
  };

  const handleCopyApiKey = () => {
    if (user?.apiKey) {
      navigator.clipboard.writeText(user.apiKey);
      toast.success('API key copied to clipboard');
    }
  };

  const handleGenerateApiKey = () => {
    if (user?.apiKey) {
      // If key already exists, ask for confirmation before regenerating
      if (window.confirm('Are you sure you want to regenerate your API key? This will invalidate the existing key.')) {
        regenerateApiKey();
      }
    } else {
      generateApiKey();
    }
  };

  return (
    <Layout>
      <div className="flex flex-col gap-8">
        <div>
          <h1 className="text-3xl font-bold text-gradient glow-effect">Settings</h1>
          <p className="text-muted-foreground mt-1">Manage your account preferences</p>
        </div>

        <Tabs defaultValue="profile" className="w-full">
          <TabsList className="mb-6">
            <TabsTrigger value="profile" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
              Profile
            </TabsTrigger>
            <TabsTrigger value="api" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
              API Keys
            </TabsTrigger>
            <TabsTrigger value="account" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
              Account
            </TabsTrigger>
            <TabsTrigger value="notifications" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
              Notifications
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="profile">
            <Card className="border border-border bg-card shadow-sm card-glow">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <User className="mr-2 h-5 w-5 text-primary" />
                  Profile Information
                </CardTitle>
                <CardDescription>
                  Update your profile details and avatar
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleProfileUpdate} className="space-y-6">
                  <div className="flex flex-col md:flex-row gap-6">
                    <div className="flex flex-col items-center space-y-4">
                      <Avatar className="h-24 w-24 border-2 border-primary/20">
                        <AvatarImage src={user?.avatar} alt={user?.username} />
                        <AvatarFallback className="bg-secondary text-primary text-lg">
                          {user ? getInitials(user.username) : 'U'}
                        </AvatarFallback>
                      </Avatar>
                      <Button type="button" variant="outline" size="sm" className="w-full">
                        <Upload className="h-4 w-4 mr-2" />
                        Change Avatar
                      </Button>
                    </div>

                    <div className="flex-1 space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="username">Username</Label>
                        <Input
                          id="username"
                          value={username}
                          onChange={(e) => setUsername(e.target.value)}
                          className="bg-secondary"
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="email">Email</Label>
                        <Input
                          id="email"
                          type="email"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          className="bg-secondary"
                        />
                      </div>
                      
                      {user?.role && (
                        <div className="space-y-2">
                          <Label>Role</Label>
                          <div className="bg-secondary rounded-md p-2 flex items-center">
                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                              user.role === 'admin' ? 'bg-primary/20 text-primary' : 'bg-gray-100 text-gray-800'
                            }`}>
                              {user.role.charAt(0).toUpperCase() + user.role.slice(1)}
                            </span>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                  
                  <Separator />
                  
                  <div className="flex justify-end">
                    <Button type="submit" disabled={isLoading}>
                      {isLoading ? 'Saving...' : 'Save Changes'}
                      {!isLoading && <Save className="h-4 w-4 ml-2" />}
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="api">
            <Card className="border border-border bg-card shadow-sm card-glow">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Key className="mr-2 h-5 w-5 text-primary" />
                  API Keys Management
                </CardTitle>
                <CardDescription>
                  Generate and manage API keys for accessing your blog content
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="api-key">Your API Key</Label>
                  <div className="flex items-center space-x-2">
                    <div className="relative flex-1">
                      <Input
                        id="api-key"
                        readOnly
                        type="text"
                        value={user?.apiKey || 'No API key generated yet'}
                        className="pr-10 font-mono text-xs bg-secondary"
                      />
                      {user?.apiKey && (
                        <Button 
                          type="button" 
                          size="icon" 
                          variant="ghost" 
                          className="absolute right-1 top-1 h-6 w-6"
                          onClick={handleCopyApiKey}
                        >
                          <Copy className="h-3 w-3" />
                        </Button>
                      )}
                    </div>
                    <Button 
                      type="button" 
                      onClick={handleGenerateApiKey}
                      className="bg-primary hover:bg-primary/80"
                    >
                      {user?.apiKey ? (
                        <>
                          <RefreshCcw className="h-4 w-4 mr-2" />
                          Regenerate
                        </>
                      ) : (
                        <>
                          <Key className="h-4 w-4 mr-2" />
                          Generate Key
                        </>
                      )}
                    </Button>
                  </div>
                </div>

                <div className="rounded-md bg-secondary p-4 space-y-3">
                  <h3 className="font-semibold">How to use your API key</h3>
                  <p className="text-sm text-muted-foreground">
                    Use your API key to retrieve published blogs from your API endpoint.
                  </p>
                  <div className="bg-black/30 p-3 rounded-md overflow-x-auto">
                    <pre className="text-xs text-gray-300 font-mono">
{`fetch('https://yourdomain.com/api/blogs?apiKey=${user?.apiKey || 'YOUR_API_KEY'}')
  .then(response => response.json())
  .then(data => console.log(data));`}
                    </pre>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    <strong>Note:</strong> Keep your API key secure. If you suspect your key has been compromised, regenerate it immediately.
                  </p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="account">
            <Card className="border border-border bg-card shadow-sm card-glow">
              <CardHeader>
                <CardTitle>Account Settings</CardTitle>
                <CardDescription>
                  Manage your account and security preferences
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground text-center py-8">
                  Account settings will be available in a future update
                </p>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="notifications">
            <Card className="border border-border bg-card shadow-sm card-glow">
              <CardHeader>
                <CardTitle>Notification Preferences</CardTitle>
                <CardDescription>
                  Control how you receive notifications
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground text-center py-8">
                  Notification settings will be available in a future update
                </p>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </Layout>
  );
};

export default Settings;
