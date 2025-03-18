
import React, { createContext, useContext, useState, useEffect } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { useAuth } from './AuthContext';

export interface Blog {
  id: string;
  user_id: string;
  author_name: string;
  author_image?: string;
  slug: string;
  cover_image?: string;
  title: string;
  sub_title?: string;
  tags: string[];
  content: any; // EditorJS data
  priority?: number;
  status: "draft" | "published";
  createdAt: string;
  updatedAt: string;
}

interface BlogContextType {
  blogs: Blog[];
  addBlog: (blog: Omit<Blog, 'id' | 'createdAt' | 'updatedAt' | 'user_id'>) => Blog;
  updateBlog: (id: string, blog: Partial<Blog>) => Blog | null;
  deleteBlog: (id: string) => void;
  getBlog: (id: string) => Blog | undefined;
  getPublishedBlogs: () => Blog[];
  validateApiKey: (apiKey: string) => boolean;
}

const BlogContext = createContext<BlogContextType | undefined>(undefined);

export const useBlogContext = () => {
  const context = useContext(BlogContext);
  if (context === undefined) {
    throw new Error('useBlogContext must be used within a BlogProvider');
  }
  return context;
};

export const BlogProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  const [blogs, setBlogs] = useState<Blog[]>(() => {
    const savedBlogs = localStorage.getItem('blogs');
    return savedBlogs ? JSON.parse(savedBlogs) : [];
  });

  // Filter blogs to only show the current user's blogs
  const userBlogs = user ? blogs.filter(blog => blog.user_id === user.id) : [];

  useEffect(() => {
    localStorage.setItem('blogs', JSON.stringify(blogs));
  }, [blogs]);

  const addBlog = (blogData: Omit<Blog, 'id' | 'createdAt' | 'updatedAt' | 'user_id'>) => {
    if (!user) throw new Error('User must be logged in to create a blog');
    
    const now = new Date().toISOString();
    const newBlog: Blog = {
      ...blogData,
      id: uuidv4(),
      user_id: user.id,
      createdAt: now,
      updatedAt: now,
    };
    
    setBlogs((prevBlogs) => [...prevBlogs, newBlog]);
    return newBlog;
  };

  const updateBlog = (id: string, blogData: Partial<Blog>) => {
    if (!user) return null;
    
    let updatedBlog: Blog | null = null;
    
    setBlogs((prevBlogs) => 
      prevBlogs.map((blog) => {
        // Only update blogs that belong to the current user
        if (blog.id === id && blog.user_id === user.id) {
          updatedBlog = {
            ...blog,
            ...blogData,
            updatedAt: new Date().toISOString(),
          };
          return updatedBlog;
        }
        return blog;
      })
    );
    
    return updatedBlog;
  };

  const deleteBlog = (id: string) => {
    if (!user) return;
    
    setBlogs((prevBlogs) => prevBlogs.filter((blog) => {
      // Only delete blogs that belong to the current user
      return !(blog.id === id && blog.user_id === user.id);
    }));
  };

  const getBlog = (id: string) => {
    if (!user) return undefined;
    return blogs.find((blog) => blog.id === id && blog.user_id === user.id);
  };

  const getPublishedBlogs = () => {
    return blogs.filter(blog => blog.status === "published");
  };

  const validateApiKey = (apiKey: string) => {
    if (!apiKey) return false;
    
    // Get all users
    const users = JSON.parse(localStorage.getItem('users') || '[]');
    
    // Check if the API key belongs to any user
    return users.some((u: any) => u.apiKey === apiKey);
  };

  return (
    <BlogContext.Provider value={{ 
      blogs: userBlogs, 
      addBlog, 
      updateBlog, 
      deleteBlog, 
      getBlog,
      getPublishedBlogs,
      validateApiKey
    }}>
      {children}
    </BlogContext.Provider>
  );
};
