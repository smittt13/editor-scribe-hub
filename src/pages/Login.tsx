
import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Info } from 'lucide-react';
import { toast } from 'sonner';

const formSchema = z.object({
  email: z.string().email({ message: 'Please enter a valid email address' }),
  password: z.string().min(1, { message: 'Password is required' }),
});

const Login = () => {
  const { login, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [loginError, setLoginError] = useState('');

  // Redirect if already logged in
  useEffect(() => {
    if (isAuthenticated) {
      navigate('/blogs');
    }
  }, [isAuthenticated, navigate]);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  });

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    setIsLoading(true);
    setLoginError('');
    
    try {
      console.log(`Attempting to login with:`, values);
      const success = await login(values.email, values.password);
      if (!success) {
        setLoginError('Invalid email or password. Please try again.');
      }
    } catch (error) {
      console.error('Login error:', error);
      setLoginError('An error occurred during login.');
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleAdminLogin = () => {
    form.setValue('email', 'admin@example.com');
    form.setValue('password', 'admin123');
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gradient glow-effect">BlogAdmin</h1>
          <p className="text-muted-foreground mt-2">Sign in to manage your blogs</p>
        </div>

        <Card className="w-full card-glow">
          <CardHeader>
            <CardTitle>Login</CardTitle>
            <CardDescription>Enter your credentials to access your account</CardDescription>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email</FormLabel>
                      <FormControl>
                        <Input placeholder="your@email.com" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="password"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Password</FormLabel>
                      <FormControl>
                        <Input type="password" placeholder="••••••••" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                {loginError && (
                  <div className="text-sm font-medium text-destructive">{loginError}</div>
                )}
                
                <Button type="submit" className="w-full" disabled={isLoading}>
                  {isLoading ? 'Signing in...' : 'Sign in'}
                </Button>
              </form>
            </Form>
            
            <div className="mt-4 p-3 bg-secondary/50 rounded-md flex items-start gap-2">
              <Info className="h-5 w-5 mt-0.5 flex-shrink-0 text-muted-foreground" />
              <div>
                <p className="text-sm text-muted-foreground">
                  Default admin credentials:
                </p>
                <p className="text-sm font-medium mt-1">
                  Email: admin@example.com<br />
                  Password: admin123
                </p>
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="mt-2 text-xs" 
                  onClick={handleAdminLogin}
                >
                  Fill Admin Credentials
                </Button>
              </div>
            </div>
          </CardContent>
          <CardFooter className="flex justify-center">
            <p className="text-sm text-muted-foreground">
              Don't have an account?{' '}
              <Link to="/signup" className="text-primary font-medium hover:underline">
                Sign up
              </Link>
            </p>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
};

export default Login;
