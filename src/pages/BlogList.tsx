
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useBlogContext } from '@/context/BlogContext';
import Layout from '@/components/Layout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import { PlusCircle, Search, Edit, Eye, Trash2 } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle
} from '@/components/ui/dialog';
import { toast } from 'sonner';

const BlogList = () => {
  const { blogs, deleteBlog } = useBlogContext();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [deleteDialog, setDeleteDialog] = useState<{open: boolean, blogId: string | null}>({
    open: false,
    blogId: null
  });

  const filteredBlogs = blogs.filter(blog => {
    const matchesSearch = blog.title.toLowerCase().includes(searchTerm.toLowerCase());
    
    if (statusFilter === 'all') return matchesSearch;
    if (statusFilter === 'published') return matchesSearch && blog.published;
    if (statusFilter === 'draft') return matchesSearch && !blog.published;
    
    return matchesSearch;
  });

  const handleDeleteClick = (blogId: string) => {
    setDeleteDialog({ open: true, blogId });
  };

  const confirmDelete = () => {
    if (deleteDialog.blogId) {
      deleteBlog(deleteDialog.blogId);
      toast.success('Blog deleted successfully');
      setDeleteDialog({ open: false, blogId: null });
    }
  };

  return (
    <Layout>
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Blogs</h1>
        <Link to="/blogs/new">
          <Button className="bg-teal-600 hover:bg-teal-700">
            <PlusCircle className="mr-2 h-4 w-4" />
            New Blog
          </Button>
        </Link>
      </div>

      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
          <Input
            type="text"
            placeholder="Search blogs..."
            className="pl-9"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <Select
          value={statusFilter}
          onValueChange={setStatusFilter}
        >
          <SelectTrigger className="w-full sm:w-[180px]">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="published">Published</SelectItem>
            <SelectItem value="draft">Draft</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="bg-white shadow overflow-hidden sm:rounded-md">
        {filteredBlogs.length > 0 ? (
          <ul className="divide-y divide-gray-200">
            {filteredBlogs.map((blog) => (
              <li key={blog.id}>
                <div className="px-4 py-5 sm:px-6 flex justify-between items-center">
                  <div>
                    <h3 className="text-lg font-medium text-gray-900">{blog.title}</h3>
                    <div className="mt-1 flex items-center">
                      <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        blog.published ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                      }`}>
                        {blog.published ? 'Published' : 'Draft'}
                      </span>
                      <span className="ml-2 text-sm text-gray-500">
                        Last updated {new Date(blog.updatedAt).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                  <div className="flex space-x-2">
                    <Link to={`/blogs/edit/${blog.id}`}>
                      <Button variant="outline" size="sm">
                        <Edit className="h-4 w-4 mr-1" /> Edit
                      </Button>
                    </Link>
                    <Link to={`/blogs/preview/${blog.id}`}>
                      <Button variant="ghost" size="sm">
                        <Eye className="h-4 w-4 mr-1" /> Preview
                      </Button>
                    </Link>
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      className="text-red-600 hover:text-red-700 hover:bg-red-50"
                      onClick={() => handleDeleteClick(blog.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        ) : (
          <div className="text-center py-12">
            <p className="text-gray-500 mb-4">No blogs found matching your filters</p>
            <Link to="/blogs/new">
              <Button className="bg-teal-600 hover:bg-teal-700">
                <PlusCircle className="mr-2 h-4 w-4" />
                Create Blog
              </Button>
            </Link>
          </div>
        )}
      </div>

      <Dialog open={deleteDialog.open} onOpenChange={(open) => !open && setDeleteDialog({ open, blogId: null })}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Are you sure you want to delete this blog?</DialogTitle>
            <DialogDescription>
              This action cannot be undone. This will permanently delete the blog and remove it from our servers.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteDialog({ open: false, blogId: null })}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={confirmDelete}>
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Layout>
  );
};

export default BlogList;
