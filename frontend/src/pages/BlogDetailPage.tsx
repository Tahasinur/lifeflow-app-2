import { useState, useEffect, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Heart, MessageCircle, ArrowLeft, Send } from 'lucide-react';
import { toast } from 'sonner';
import { motion } from 'framer-motion';
import { BlockNoteViewer } from '../components/BlockNoteViewer';

interface Author {
  id: string;
  name: string;
  email: string;
  avatar: string;
}

interface Comment {
  id: string;
  text: string;
  author: Author;
  createdAt: string;
}

interface BlogPost {
  id: string;
  title: string;
  description: string;
  author: Author;
  type: string;
  likes: number;
  tags: string[];
  commentCount: number;
  createdAt: string;
  isLiked: boolean;
  content?: any;
  icon?: string;
  coverImage?: string;
}

export function BlogDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [blog, setBlog] = useState<BlogPost | null>(null);
  const [comments, setComments] = useState<Comment[]>([]);
  const [loading, setLoading] = useState(true);
  const [commentText, setCommentText] = useState('');
  const [submittingComment, setSubmittingComment] = useState(false);

  useEffect(() => {
    if (id) {
      loadBlogPost();
      loadComments();
    }
  }, [id]);

  const loadBlogPost = async () => {
    try {
      const token = localStorage.getItem('lifeflow-token');
      const headers: HeadersInit = {
        'Content-Type': 'application/json',
      };
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }

      const response = await fetch(`/api/feed/${id}`, { headers });
      if (!response.ok) {
        throw new Error('Failed to load blog post');
      }
      const data = await response.json();
      setBlog(data);
    } catch (err) {
      console.error('Error loading blog:', err);
      toast.error('Failed to load blog post');
      navigate('/dashboard/feed');
    } finally {
      setLoading(false);
    }
  };

  const loadComments = async () => {
    try {
      const response = await fetch(`/api/feed/${id}/comments`);
      if (response.ok) {
        const data = await response.json();
        setComments(data);
      }
    } catch (err) {
      console.error('Error loading comments:', err);
    }
  };

  const handleLike = async () => {
    try {
      const token = localStorage.getItem('lifeflow-token');
      if (!token) {
        toast.error('Please login to like posts');
        return;
      }

      const response = await fetch(`/api/feed/${id}/like`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error('Failed to like post');
      }

      const data = await response.json();
      if (blog) {
        setBlog({
          ...blog,
          likes: data.likes,
          isLiked: data.isLiked,
        });
      }
    } catch (err) {
      console.error('Error liking post:', err);
      toast.error('Failed to like post');
    }
  };

  const handleSubmitComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!commentText.trim()) return;

    try {
      const token = localStorage.getItem('lifeflow-token');
      if (!token) {
        toast.error('Please login to comment');
        return;
      }

      setSubmittingComment(true);
      const response = await fetch(`/api/feed/${id}/comments`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ text: commentText }),
      });

      if (!response.ok) {
        throw new Error('Failed to post comment');
      }

      const newComment = await response.json();
      setComments([newComment, ...comments]);
      setCommentText('');
      toast.success('Comment posted!');
      
      // Update comment count
      if (blog) {
        setBlog({ ...blog, commentCount: blog.commentCount + 1 });
      }
    } catch (err) {
      console.error('Error posting comment:', err);
      toast.error('Failed to post comment');
    } finally {
      setSubmittingComment(false);
    }
  };

  const handleAuthorClick = () => {
    if (blog?.author?.id) {
      navigate(`/dashboard/user/${blog.author.id}`);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      month: 'long', 
      day: 'numeric', 
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full bg-white dark:bg-[#191919]">
        <p className="text-gray-500 dark:text-gray-400">Loading blog post...</p>
      </div>
    );
  }

  if (!blog) {
    return (
      <div className="flex items-center justify-center h-full bg-white dark:bg-[#191919]">
        <p className="text-gray-500 dark:text-gray-400">Blog post not found</p>
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-auto bg-white dark:bg-[#191919]">
      {/* Back Button */}
      <div className="sticky top-0 z-10 bg-white dark:bg-[#191919] border-b border-gray-200 dark:border-[#2F2F2F] px-8 py-4">
        <button
          onClick={() => navigate('/dashboard/feed')}
          className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400 hover:text-[#37352F] dark:hover:text-[#E3E3E3] transition-colors"
        >
          <ArrowLeft size={16} />
          Back to Feed
        </button>
      </div>

      {/* Blog Content */}
      <div className="max-w-4xl mx-auto px-8 py-12">
        {/* Cover Image */}
        {blog.coverImage && (
          <div className="mb-8">
            <img
              src={blog.coverImage}
              alt={blog.title}
              className="w-full h-64 object-cover rounded-lg"
            />
          </div>
        )}

        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-2 mb-4">
            <span className="px-3 py-1 bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-400 text-sm font-semibold rounded-full">
              Blog
            </span>
            <span className="text-sm text-gray-500 dark:text-gray-500">
              {formatDate(blog.createdAt)}
            </span>
          </div>

          <h1 className="text-4xl font-bold text-[#37352F] dark:text-[#E3E3E3] mb-4">
            {blog.icon && <span className="mr-2">{blog.icon}</span>}
            {blog.title}
          </h1>

          {blog.description && (
            <p className="text-xl text-gray-600 dark:text-gray-400 mb-6">
              {blog.description}
            </p>
          )}

          {/* Tags */}
          {blog.tags && blog.tags.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-6">
              {blog.tags.map((tag, index) => (
                <span
                  key={index}
                  className="px-3 py-1 bg-gray-100 dark:bg-[#2F2F2F] text-gray-700 dark:text-gray-300 text-sm rounded-full"
                >
                  {tag}
                </span>
              ))}
            </div>
          )}

          {/* Author */}
          <div className="flex items-center gap-3 pb-6 border-b border-gray-200 dark:border-[#2F2F2F]">
            <div
              className="w-12 h-12 rounded-full bg-blue-600 text-white flex items-center justify-center text-sm font-semibold cursor-pointer"
              onClick={handleAuthorClick}
            >
              {blog.author?.avatar || 'U'}
            </div>
            <div>
              <button
                onClick={handleAuthorClick}
                className="text-base font-medium text-[#37352F] dark:text-[#E3E3E3] hover:text-blue-600 dark:hover:text-blue-400 hover:underline transition-colors"
              >
                {blog.author?.name || 'Anonymous'}
              </button>
              <p className="text-sm text-gray-500 dark:text-gray-500">
                {blog.author?.email || ''}
              </p>
            </div>
          </div>
        </div>

        {/* Blog Body */}
        {/* Blog Body */}
        {/* Blog Body */}
        <div className="prose dark:prose-invert max-w-none mb-12">
          {blog.content && (Array.isArray(blog.content) ? blog.content.length > 0 : (typeof blog.content === 'string' && blog.content !== '[]')) ? (
             <BlockNoteViewer content={blog.content} />
          ) : (
            <div className="text-gray-600 dark:text-gray-400 whitespace-pre-wrap">
              {blog.description}
            </div>
          )}
        </div>

        {/* Like and Comment Section */}
        <div className="border-t border-b border-gray-200 dark:border-[#2F2F2F] py-4 mb-8">
          <div className="flex items-center gap-6">
            <motion.button
              onClick={handleLike}
              className={`flex items-center gap-2 transition-colors ${
                blog.isLiked
                  ? 'text-red-600 dark:text-red-400'
                  : 'text-gray-600 dark:text-gray-400 hover:text-red-600 dark:hover:text-red-400'
              }`}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Heart
                className="w-5 h-5"
                fill={blog.isLiked ? 'currentColor' : 'none'}
              />
              <span className="font-medium">{blog.likes}</span>
            </motion.button>

            <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
              <MessageCircle className="w-5 h-5" />
              <span className="font-medium">{blog.commentCount}</span>
            </div>
          </div>
        </div>

        {/* Comments Section */}
        <div>
          <h2 className="text-2xl font-bold text-[#37352F] dark:text-[#E3E3E3] mb-6">
            Comments ({comments.length})
          </h2>

          {/* Comment Form */}
          <form onSubmit={handleSubmitComment} className="mb-8">
            <div className="flex gap-3">
              <input
                type="text"
                value={commentText}
                onChange={(e) => setCommentText(e.target.value)}
                placeholder="Add a comment..."
                className="flex-1 px-4 py-3 border border-gray-300 dark:border-[#3F3F3F] rounded-lg bg-white dark:bg-[#191919] text-[#37352F] dark:text-[#E3E3E3] placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                disabled={submittingComment}
              />
              <motion.button
                type="submit"
                disabled={!commentText.trim() || submittingComment}
                className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <Send size={18} />
                Post
              </motion.button>
            </div>
          </form>

          {/* Comments List */}
          <div className="space-y-6">
            {comments.length === 0 ? (
              <p className="text-center text-gray-500 dark:text-gray-400 py-8">
                No comments yet. Be the first to comment!
              </p>
            ) : (
              comments.map((comment) => (
                <motion.div
                  key={comment.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-gray-50 dark:bg-[#202020] rounded-lg p-4"
                >
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 rounded-full bg-blue-600 text-white flex items-center justify-center text-sm font-semibold flex-shrink-0">
                      {comment.author?.avatar || 'U'}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-medium text-[#37352F] dark:text-[#E3E3E3]">
                          {comment.author?.name || 'Anonymous'}
                        </span>
                        <span className="text-sm text-gray-500 dark:text-gray-500">
                          {formatDate(comment.createdAt)}
                        </span>
                      </div>
                      <p className="text-[#37352F] dark:text-[#E3E3E3]">
                        {comment.text}
                      </p>
                    </div>
                  </div>
                </motion.div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}


