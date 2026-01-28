import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Heart, MessageCircle, ArrowLeft, Send, Copy } from 'lucide-react';
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

interface Template {
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
  sourcePageId?: string;
  content?: any;
  icon?: string;
  coverImage?: string;
}

export function TemplateDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [template, setTemplate] = useState<Template | null>(null);
  const [comments, setComments] = useState<Comment[]>([]);
  const [loading, setLoading] = useState(true);
  const [commentText, setCommentText] = useState('');
  const [submittingComment, setSubmittingComment] = useState(false);
  const [copying, setCopying] = useState(false);

  useEffect(() => {
    if (id) {
      loadTemplate();
      loadComments();
    }
  }, [id]);

  const loadTemplate = async () => {
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
        throw new Error('Failed to load template');
      }
      const data = await response.json();
      setTemplate(data);
    } catch (err) {
      console.error('Error loading template:', err);
      toast.error('Failed to load template');
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
        toast.error('Please login to like templates');
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
        throw new Error('Failed to like template');
      }

      const data = await response.json();
      if (template) {
        setTemplate({
          ...template,
          likes: data.likes,
          isLiked: data.isLiked,
        });
      }
    } catch (err) {
      console.error('Error liking template:', err);
      toast.error('Failed to like template');
    }
  };

  const handleCopyTemplate = async () => {
    try {
      const token = localStorage.getItem('lifeflow-token');
      if (!token) {
        toast.error('Please login to copy templates');
        return;
      }

      if (!template?.sourcePageId) {
        toast.error('Template source not available');
        return;
      }

      setCopying(true);
      const response = await fetch(`/api/feed/${id}/clone`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error('Failed to copy template');
      }

      const result = await response.json();
      toast.success('Template copied to your workspace!');
      
      // Navigate to the new page after a short delay
      setTimeout(() => {
        navigate(`/dashboard?pageId=${result.pageId}`);
      }, 1000);
    } catch (err) {
      console.error('Error copying template:', err);
      toast.error('Failed to copy template');
    } finally {
      setCopying(false);
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
      
      if (template) {
        setTemplate({ ...template, commentCount: template.commentCount + 1 });
      }
    } catch (err) {
      console.error('Error posting comment:', err);
      toast.error('Failed to post comment');
    } finally {
      setSubmittingComment(false);
    }
  };

  const handleAuthorClick = () => {
    if (template?.author?.id) {
      navigate(`/dashboard/user/${template.author.id}`);
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
        <p className="text-gray-500 dark:text-gray-400">Loading template...</p>
      </div>
    );
  }

  if (!template) {
    return (
      <div className="flex items-center justify-center h-full bg-white dark:bg-[#191919]">
        <p className="text-gray-500 dark:text-gray-400">Template not found</p>
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

      {/* Template Content */}
      <div className="max-w-4xl mx-auto px-8 py-12">
        {/* Cover Image */}
        {template.coverImage && (
          <div className="mb-8">
            <img
              src={template.coverImage}
              alt={template.title}
              className="w-full h-64 object-cover rounded-lg"
            />
          </div>
        )}

        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-2 mb-4">
            <span className="px-3 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 text-sm font-semibold rounded-full">
              Template
            </span>
            <span className="text-sm text-gray-500 dark:text-gray-500">
              {formatDate(template.createdAt)}
            </span>
          </div>

          <h1 className="text-4xl font-bold text-[#37352F] dark:text-[#E3E3E3] mb-4">
            {template.icon && <span className="mr-2">{template.icon}</span>}
            {template.title}
          </h1>

          {template.description && (
            <p className="text-xl text-gray-600 dark:text-gray-400 mb-6">
              {template.description}
            </p>
          )}

          {/* Tags */}
          {template.tags && template.tags.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-6">
              {template.tags.map((tag, index) => (
                <span
                  key={index}
                  className="px-3 py-1 bg-gray-100 dark:bg-[#2F2F2F] text-gray-700 dark:text-gray-300 text-sm rounded-full"
                >
                  {tag}
                </span>
              ))}
            </div>
          )}

          {/* Author and Copy Button */}
          <div className="flex items-center justify-between pb-6 border-b border-gray-200 dark:border-[#2F2F2F]">
            <div className="flex items-center gap-3">
              <div
                className="w-12 h-12 rounded-full bg-blue-600 text-white flex items-center justify-center text-sm font-semibold cursor-pointer"
                onClick={handleAuthorClick}
              >
                {template.author?.avatar || 'U'}
              </div>
              <div>
                <button
                  onClick={handleAuthorClick}
                  className="text-base font-medium text-[#37352F] dark:text-[#E3E3E3] hover:text-blue-600 dark:hover:text-blue-400 hover:underline transition-colors"
                >
                  {template.author?.name || 'Anonymous'}
                </button>
                <p className="text-sm text-gray-500 dark:text-gray-500">
                  {template.author?.email || ''}
                </p>
              </div>
            </div>

            {template.sourcePageId && (
              <motion.button
                onClick={handleCopyTemplate}
                disabled={copying}
                className="flex items-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <Copy size={18} />
                {copying ? 'Copying...' : 'Copy Template'}
              </motion.button>
            )}
          </div>
        </div>

        {/* Template Preview */}
        <div className="mb-12">
          <h2 className="text-2xl font-bold text-[#37352F] dark:text-[#E3E3E3] mb-4">
            Template Preview
          </h2>
          <div className="bg-gray-50 dark:bg-[#202020] rounded-lg p-6 border border-gray-200 dark:border-[#2F2F2F]">
            {template.content && (Array.isArray(template.content) ? template.content.length > 0 : (typeof template.content === 'string' && template.content !== '[]')) ? (
              <div className="blocknote-wrapper-readonly">
                <BlockNoteViewer content={template.content} />
              </div>
            ) : (
              <div className="text-center text-gray-600 dark:text-gray-400 py-8">
                Preview not available. Copy the template to use it.
              </div>
            )}
          </div>
        </div>

        {/* Like and Comment Section */}
        <div className="border-t border-b border-gray-200 dark:border-[#2F2F2F] py-4 mb-8">
          <div className="flex items-center gap-6">
            <motion.button
              onClick={handleLike}
              className={`flex items-center gap-2 transition-colors ${
                template.isLiked
                  ? 'text-red-600 dark:text-red-400'
                  : 'text-gray-600 dark:text-gray-400 hover:text-red-600 dark:hover:text-red-400'
              }`}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Heart
                className="w-5 h-5"
                fill={template.isLiked ? 'currentColor' : 'none'}
              />
              <span className="font-medium">{template.likes}</span>
            </motion.button>

            <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
              <MessageCircle className="w-5 h-5" />
              <span className="font-medium">{template.commentCount}</span>
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
