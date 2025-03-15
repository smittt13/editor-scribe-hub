
import React from 'react';
import { Link } from 'react-router-dom';
import { useBlogContext } from '@/context/BlogContext';
import Layout from '@/components/Layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { PlusCircle, FileText, Eye } from 'lucide-react';

const Dashboard = () => {
  const { blogs } = useBlogContext();
  
  const publishedBlogs = blogs.filter(blog => blog.status === "published").length;
  const draftBlogs = blogs.filter(blog => blog.status === "draft").length;
  const totalBlogs = blogs.length;
  
  // Get latest 5 blogs
  const latestBlogs = [...blogs]
    .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())
    .slice(0, 5);

  return (
    <Layout>
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-foreground">Dashboard</h1>
        <Link to="/blogs/new">
          <Button className="bg-primary hover:bg-primary/90">
            <PlusCircle className="mr-2 h-4 w-4" />
            New Blog
          </Button>
        </Link>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 mb-8">
        <Card className="border border-border bg-card shadow-sm hover:shadow-md transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Blogs</CardTitle>
            <FileText className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalBlogs}</div>
            <p className="text-xs text-muted-foreground">All blog posts in your system</p>
          </CardContent>
        </Card>
        <Card className="border border-border bg-card shadow-sm hover:shadow-md transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Published Blogs</CardTitle>
            <Eye className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{publishedBlogs}</div>
            <p className="text-xs text-muted-foreground">Blogs currently published</p>
          </CardContent>
        </Card>
        <Card className="border border-border bg-card shadow-sm hover:shadow-md transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Draft Blogs</CardTitle>
            <FileText className="h-4 w-4 text-gray-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{draftBlogs}</div>
            <p className="text-xs text-muted-foreground">Blogs in draft status</p>
          </CardContent>
        </Card>
      </div>

      <Card className="mb-8 border border-border bg-card shadow-sm">
        <CardHeader>
          <CardTitle>Recent Blogs</CardTitle>
          <CardDescription>Your latest blog posts</CardDescription>
        </CardHeader>
        <CardContent>
          {latestBlogs.length > 0 ? (
            <div className="space-y-4">
              {latestBlogs.map((blog) => (
                <div key={blog.id} className="flex justify-between items-center border-b pb-4">
                  <div>
                    <h3 className="font-medium">{blog.title}</h3>
                    <p className="text-sm text-gray-500">
                      {new Date(blog.updatedAt).toLocaleDateString()} · 
                      {blog.status === "published" ? ' Published' : ' Draft'}
                    </p>
                  </div>
                  <div className="flex space-x-2">
                    <Link to={`/blogs/edit/${blog.id}`}>
                      <Button variant="outline" size="sm">Edit</Button>
                    </Link>
                    <Link to={`/blogs/preview/${blog.id}`}>
                      <Button size="sm" variant="ghost">Preview</Button>
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-4">
              <p className="text-gray-500">No blogs yet. Create your first blog!</p>
              <Link to="/blogs/new" className="mt-2 inline-block">
                <Button className="bg-primary hover:bg-primary/90 mt-4">
                  <PlusCircle className="mr-2 h-4 w-4" />
                  Create Blog
                </Button>
              </Link>
            </div>
          )}
        </CardContent>
      </Card>
    </Layout>
  );
};

export default Dashboard;
