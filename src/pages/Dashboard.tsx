
import React, { useMemo } from 'react';
import { Link } from 'react-router-dom';
import { useBlogContext } from '@/context/BlogContext';
import { useAuth } from '@/context/AuthContext';
import Layout from '@/components/Layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { PlusCircle, FileText, BookOpen, FileEdit, Rss, BarChart2, Clock, Calendar, Upload } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, Tooltip as RechartsTooltip, Cell } from 'recharts';

const Dashboard = () => {
  const { blogs } = useBlogContext();
  const { user } = useAuth();

  // Stats data
  const publishedBlogs = blogs.filter(blog => blog.status === "published").length;
  const draftBlogs = blogs.filter(blog => blog.status === "draft").length;
  const totalBlogs = blogs.length;
  const requestCount = user?.requestCount || 0;
  
  // Chart data
  const chartData = useMemo(() => {
    // Group blogs by month
    const lastSixMonths = Array.from({ length: 6 }, (_, i) => {
      const date = new Date();
      date.setMonth(date.getMonth() - i);
      return {
        month: date.toLocaleString('default', { month: 'short' }),
        timestamp: date.getTime(),
        count: 0
      };
    }).reverse();
    
    // Count blogs per month
    blogs.forEach(blog => {
      const blogDate = new Date(blog.createdAt);
      const blogMonth = blogDate.toLocaleString('default', { month: 'short' });
      const monthData = lastSixMonths.find(m => m.month === blogMonth);
      if (monthData) {
        monthData.count++;
      }
    });
    
    return lastSixMonths;
  }, [blogs]);
  
  // Get latest 5 blogs
  const latestBlogs = useMemo(() => {
    return [...blogs]
      .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())
      .slice(0, 5);
  }, [blogs]);

  return (
    <Layout>
      <div className="flex flex-col gap-8">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gradient glow-effect">Dashboard</h1>
            <p className="text-muted-foreground mt-1">Manage your blog content</p>
          </div>
          <Link to="/blogs/new">
            <Button className="bg-primary hover:bg-primary/90">
              <PlusCircle className="mr-2 h-4 w-4" />
              New Blog
            </Button>
          </Link>
        </div>

        {/* Stats overview */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <Card className="border border-border bg-card shadow-sm hover:shadow-md transition-shadow card-glow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Blogs</CardTitle>
              <FileText className="h-4 w-4 text-primary" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{totalBlogs}</div>
              <p className="text-xs text-muted-foreground mt-1">All blog posts in your system</p>
            </CardContent>
          </Card>
          <Card className="border border-border bg-card shadow-sm hover:shadow-md transition-shadow card-glow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Published Blogs</CardTitle>
              <BookOpen className="h-4 w-4 text-green-500" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{publishedBlogs}</div>
              <p className="text-xs text-muted-foreground mt-1">Public blogs available to readers</p>
            </CardContent>
          </Card>
          <Card className="border border-border bg-card shadow-sm hover:shadow-md transition-shadow card-glow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Draft Blogs</CardTitle>
              <FileEdit className="h-4 w-4 text-amber-500" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{draftBlogs}</div>
              <p className="text-xs text-muted-foreground mt-1">Blogs in progress, not yet published</p>
            </CardContent>
          </Card>
          <Card className="border border-border bg-card shadow-sm hover:shadow-md transition-shadow card-glow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">API Requests</CardTitle>
              <Upload className="h-4 w-4 text-blue-500" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{requestCount}</div>
              <p className="text-xs text-muted-foreground mt-1">Total API requests made</p>
            </CardContent>
          </Card>
        </div>

        {/* Blog statistics chart */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card className="border border-border bg-card shadow-sm card-glow">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="flex items-center">
                    <BarChart2 className="mr-2 h-5 w-5 text-primary" />
                    Blog Activity
                  </CardTitle>
                  <CardDescription>Blog creation over the last 6 months</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="h-[220px] mt-2">
                {chartData.length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={chartData} margin={{ top: 5, right: 5, left: -20, bottom: 5 }}>
                      <XAxis 
                        dataKey="month" 
                        axisLine={false}
                        tickLine={false}
                        tick={{ fill: '#9ca3af', fontSize: 12 }}
                      />
                      <YAxis 
                        hide={false}
                        axisLine={false}
                        tickLine={false}
                        tick={{ fill: '#9ca3af', fontSize: 12 }}
                        allowDecimals={false}
                      />
                      <RechartsTooltip
                        contentStyle={{ 
                          backgroundColor: 'hsl(var(--card))',
                          borderColor: 'hsl(var(--border))',
                          borderRadius: '0.5rem',
                          color: 'hsl(var(--foreground))'
                        }}
                        labelStyle={{ fontWeight: 'bold' }}
                      />
                      <Bar dataKey="count" radius={[4, 4, 0, 0]}>
                        {chartData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill="hsl(var(--primary))" />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="h-full flex items-center justify-center">
                    <p className="text-muted-foreground">No data available</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          <Card className="border border-border bg-card shadow-sm card-glow">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="flex items-center">
                    <Clock className="mr-2 h-5 w-5 text-primary" />
                    Recent Activity
                  </CardTitle>
                  <CardDescription>Your latest blog posts</CardDescription>
                </div>
                <Link to="/blogs">
                  <Button variant="outline" size="sm">View All</Button>
                </Link>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-5">
                {latestBlogs.length > 0 ? (
                  latestBlogs.map((blog) => (
                    <div key={blog.id} className="flex items-start space-x-4 p-3 rounded-lg hover:bg-secondary/50 transition-colors">
                      <div className="flex-shrink-0">
                        {blog.author_image ? (
                          <Avatar>
                            <AvatarImage src={blog.author_image} alt={blog.author_name} />
                            <AvatarFallback className="bg-secondary text-primary">
                              {blog.author_name.charAt(0)}
                            </AvatarFallback>
                          </Avatar>
                        ) : (
                          <Avatar>
                            <AvatarFallback className="bg-secondary text-primary">
                              {blog.author_name.charAt(0)}
                            </AvatarFallback>
                          </Avatar>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <h3 className="font-medium text-foreground truncate">{blog.title}</h3>
                          <TooltipProvider>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <div className={`px-2 py-1 rounded-full text-xs ${
                                  blog.status === "published" 
                                    ? "bg-green-500/20 text-green-500" 
                                    : "bg-amber-500/20 text-amber-500"
                                }`}>
                                  {blog.status === "published" ? "Published" : "Draft"}
                                </div>
                              </TooltipTrigger>
                              <TooltipContent>
                                {blog.status === "published" ? "This blog is public" : "This blog is still a draft"}
                              </TooltipContent>
                            </Tooltip>
                          </TooltipProvider>
                        </div>
                        <p className="text-sm text-muted-foreground truncate">
                          {blog.sub_title || "No subtitle"}
                        </p>
                        <div className="flex items-center mt-1 gap-1">
                          <Calendar className="h-3 w-3 text-muted-foreground" />
                          <span className="text-xs text-muted-foreground">
                            {new Date(blog.updatedAt).toLocaleDateString()}
                          </span>
                        </div>
                      </div>
                      <div className="flex-shrink-0 flex items-center space-x-2">
                        <Link to={`/blogs/edit/${blog.id}`}>
                          <Button variant="ghost" size="sm">Edit</Button>
                        </Link>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-8">
                    <Rss className="h-10 w-10 text-muted-foreground mx-auto mb-3" />
                    <p className="text-muted-foreground">No blogs yet. Create your first blog!</p>
                    <Link to="/blogs/new" className="mt-4 inline-block">
                      <Button className="bg-primary hover:bg-primary/90 mt-4">
                        <PlusCircle className="mr-2 h-4 w-4" />
                        Create Blog
                      </Button>
                    </Link>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </Layout>
  );
};

export default Dashboard;
