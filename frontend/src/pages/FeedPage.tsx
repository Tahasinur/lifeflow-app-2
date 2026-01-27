import { useState, useEffect } from 'react';
import { Heart, MessageCircle, Search, Copy, ExternalLink } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { FeedItem } from '../types';

export function FeedPage() {
  const navigate = useNavigate();
  const [feedItems, setFeedItems] = useState<FeedItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState<'all' | 'template' | 'blog' | 'workspace_update'>('all');
  const [likedItems, setLikedItems] = useState<Set<string>>(new Set());

  useEffect(() => {
    const fetchFeedItems = async () => {
      try {
        setLoading(true);
        const response = await fetch('/api/feed');
        if (!response.ok) {
          throw new Error('Failed to load feed');
        }
        const data: FeedItem[] = await response.json();
        setFeedItems(data);
        setError(null);
      } catch (err) {
        console.error('Error loading feed:', err);
        setError('Failed to load community feed');
        setFeedItems([]);
      } finally {
        setLoading(false);
      }
    };

    fetchFeedItems();
  }, []);

  const filteredItems = feedItems.filter(item => {
    const matchesType = filterType === 'all' || item.type === filterType;
    const matchesSearch = item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          item.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          item.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesType && matchesSearch;
  });

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  const getTypeLabel = (type: string) => {
    switch (type) {
      case 'template':
        return 'Template';
      case 'blog':
        return 'Blog';
      case 'workspace_update':
        return 'Update';
      default:
        return 'Post';
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'template':
        return 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400';
      case 'blog':
        return 'bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-400';
      case 'workspace_update':
        return 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400';
      default:
        return 'bg-gray-100 dark:bg-gray-900/30 text-gray-700 dark:text-gray-400';
    }
  };

  const handleOpenItem = (item: FeedItem) => {
    if (item.type === 'blog') {
      toast.info('Opening blog post...');
      // Navigate to blog detail page or open modal
    } else if (item.type === 'template') {
      toast.info('Viewing template details...');
      // Navigate to template detail page or open modal
    } else {
      toast.info('Viewing workspace update...');
    }
  };

  const handleLike = (itemId: string) => {
    setLikedItems(prev => {
      const newLiked = new Set(prev);
      if (newLiked.has(itemId)) {
        newLiked.delete(itemId);
      } else {
        newLiked.add(itemId);
      }
      return newLiked;
    });
    toast.success('Liked!');
  };

  const handleCopyTemplate = async (item: FeedItem) => {
    try {
      if (!item.sourcePageId) {
        toast.error('Template source not available');
        return;
      }

      const response = await fetch(`/api/feed/${item.id}/clone`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error('Failed to clone template');
      }

      const result = await response.json();
      toast.success('Template copied to your workspace!');
    } catch (err) {
      console.error('Error cloning template:', err);
      toast.error('Failed to copy template');
    }
  };

  const handleAuthorClick = (authorId?: string, authorName?: string) => {
    if (authorId) {
      navigate(`/user/${authorId}`);
    } else if (authorName) {
      navigate(`/user/${authorName}`);
    }
  };

  return (
    <div className="flex-1 overflow-auto bg-white dark:bg-[#191919] flex flex-col">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-white dark:bg-[#191919] border-b border-gray-200 dark:border-[#2F2F2F]">
        <div className="px-8 py-6">
          <h1 className="text-3xl font-bold text-[#37352F] dark:text-[#E3E3E3] mb-2">
            Community Feed
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Explore pages and updates shared by the Lifeflow community
          </p>
        </div>

        {/* Search and Filter */}
        <div className="px-8 pb-6 space-y-4">
          <div className="relative">
            <Search className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search posts..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-[#3F3F3F] rounded-lg bg-white dark:bg-[#191919] text-[#37352F] dark:text-[#E3E3E3] placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div className="flex gap-2">
            {['all', 'template', 'blog', 'workspace_update'].map(type => (
              <button
                key={type}
                onClick={() => setFilterType(type as any)}
                className={`px-4 py-2 rounded-lg text-sm transition-colors ${
                  filterType === type
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 dark:bg-[#2F2F2F] text-[#37352F] dark:text-[#E3E3E3] hover:bg-gray-200 dark:hover:bg-[#3F3F3F]'
                }`}
              >
                {type === 'all' ? 'All Posts' : type === 'workspace_update' ? 'Updates' : type.charAt(0).toUpperCase() + type.slice(1)}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Content Area */}
      <div className="flex-1 overflow-auto px-8 py-6">
        {loading ? (
          <div className="flex items-center justify-center h-full">
            <p className="text-gray-500 dark:text-gray-400">Loading feed...</p>
          </div>
        ) : error ? (
          <div className="flex items-center justify-center h-full">
            <p className="text-red-500">{error}</p>
          </div>
        ) : filteredItems.length === 0 ? (
          <div className="flex items-center justify-center h-full">
            <p className="text-gray-500 dark:text-gray-400">
              {feedItems.length === 0
                ? 'No posts yet. Be the first to share something!'
                : 'No posts match your search.'}
            </p>
          </div>
        ) : (
          <div className="space-y-6">
            {filteredItems.map(item => (
              <article
                key={item.id}
                className="bg-white dark:bg-[#202020] border border-gray-200 dark:border-[#2F2F2F] rounded-lg overflow-hidden hover:shadow-md transition-shadow"
              >
                <div className="p-6">
                  {/* Header */}
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
                          item.type === 'template' ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400' :
                          item.type === 'blog' ? 'bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-400' :
                          'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400'
                        }`}>
                          {item.type === 'template' ? 'Template' : item.type === 'blog' ? 'Blog' : 'Update'}
                        </span>
                        <span className="text-xs text-gray-500 dark:text-gray-500">
                          {formatDate(item.createdAt)}
                        </span>
                      </div>
                      <button
                        onClick={() => handleOpenItem(item)}
                        className="text-lg font-semibold text-[#37352F] dark:text-[#E3E3E3] mb-2 hover:text-blue-600 dark:hover:text-blue-400 hover:underline cursor-pointer transition-colors text-left"
                      >
                        {item.title}
                      </button>
                    </div>
                  </div>

                  {/* Description */}
                  <p className="text-gray-600 dark:text-gray-400 mb-4 line-clamp-3">
                    {item.description}
                  </p>

                  {/* Tags */}
                  {item.tags && item.tags.length > 0 && (
                    <div className="flex flex-wrap gap-2 mb-4">
                      {item.tags.map(tag => (
                        <span
                          key={tag}
                          className="px-2 py-1 bg-gray-100 dark:bg-[#2F2F2F] text-gray-700 dark:text-gray-300 text-xs rounded-full"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  )}

                  {/* Author */}
                  <div className="flex items-center justify-between pt-4 border-t border-gray-200 dark:border-[#2F2F2F]">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-full bg-blue-600 text-white flex items-center justify-center text-xs font-semibold">
                        {item.author?.avatar || 'U'}
                      </div>
                      <div>
                        <button
                          onClick={() => handleAuthorClick(item.author?.id, item.author?.name)}
                          className="text-sm font-medium text-[#37352F] dark:text-[#E3E3E3] hover:text-blue-600 dark:hover:text-blue-400 hover:underline transition-colors"
                        >
                          {item.author?.name || 'Anonymous'}
                        </button>
                        <p className="text-xs text-gray-500 dark:text-gray-500">
                          {item.author?.email || 'anonymous@example.com'}
                        </p>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-3">
                      <button
                        onClick={() => handleLike(item.id)}
                        className={`flex items-center gap-1 transition-colors ${
                          likedItems.has(item.id)
                            ? 'text-red-600 dark:text-red-400'
                            : 'text-gray-600 dark:text-gray-400 hover:text-red-600 dark:hover:text-red-400'
                        }`}
                      >
                        <Heart className="w-4 h-4" fill={likedItems.has(item.id) ? 'currentColor' : 'none'} />
                        <span className="text-sm">{item.likes}</span>
                      </button>
                      <button className="flex items-center gap-1 text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
                        <MessageCircle className="w-4 h-4" />
                        <span className="text-sm">{item.commentCount}</span>
                      </button>
                      {item.type === 'template' && item.sourcePageId && (
                        <button
                          onClick={() => handleCopyTemplate(item)}
                          className="flex items-center gap-1 text-gray-600 dark:text-gray-400 hover:text-green-600 dark:hover:text-green-400 transition-colors px-2 py-1 hover:bg-gray-100 dark:hover:bg-[#2F2F2F] rounded"
                          title="Copy template"
                        >
                          <Copy className="w-4 h-4" />
                        </button>
                      )}
                      {item.type === 'blog' && (
                        <button
                          onClick={() => handleOpenItem(item)}
                          className="flex items-center gap-1 text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors px-2 py-1 hover:bg-gray-100 dark:hover:bg-[#2F2F2F] rounded"
                          title="Read blog"
                        >
                          <ExternalLink className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </article>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
