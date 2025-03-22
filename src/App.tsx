
import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from 'sonner';

// Pages
import Index from './pages/Index';
import Login from './pages/Login';
import Signup from './pages/Signup';
import Dashboard from './pages/Dashboard';
import BlogList from './pages/BlogList';
import BlogEditor from './pages/BlogEditor';
import BlogPreview from './pages/BlogPreview';
import Settings from './pages/Settings';
import Api from './pages/Api';
import AdminPanel from './pages/AdminPanel';
import NotFound from './pages/NotFound';

// Context
import { AuthProvider } from './context/AuthContext';
import { BlogProvider } from './context/BlogContext';
import { AutosaveProvider } from './pages/Settings';

// Auth guard components
const PrivateRoute = ({ children }: { children: React.ReactNode }) => {
  const userExists = localStorage.getItem('user');
  if (!userExists) {
    return <Navigate to="/login" replace />;
  }
  return <>{children}</>;
};

const AdminRoute = ({ children }: { children: React.ReactNode }) => {
  const userStr = localStorage.getItem('user');
  if (!userStr) {
    return <Navigate to="/login" replace />;
  }
  
  try {
    const user = JSON.parse(userStr);
    if (user.role !== 'admin') {
      return <Navigate to="/dashboard" replace />;
    }
    return <>{children}</>;
  } catch (error) {
    return <Navigate to="/login" replace />;
  }
};

const queryClient = new QueryClient();

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <Router>
        <AuthProvider>
          <BlogProvider>
            <AutosaveProvider>
              <Routes>
                <Route path="/" element={<Index />} />
                <Route path="/login" element={<Login />} />
                <Route path="/signup" element={<Signup />} />
                <Route path="/api" element={<Api />} />
                
                {/* Protected routes */}
                <Route path="/dashboard" element={
                  <PrivateRoute>
                    <Dashboard />
                  </PrivateRoute>
                } />
                <Route path="/blogs" element={
                  <PrivateRoute>
                    <BlogList />
                  </PrivateRoute>
                } />
                <Route path="/blogs/new" element={
                  <PrivateRoute>
                    <BlogEditor />
                  </PrivateRoute>
                } />
                <Route path="/blogs/edit/:id" element={
                  <PrivateRoute>
                    <BlogEditor />
                  </PrivateRoute>
                } />
                <Route path="/blogs/preview/:id" element={
                  <PrivateRoute>
                    <BlogPreview />
                  </PrivateRoute>
                } />
                <Route path="/settings" element={
                  <PrivateRoute>
                    <Settings />
                  </PrivateRoute>
                } />
                
                {/* Admin routes */}
                <Route path="/admin" element={
                  <AdminRoute>
                    <AdminPanel />
                  </AdminRoute>
                } />
                
                {/* 404 route */}
                <Route path="*" element={<NotFound />} />
              </Routes>
              <Toaster position="top-right" />
            </AutosaveProvider>
          </BlogProvider>
        </AuthProvider>
      </Router>
    </QueryClientProvider>
  );
}

export default App;
