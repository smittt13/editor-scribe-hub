
import React, { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useBlogContext, Blog } from '@/context/BlogContext';
import { useAuth } from '@/context/AuthContext';

const Api = () => {
  const [searchParams] = useSearchParams();
  const { validateApiKey, getPublishedBlogs } = useBlogContext();
  const { incrementRequestCount } = useAuth();
  const [response, setResponse] = useState<{ success: boolean; data?: Blog[]; error?: string }>({
    success: false
  });

  useEffect(() => {
    const apiKey = searchParams.get('apiKey');
    
    if (!apiKey) {
      setResponse({
        success: false,
        error: 'API key is required'
      });
      return;
    }
    
    const isValidApiKey = validateApiKey(apiKey);
    
    if (!isValidApiKey) {
      setResponse({
        success: false,
        error: 'Invalid API key'
      });
      return;
    }
    
    // Increment request count
    incrementRequestCount();
    
    // Get all published blogs
    const publishedBlogs = getPublishedBlogs();
    
    setResponse({
      success: true,
      data: publishedBlogs
    });
  }, [searchParams, validateApiKey, getPublishedBlogs, incrementRequestCount]);

  return (
    <pre className="bg-black text-white p-4 min-h-screen overflow-auto">
      {JSON.stringify(response, null, 2)}
    </pre>
  );
};

export default Api;
