import { useState, useEffect } from 'react';
import { Heart, MessageCircle, Copy, Plus, Send, X, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';
import { FeedItem, Comment, FeedUser } from '../types';
import { ShareModal } from '../components/ShareModal';

export function FeedPage() {
  const [feedItems, setFeedItems] = useState<FeedItem[]>([]);
  const [filter, setFilter] = useState('all');
  const [likedItems, setLikedItems] = useState<Set<string>>(new Set());
  const [commentingOn, setCommentingOn] = useState<string | null>(null);
  const [commentText, setCommentText] = useState('');
  const [comments, setComments] = useState<Comment[]>([]);
  const [loadingComments, setLoadingComments] = useState(false);
  const [showShareModal, setShowShareModal] = useState(false);
  const [currentUser, setCurrentUser] = useState<FeedUser | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    loadFeed();
    loadCurrentUser();
  }, []);

  const loadCurrentUser = () => {
    const storedUser = localStorage.getItem('lifeflow-user');
    if (storedUser) {
      const parsed = JSON.parse(storedUser);
      setCurrentUser(parsed);
    }
  };

  const loadFeed = async () => {
    try {
      const res = await fetch(`/api/feed?t=${Date.now()}`);
      if (res.ok) {
        const data = await res.json();
        const sortedData = data.sort((a: FeedItem, b: FeedItem) => 
            new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        );
        setFeedItems(sortedData);
      }
    } catch (err) {
      console.error("Failed to load feed:", err);
      toast.error("Could not load feed");
    }
  };

  const filteredFeed = feedItems.filter((item) => {
    if (filter === 'all') return true;
    return item.type === filter;
  });

  const toggleLike = async (itemId: string) => {
    setLikedItems((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(itemId)) newSet.delete(itemId);
      else newSet.add(itemId);
      return newSet;
    });
    try {
        await fetch(`/api/feed/${itemId}/like`, { method: 'POST' });
        loadFeed();
    } catch (e) { console.error(e); }
  };

  const openComments = async (itemId: string) => {
    setCommentingOn(itemId);
    setLoadingComments(true);
    try {
      const res = await fetch(`/api/feed/${itemId}/comments`);
      if (res.ok) {
        const data = await res.json();
        setComments(data);
      }
    } catch (err) {
      console.error("Failed to load comments:", err);
    } finally {
      setLoadingComments(false);
    }
  };

  const submitComment = async () => {
    if (!commentingOn || !commentText.trim()) return;
    
    const headers: Record<string, string> = { 'Content-Type': 'application/json' };
    if (currentUser?.id) {
      headers['X-User-Id'] = currentUser.id;
    }

    try {
      const res = await fetch(`/api/feed/${commentingOn}/comments`, {
        method: 'POST',
        headers,
        body: JSON.stringify({
          text: commentText,
          authorName: currentUser?.name || "Anonymous",
          authorEmail: currentUser?.email || "anonymous@example.com",
          userId: currentUser?.id
        })
      });
      if (res.ok) {
        setCommentText('');
        openComments(commentingOn);
        loadFeed();
        toast.success("Comment added!");
      }
    } catch (err) {
      toast.error("Failed to add comment");
    }
  };

  const deletePost = async (itemId: string) => {
    if (!confirm('Are you sure you want to delete this post?')) return;
    
    const headers: Record<string, string> = {};
    if (currentUser?.id) {
      headers['X-User-Id'] = currentUser.id;
    }

    try {
      const res = await fetch(`/api/feed/${itemId}`, {
        method: 'DELETE',
        headers
      });
      if (res.ok) {
        toast.success("Post deleted!");
        loadFeed();
      } else {
        const error = await res.json();
        toast.error(error.error || "Failed to delete post");
      }
    } catch (err) {
      toast.error("Failed to delete post");
    }
  };

  const deleteComment = async (commentId: string) => {
    if (!commentingOn) return;
    
    const headers: Record<string, string> = {};
    if (currentUser?.id) {
      headers['X-User-Id'] = currentUser.id;
    }

    try {
      const res = await fetch(`/api/feed/${commentingOn}/comments/${commentId}`, {
        method: 'DELETE',
        headers
      });
      if (res.ok) {
        toast.success("Comment deleted!");
        openComments(commentingOn);
        loadFeed();
      } else {
        const error = await res.json();
        toast.error(error.error || "Failed to delete comment");
      }
    } catch (err) {
      toast.error("Failed to delete comment");
    }
  };

  const cloneTemplate = async (item: FeedItem) => {
    const headers: Record<string, string> = { 'Content-Type': 'application/json' };
    if (currentUser?.id) {
      headers['X-User-Id'] = currentUser.id;
    }

    try {
      const res = await fetch(`/api/feed/${item.id}/clone`, {
        method: 'POST',
        headers,
        body: JSON.stringify({ userId: currentUser?.id })
      });
      
      if (res.ok) {
        const data = await res.json();
        toast.success(data.message || "Template cloned!");
        navigate(`/page/${data.pageId}`);
      } else {
        const error = await res.json();
        toast.error(error.error || "Failed to clone template");
      }
    } catch (err) {
      toast.error("Failed to clone template");
    }
  };

  const getActionText = (type: FeedItem['type']) => {
    switch (type) {
      case 'template': return 'shared a template';
      case 'blog': return 'wrote a blog';
      case 'workspace_update': return 'shared a workspace update';
    }
  };

  const getAuthorAvatar = (item: FeedItem) => {
    if (item.author?.avatar) return item.author.avatar;
    if (item.author?.name) return item.author.name.substring(0, 2).toUpperCase();
    return "??";
  };

  const getAuthorName = (item: FeedItem) => {
    return item.author?.name || "Anonymous";
  };

  const isOwnPost = (item: FeedItem) => {
    return currentUser?.id && item.author?.id === currentUser.id;
  };

  const isOwnComment = (comment: Comment) => {
    return currentUser?.id && comment.author?.id === currentUser.id;
  };

  const navigateToProfile = (authorId: string) => {
    navigate(`/profile/${authorId}`);
  };

  return (
    <div className="flex flex-col h-full bg-white dark:bg-[#191919]">
      <div className="border-b border-gray-200 dark:border-[#2F2F2F] bg-white dark:bg-[#191919] px-6 py-6">
        <div className="flex justify-between items-start">
            <div>
                <h1 className="text-3xl font-semibold text-[#37352F] dark:text-[#FFFFFF]">Discover</h1>
                <p className="text-sm mt-2 text-[#9B9A97]">See what others are building</p>
            </div>
            <button 
                onClick={() => setShowShareModal(true)}
                className="flex items-center gap-2 px-3 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 text-sm"
            >
                <Plus size={16} />
                Share to Feed
            </button>
        </div>

        <div className="flex gap-2 mt-6">
          {['all', 'template', 'blog'].map((f) => (
             <button
                key={f}
                onClick={() => setFilter(f)}
                className={`px-4 py-2 text-sm rounded-full transition-colors capitalize ${
                  filter === f
                    ? 'bg-black dark:bg-[#E3E3E3] text-white dark:text-[#191919]'
                    : 'bg-gray-100 dark:bg-[#2F2F2F] hover:bg-gray-200 dark:hover:bg-[#3F3F3F] text-[#37352F] dark:text-[#E3E3E3]'
                }`}
              >
                {f}
              </button>
          ))}
        </div>
      </div>

      <div className="flex-1 overflow-auto bg-white dark:bg-[#191919]">
        <div className="max-w-3xl mx-auto px-6 py-8">
            {filteredFeed.length === 0 && (
                <div className="text-center text-gray-500 mt-10">
                    No posts yet. Click "Share to Feed" to start!
                </div>
            )}

          <div className="space-y-6">
            {filteredFeed.map((item) => (
              <div key={item.id} className="bg-white dark:bg-[#202020] border border-gray-200 dark:border-[#2F2F2F] rounded-lg p-6 hover:border-gray-300 dark:hover:border-[#3F3F3F] transition-colors">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <button 
                        onClick={() => item.author?.id && navigateToProfile(item.author.id)}
                        className="w-10 h-10 rounded-full flex items-center justify-center bg-[#37352F] dark:bg-[#E3E3E3] text-white dark:text-[#191919] font-medium text-sm hover:ring-2 hover:ring-blue-500 transition-all"
                      >
                        {getAuthorAvatar(item)}
                      </button>
                      <div>
                        <div className="text-sm font-medium text-[#37352F] dark:text-[#E3E3E3]">
                          <button 
                            onClick={() => item.author?.id && navigateToProfile(item.author.id)}
                            className="hover:underline hover:text-blue-600"
                          >
                            {getAuthorName(item)}
                          </button>
                          <span className="font-normal ml-1 text-[#9B9A97]">{getActionText(item.type)}</span>
                        </div>
                        <div className="text-xs text-[#9B9A97]">{new Date(item.createdAt).toLocaleDateString()}</div>
                      </div>
                    </div>
                    {isOwnPost(item) && (
                      <button
                        onClick={() => deletePost(item.id)}
                        className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                        title="Delete post"
                      >
                        <Trash2 size={16} />
                      </button>
                    )}
                  </div>

                  <div className="mb-4">
                    <h2 className="text-xl font-semibold mb-2 text-[#37352F] dark:text-[#FFFFFF]">{item.title}</h2>
                    <p className="text-sm leading-relaxed text-[#37352F] dark:text-[#E3E3E3]">{item.description}</p>
                  </div>

                  {item.tags && item.tags.length > 0 && (
                    <div className="flex gap-2 mb-4 flex-wrap">
                      {item.tags.map((tag, idx) => (
                        <span key={idx} className="px-2 py-1 bg-gray-100 dark:bg-[#2F2F2F] text-xs rounded-full text-[#37352F] dark:text-[#E3E3E3]">
                          {tag}
                        </span>
                      ))}
                    </div>
                  )}

                  <div className="flex items-center gap-3 pt-4 border-t border-gray-100 dark:border-[#2F2F2F]">
                    <button 
                      onClick={() => toggleLike(item.id)} 
                      className={`flex items-center gap-2 px-3 py-2 text-sm rounded-lg hover:bg-gray-50 dark:hover:bg-[#2F2F2F] transition-colors ${likedItems.has(item.id) ? 'text-red-500' : 'text-[#37352F] dark:text-[#E3E3E3]'}`}
                    >
                      <Heart size={16} fill={likedItems.has(item.id) ? 'currentColor' : 'none'} />
                      <span>{item.likes}</span>
                    </button>
                    
                    <button 
                      onClick={() => openComments(item.id)} 
                      className="flex items-center gap-2 px-3 py-2 text-sm rounded-lg hover:bg-gray-50 dark:hover:bg-[#2F2F2F] transition-colors text-[#37352F] dark:text-[#E3E3E3]"
                    >
                      <MessageCircle size={16} />
                      <span>{item.commentCount || 0}</span>
                    </button>

                    {item.type === 'template' && item.sourcePageId && (
                      <button 
                        onClick={() => cloneTemplate(item)} 
                        className="flex items-center gap-2 px-3 py-2 text-sm rounded-lg bg-blue-50 dark:bg-blue-900/20 hover:bg-blue-100 dark:hover:bg-blue-900/30 transition-colors text-blue-600 dark:text-blue-400 ml-auto"
                      >
                        <Copy size={16} />
                        <span>Clone to My Workspace</span>
                      </button>
                    )}
                  </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {commentingOn && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-[#202020] rounded-lg w-full max-w-lg mx-4 max-h-[80vh] flex flex-col">
            <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-[#2F2F2F]">
              <h3 className="font-semibold text-[#37352F] dark:text-[#FFFFFF]">Comments</h3>
              <button 
                onClick={() => { setCommentingOn(null); setComments([]); }}
                className="p-1 hover:bg-gray-100 dark:hover:bg-[#2F2F2F] rounded"
              >
                <X size={20} className="text-gray-500" />
              </button>
            </div>
            
            <div className="flex-1 overflow-auto p-4 space-y-4">
              {loadingComments ? (
                <div className="text-center text-gray-500">Loading...</div>
              ) : comments.length === 0 ? (
                <div className="text-center text-gray-500">No comments yet. Be the first!</div>
              ) : (
                comments.map((comment) => (
                  <div key={comment.id} className="flex gap-3 group">
                    <button
                      onClick={() => comment.author?.id && navigateToProfile(comment.author.id)}
                      className="w-8 h-8 rounded-full flex items-center justify-center bg-[#37352F] dark:bg-[#E3E3E3] text-white dark:text-[#191919] font-medium text-xs flex-shrink-0 hover:ring-2 hover:ring-blue-500 transition-all"
                    >
                      {comment.author?.avatar || comment.author?.name?.substring(0, 2).toUpperCase() || "??"}
                    </button>
                    <div className="flex-1">
                      <div className="flex items-baseline gap-2">
                        <button
                          onClick={() => comment.author?.id && navigateToProfile(comment.author.id)}
                          className="text-sm font-medium text-[#37352F] dark:text-[#E3E3E3] hover:underline hover:text-blue-600"
                        >
                          {comment.author?.name || "Anonymous"}
                        </button>
                        <span className="text-xs text-[#9B9A97]">
                          {new Date(comment.createdAt).toLocaleDateString()}
                        </span>
                        {isOwnComment(comment) && (
                          <button
                            onClick={() => deleteComment(comment.id)}
                            className="opacity-0 group-hover:opacity-100 text-gray-400 hover:text-red-500 transition-all"
                            title="Delete comment"
                          >
                            <Trash2 size={14} />
                          </button>
                        )}
                      </div>
                      <p className="text-sm text-[#37352F] dark:text-[#E3E3E3] mt-1">{comment.text}</p>
                    </div>
                  </div>
                ))
              )}
            </div>
            
            <div className="p-4 border-t border-gray-200 dark:border-[#2F2F2F]">
              <div className="flex gap-2">
                <input
                  type="text"
                  value={commentText}
                  onChange={(e) => setCommentText(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && submitComment()}
                  placeholder="Write a comment..."
                  className="flex-1 px-3 py-2 border border-gray-300 dark:border-[#3F3F3F] rounded-lg bg-white dark:bg-[#191919] text-[#37352F] dark:text-[#E3E3E3] text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <button
                  onClick={submitComment}
                  disabled={!commentText.trim()}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Send size={16} />
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <ShareModal 
        isOpen={showShareModal} 
        onClose={() => setShowShareModal(false)} 
        onSuccess={loadFeed}
      />
    </div>
  );
}
