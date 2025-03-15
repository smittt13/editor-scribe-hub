
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { BlogProvider } from '@/context/BlogContext';

const Index = () => {
  const navigate = useNavigate();

  useEffect(() => {
    // Automatically redirect to the dashboard
    navigate('/blogs');
  }, [navigate]);

  return (
    <BlogProvider>
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="text-center">
          <h1 className="text-4xl font-bold mb-4">Loading Blog Admin...</h1>
        </div>
      </div>
    </BlogProvider>
  );
};

export default Index;
