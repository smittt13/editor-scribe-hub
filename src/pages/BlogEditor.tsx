
import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useBlogContext } from '@/context/BlogContext';
import Layout from '@/components/Layout';
import Editor from '@/components/Editor';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Save, Eye, ArrowLeft, Clock } from 'lucide-react';
import { toast } from 'sonner';
import { Textarea } from '@/components/ui/textarea';
import { useAutosave } from './Settings';

const BlogEditor = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { getBlog, addBlog, updateBlog } = useBlogContext();
  const { autosaveEnabled, autosaveInterval } = useAutosave();
  
  const [title, setTitle] = useState('');
  const [subTitle, setSubTitle] = useState('');
  const [slug, setSlug] = useState('');
  const [authorName, setAuthorName] = useState('');
  const [authorImage, setAuthorImage] = useState('');
  const [coverImage, setCoverImage] = useState('');
  const [tags, setTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState('');
  const [priority, setPriority] = useState<number | undefined>(undefined);
  const [status, setStatus] = useState<"draft" | "published">("draft");
  const [editorData, setEditorData] = useState({});
  const [isSaving, setIsSaving] = useState(false);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  
  const autosaveTimerRef = useRef<number | null>(null);
  const hasUnsavedChanges = useRef<boolean>(false);

  const isEditMode = !!id;

  useEffect(() => {
    if (isEditMode) {
      const blog = getBlog(id);
      if (blog) {
        setTitle(blog.title);
        setSubTitle(blog.sub_title || '');
        setSlug(blog.slug);
        setAuthorName(blog.author_name);
        setAuthorImage(blog.author_image || '');
        setCoverImage(blog.cover_image || '');
        setTags(blog.tags || []);
        setPriority(blog.priority);
        setStatus(blog.status);
        setEditorData(blog.content);
        // Set last saved time to now when loading a saved blog
        setLastSaved(new Date());
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

  // Mark content as changed when any field changes
  useEffect(() => {
    hasUnsavedChanges.current = true;
  }, [title, subTitle, slug, authorName, authorImage, coverImage, tags, priority, status, editorData]);

  // Setup autosave timer
  useEffect(() => {
    if (autosaveEnabled && isEditMode) {
      // Clear existing timer if any
      if (autosaveTimerRef.current !== null) {
        window.clearInterval(autosaveTimerRef.current);
      }
      
      // Set new timer
      autosaveTimerRef.current = window.setInterval(() => {
        if (hasUnsavedChanges.current) {
          handleAutosave();
        }
      }, autosaveInterval * 1000);
    } else if (autosaveTimerRef.current !== null) {
      // Clear timer if autosave is disabled
      window.clearInterval(autosaveTimerRef.current);
      autosaveTimerRef.current = null;
    }
    
    // Cleanup on unmount
    return () => {
      if (autosaveTimerRef.current !== null) {
        window.clearInterval(autosaveTimerRef.current);
      }
    };
  }, [autosaveEnabled, autosaveInterval, isEditMode]);

  const handleEditorChange = (data: any) => {
    setEditorData(data);
  };

  const handleTagAdd = () => {
    if (tagInput.trim() && !tags.includes(tagInput.trim())) {
      setTags([...tags, tagInput.trim()]);
      setTagInput('');
    }
  };

  const handleTagRemove = (tagToRemove: string) => {
    setTags(tags.filter(tag => tag !== tagToRemove));
  };

  const handleAutosave = () => {
    if (!isEditMode || !id || !title) return;
    
    const blogData = {
      title,
      sub_title: subTitle,
      slug,
      author_name: authorName,
      author_image: authorImage,
      cover_image: coverImage,
      tags,
      priority: priority !== undefined ? priority : undefined,
      content: editorData,
      status: status,
    };

    try {
      updateBlog(id, blogData);
      setLastSaved(new Date());
      hasUnsavedChanges.current = false;
    } catch (error) {
      console.error('Autosave error:', error);
    }
  };

  const handleSave = (newStatus: "draft" | "published" = status) => {
    if (!title) {
      toast.error('Title is required');
      return;
    }

    if (!slug) {
      toast.error('Slug is required');
      return;
    }

    if (!authorName) {
      toast.error('Author name is required');
      return;
    }

    setIsSaving(true);

    try {
      const blogData = {
        title,
        sub_title: subTitle,
        slug,
        author_name: authorName,
        author_image: authorImage,
        cover_image: coverImage,
        tags,
        priority: priority !== undefined ? priority : undefined,
        content: editorData,
        status: newStatus,
      };

      if (isEditMode && id) {
        updateBlog(id, blogData);
        toast.success('Blog updated successfully');
        setLastSaved(new Date());
        hasUnsavedChanges.current = false;
      } else {
        const newBlog = addBlog(blogData);
        toast.success('Blog created successfully');
        setLastSaved(new Date());
        hasUnsavedChanges.current = false;
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
        
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900">
            {isEditMode ? 'Edit Blog' : 'Create New Blog'}
          </h1>
          
          {isEditMode && autosaveEnabled && (
            <div className="flex items-center text-sm text-muted-foreground">
              <Clock className="mr-1 h-4 w-4" />
              {lastSaved ? (
                <span>Last saved: {lastSaved.toLocaleTimeString()}</span>
              ) : (
                <span>Autosave enabled</span>
              )}
            </div>
          )}
        </div>

        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="title">Title *</Label>
              <Input
                id="title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Enter blog title"
                className="text-xl"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="subTitle">Subtitle</Label>
              <Input
                id="subTitle"
                value={subTitle}
                onChange={(e) => setSubTitle(e.target.value)}
                placeholder="Enter blog subtitle"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="slug">Slug *</Label>
            <Input
              id="slug"
              value={slug}
              onChange={(e) => setSlug(e.target.value)}
              placeholder="blog-post-slug"
              required
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="authorName">Author Name *</Label>
              <Input
                id="authorName"
                value={authorName}
                onChange={(e) => setAuthorName(e.target.value)}
                placeholder="Author name"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="authorImage">Author Image URL</Label>
              <Input
                id="authorImage"
                value={authorImage}
                onChange={(e) => setAuthorImage(e.target.value)}
                placeholder="https://example.com/author.jpg"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="coverImage">Cover Image URL</Label>
            <Input
              id="coverImage"
              value={coverImage}
              onChange={(e) => setCoverImage(e.target.value)}
              placeholder="https://example.com/cover.jpg"
            />
            {coverImage && (
              <div className="mt-2 w-full max-h-[200px] overflow-hidden rounded-md">
                <img 
                  src={coverImage} 
                  alt="Cover preview" 
                  className="w-full h-auto object-cover" 
                  onError={(e) => {
                    e.currentTarget.src = 'https://placehold.co/600x400?text=Invalid+Image+URL';
                  }}
                />
              </div>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="tags">Tags</Label>
            <div className="flex gap-2">
              <Input
                id="tags"
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                placeholder="Add tag and press Enter"
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleTagAdd();
                  }
                }}
              />
              <Button type="button" onClick={handleTagAdd} variant="outline">
                Add
              </Button>
            </div>
            {tags.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-2">
                {tags.map((tag) => (
                  <div 
                    key={tag} 
                    className="bg-gray-100 text-gray-800 px-3 py-1 rounded-full flex items-center gap-1"
                  >
                    <span>{tag}</span>
                    <button 
                      onClick={() => handleTagRemove(tag)}
                      className="text-gray-500 hover:text-gray-700"
                    >
                      &times;
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="priority">Priority</Label>
            <Input
              id="priority"
              type="number"
              value={priority !== undefined ? priority : ''}
              onChange={(e) => setPriority(e.target.value ? parseInt(e.target.value) : undefined)}
              placeholder="Enter priority number (optional)"
            />
          </div>

          <div className="flex items-center space-x-2">
            <Switch
              id="published"
              checked={status === "published"}
              onCheckedChange={(checked) => setStatus(checked ? "published" : "draft")}
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
              onClick={() => handleSave("draft")}
              disabled={isSaving}
            >
              <Save className="mr-2 h-4 w-4" />
              Save as Draft
            </Button>
            <Button
              onClick={() => handleSave("published")}
              disabled={isSaving}
              className="bg-teal-600 hover:bg-teal-700"
            >
              {isSaving ? 'Publishing...' : 'Publish'}
            </Button>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default BlogEditor;
