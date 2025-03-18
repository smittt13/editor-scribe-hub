
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { BlogProvider } from "./context/BlogContext";
import { AuthProvider, useAuth } from "./context/AuthContext";
import Dashboard from "./pages/Dashboard";
import BlogEditor from "./pages/BlogEditor";
import BlogList from "./pages/BlogList";
import BlogPreview from "./pages/BlogPreview";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import Settings from "./pages/Settings";
import NotFound from "./pages/NotFound";
import Api from "./pages/Api";
import React from "react";

const queryClient = new QueryClient();

// Protected route component
const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { isAuthenticated, isLoading } = useAuth();
  
  if (isLoading) {
    return <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="text-center">
        <h1 className="text-2xl font-bold text-gradient glow-effect">Loading...</h1>
      </div>
    </div>;
  }
  
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }
  
  return <>{children}</>;
};

// Admin route component
const AdminRoute = ({ children }: { children: React.ReactNode }) => {
  const { user, isLoading } = useAuth();
  
  if (isLoading) {
    return <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="text-center">
        <h1 className="text-2xl font-bold text-gradient glow-effect">Loading...</h1>
      </div>
    </div>;
  }
  
  if (!user || user.role !== 'admin') {
    return <Navigate to="/blogs" replace />;
  }
  
  return <>{children}</>;
};

// Public routes that redirect to dashboard if already logged in
const PublicRoute = ({ children }: { children: React.ReactNode }) => {
  const { isAuthenticated, isLoading } = useAuth();
  
  if (isLoading) {
    return <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="text-center">
        <h1 className="text-2xl font-bold text-gradient glow-effect">Loading...</h1>
      </div>
    </div>;
  }
  
  if (isAuthenticated) {
    return <Navigate to="/blogs" replace />;
  }
  
  return <>{children}</>;
};

const AppRoutes = () => {
  return (
    <Routes>
      {/* API route (public but requires API key) */}
      <Route path="/api/blogs" element={<Api />} />
      
      {/* Public routes */}
      <Route path="/login" element={
        <PublicRoute>
          <Login />
        </PublicRoute>
      } />
      <Route path="/signup" element={
        <PublicRoute>
          <Signup />
        </PublicRoute>
      } />
      
      {/* Protected routes */}
      <Route path="/" element={
        <ProtectedRoute>
          <Dashboard />
        </ProtectedRoute>
      } />
      <Route path="/blogs" element={
        <ProtectedRoute>
          <BlogList />
        </ProtectedRoute>
      } />
      <Route path="/blogs/new" element={
        <ProtectedRoute>
          <BlogEditor />
        </ProtectedRoute>
      } />
      <Route path="/blogs/edit/:id" element={
        <ProtectedRoute>
          <BlogEditor />
        </ProtectedRoute>
      } />
      <Route path="/blogs/preview/:id" element={
        <ProtectedRoute>
          <BlogPreview />
        </ProtectedRoute>
      } />
      <Route path="/settings" element={
        <ProtectedRoute>
          <Settings />
        </ProtectedRoute>
      } />
      
      {/* Catch-all route */}
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AuthProvider>
          <BlogProvider>
            <AppRoutes />
          </BlogProvider>
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
