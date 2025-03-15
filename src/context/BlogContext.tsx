
import React, { createContext, useContext, useState, useEffect } from 'react';
import { v4 as uuidv4 } from 'uuid';

export interface Blog {
  id: string;
  user_id?: string;
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
  addBlog: (blog: Omit<Blog, 'id' | 'createdAt' | 'updatedAt'>) => Blog;
  updateBlog: (id: string, blog: Partial<Blog>) => Blog | null;
  deleteBlog: (id: string) => void;
  getBlog: (id: string) => Blog | undefined;
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
  const [blogs, setBlogs] = useState<Blog[]>(() => {
    const savedBlogs = localStorage.getItem('blogs');
    return savedBlogs ? JSON.parse(savedBlogs) : [];
  });

  useEffect(() => {
    localStorage.setItem('blogs', JSON.stringify(blogs));
  }, [blogs]);

  const addBlog = (blogData: Omit<Blog, 'id' | 'createdAt' | 'updatedAt'>) => {
    const now = new Date().toISOString();
    const newBlog: Blog = {
      ...blogData,
      id: uuidv4(),
      createdAt: now,
      updatedAt: now,
    };
    setBlogs((prevBlogs) => [...prevBlogs, newBlog]);
    return newBlog;
  };

  const updateBlog = (id: string, blogData: Partial<Blog>) => {
    let updatedBlog: Blog | null = null;
    
    setBlogs((prevBlogs) => 
      prevBlogs.map((blog) => {
        if (blog.id === id) {
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
    setBlogs((prevBlogs) => prevBlogs.filter((blog) => blog.id !== id));
  };

  const getBlog = (id: string) => {
    return blogs.find((blog) => blog.id === id);
  };

  return (
    <BlogContext.Provider value={{ blogs, addBlog, updateBlog, deleteBlog, getBlog }}>
      {children}
    </BlogContext.Provider>
  );
};
