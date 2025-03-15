
import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useBlogContext } from '@/context/BlogContext';
import Layout from '@/components/Layout';
import { Button } from '@/components/ui/button';
import { Edit, ArrowLeft, Code } from 'lucide-react';
import { toast } from 'sonner';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger
} from '@/components/ui/dialog';

const BlogPreview = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { getBlog } = useBlogContext();
  const [blog, setBlog] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (id) {
      const blogData = getBlog(id);
      if (blogData) {
        setBlog(blogData);
      } else {
        toast.error('Blog not found');
        navigate('/blogs');
      }
    }
    setLoading(false);
  }, [id, getBlog, navigate]);

  if (loading) {
    return (
      <Layout>
        <div className="flex justify-center items-center h-96">
          <p>Loading...</p>
        </div>
      </Layout>
    );
  }

  if (!blog) {
    return (
      <Layout>
        <div className="flex flex-col items-center justify-center h-96">
          <p className="text-xl font-semibold mb-4">Blog not found</p>
          <Button onClick={() => navigate('/blogs')}>Go back to blogs</Button>
        </div>
      </Layout>
    );
  }

  const renderBlock = (block: any) => {
    switch (block.type) {
      case 'header':
        const HeaderTag = `h${block.data.level}` as keyof JSX.IntrinsicElements;
        return <HeaderTag className="mt-6 mb-4 font-bold">{block.data.text}</HeaderTag>;
      case 'paragraph':
        return <p className="my-4">{block.data.text}</p>;
      case 'list':
        const ListTag = block.data.style === 'ordered' ? 'ol' : 'ul';
        return (
          <ListTag className={block.data.style === 'ordered' ? 'list-decimal ml-5' : 'list-disc ml-5'}>
            {block.data.items.map((item: string, index: number) => (
              <li key={index} className="my-1">{item}</li>
            ))}
          </ListTag>
        );
      case 'image':
        return (
          <figure className="my-6">
            <img 
              src={block.data.file?.url} 
              alt={block.data.caption || 'Blog image'} 
              className="mx-auto rounded-md"
            />
            {block.data.caption && <figcaption className="text-center text-sm text-gray-500 mt-2">{block.data.caption}</figcaption>}
          </figure>
        );
      case 'quote':
        return (
          <blockquote className="border-l-4 border-gray-300 pl-4 italic my-6">
            <p>{block.data.text}</p>
            {block.data.caption && <footer className="text-right text-sm mt-1">— {block.data.caption}</footer>}
          </blockquote>
        );
      default:
        return <p className="text-gray-500 my-2">[Unsupported block type: {block.type}]</p>;
    }
  };

  return (
    <Layout>
      <div className="mb-8">
        <div className="flex justify-between items-center mb-6">
          <Button 
            variant="ghost" 
            onClick={() => navigate('/blogs')}
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Blogs
          </Button>

          <div className="flex space-x-2">
            <Dialog>
              <DialogTrigger asChild>
                <Button variant="outline">
                  <Code className="mr-2 h-4 w-4" />
                  View JSON
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-4xl">
                <DialogHeader>
                  <DialogTitle>Blog JSON Structure</DialogTitle>
                  <DialogDescription>
                    This is the raw JSON structure of the blog, which can be used for API responses.
                  </DialogDescription>
                </DialogHeader>
                <div className="bg-gray-900 text-gray-100 p-4 rounded-md overflow-auto max-h-[500px]">
                  <pre>{JSON.stringify(blog, null, 2)}</pre>
                </div>
              </DialogContent>
            </Dialog>

            <Link to={`/blogs/edit/${id}`}>
              <Button>
                <Edit className="mr-2 h-4 w-4" />
                Edit Blog
              </Button>
            </Link>
          </div>
        </div>

        <div className="bg-white shadow-lg rounded-lg p-8">
          <div className="mb-8">
            <h1 className="text-4xl font-bold mb-4">{blog.title}</h1>
            <div className="flex items-center text-sm text-gray-500">
              <span>Last updated: {new Date(blog.updatedAt).toLocaleDateString()}</span>
              <span className="mx-2">•</span>
              <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${
                blog.published ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
              }`}>
                {blog.published ? 'Published' : 'Draft'}
              </span>
            </div>
          </div>

          <div className="prose max-w-none">
            {blog.content && blog.content.blocks && 
              blog.content.blocks.map((block: any, index: number) => (
                <div key={index}>{renderBlock(block)}</div>
              ))
            }
            
            {(!blog.content || !blog.content.blocks || blog.content.blocks.length === 0) && (
              <div className="text-center py-12 text-gray-500">
                <p>This blog has no content yet.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default BlogPreview;
