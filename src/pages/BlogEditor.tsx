
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useBlogContext } from '@/context/BlogContext';
import Layout from '@/components/Layout';
import Editor from '@/components/Editor';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Save, Eye, ArrowLeft } from 'lucide-react';
import { toast } from 'sonner';

const BlogEditor = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { getBlog, addBlog, updateBlog } = useBlogContext();
  
  const [title, setTitle] = useState('');
  const [slug, setSlug] = useState('');
  const [published, setPublished] = useState(false);
  const [editorData, setEditorData] = useState({});
  const [isSaving, setIsSaving] = useState(false);

  const isEditMode = !!id;

  useEffect(() => {
    if (isEditMode) {
      const blog = getBlog(id);
      if (blog) {
        setTitle(blog.title);
        setSlug(blog.slug);
        setPublished(blog.published);
        setEditorData(blog.content);
      } else {
        toast.error('Blog not found');
        navigate('/blogs');
      }
    }
  }, [id, getBlog, navigate, isEditMode]);

  useEffect(() => {
    if (title && !isEditMode) {
      setSlug(title.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, ''));
    }
  }, [title, isEditMode]);

  const handleEditorChange = (data: any) => {
    setEditorData(data);
  };

  const handleSave = (status: boolean = published) => {
    if (!title) {
      toast.error('Title is required');
      return;
    }

    if (!slug) {
      toast.error('Slug is required');
      return;
    }

    setIsSaving(true);

    try {
      if (isEditMode && id) {
        updateBlog(id, {
          title,
          slug,
          content: editorData,
          published: status,
        });
        toast.success('Blog updated successfully');
      } else {
        const newBlog = addBlog({
          title,
          slug,
          content: editorData,
          published: status,
        });
        toast.success('Blog created successfully');
        // Navigate to edit mode with the new ID
        navigate(`/blogs/edit/${newBlog.id}`);
      }
    } catch (error) {
      toast.error('An error occurred while saving the blog');
      console.error(error);
    } finally {
      setIsSaving(false);
    }
  };

  const handlePreview = () => {
    if (isEditMode && id) {
      navigate(`/blogs/preview/${id}`);
    } else {
      toast.error('Please save the blog first to preview');
    }
  };

  return (
    <Layout>
      <div className="mb-8">
        <Button 
          variant="ghost" 
          className="mb-4"
          onClick={() => navigate('/blogs')}
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Blogs
        </Button>
        
        <h1 className="text-3xl font-bold text-gray-900 mb-8">
          {isEditMode ? 'Edit Blog' : 'Create New Blog'}
        </h1>

        <div className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="title">Title</Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Enter blog title"
              className="text-xl"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="slug">Slug</Label>
            <Input
              id="slug"
              value={slug}
              onChange={(e) => setSlug(e.target.value)}
              placeholder="blog-post-slug"
            />
          </div>

          <div className="flex items-center space-x-2">
            <Switch
              id="published"
              checked={published}
              onCheckedChange={setPublished}
            />
            <Label htmlFor="published">Published</Label>
          </div>

          <div className="space-y-2">
            <Label>Content</Label>
            <div className="border rounded-md">
              <Editor data={editorData} onChange={handleEditorChange} />
            </div>
          </div>

          <div className="flex justify-end space-x-4 pt-6">
            <Button
              variant="outline"
              onClick={handlePreview}
              disabled={!isEditMode || isSaving}
            >
              <Eye className="mr-2 h-4 w-4" />
              Preview
            </Button>
            <Button
              variant="outline"
              onClick={() => handleSave(false)}
              disabled={isSaving}
            >
              Save as Draft
            </Button>
            <Button
              onClick={() => handleSave(true)}
              disabled={isSaving}
              className="bg-teal-600 hover:bg-teal-700"
            >
              {isSaving ? 'Saving...' : 'Publish'}
            </Button>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default BlogEditor;
