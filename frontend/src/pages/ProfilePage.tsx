import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Heart, MessageCircle, Copy, ArrowLeft } from 'lucide-react';
import { toast } from 'sonner';
import { FeedItem, FeedUser } from '../types';

interface UserProfile {
  user: FeedUser & { bio?: string };
  posts: FeedItem[];
}

export function ProfilePage() {
  const { userId } = useParams<{ userId: string }>();
  const navigate = useNavigate();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [likedItems, setLikedItems] = useState<Set<string>>(new Set());

  useEffect(() => {
    if (userId) {
      loadProfile();
    }
  }, [userId]);

  const loadProfile = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/users/${userId}/profile`);
      if (res.ok) {
        const data = await res.json();
        setProfile(data);
      } else {
        toast.error('User not found');
        navigate('/feed');
      }
    } catch (err) {
      console.error('Failed to load profile:', err);
      toast.error('Failed to load profile');
    } finally {
      setLoading(false);
    }
  };

  const toggleLike = async (itemId: string) => {
    setLikedItems((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(itemId)) newSet.delete(itemId);
      else newSet.add(itemId);
      return newSet;
    });
    try {
      await fetch(`/api/feed/${itemId}/like`, { method: 'POST' });
      loadProfile();
    } catch (e) { console.error(e); }
  };

  const cloneTemplate = async (item: FeedItem) => {
    try {
      const res = await fetch(`/api/feed/${item.id}/clone`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({})
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

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-gray-500">Loading...</div>
      </div>
    );
  }

  if (!profile) {
    return null;
  }

  return (
    <div className="flex flex-col h-full bg-white dark:bg-[#191919]">
      <div className="border-b border-gray-200 dark:border-[#2F2F2F] bg-white dark:bg-[#191919] px-6 py-6">
        <button 
          onClick={() => navigate('/feed')}
          className="flex items-center gap-2 text-sm text-[#9B9A97] hover:text-[#37352F] dark:hover:text-[#E3E3E3] mb-4"
        >
          <ArrowLeft size={16} />
          Back to Feed
        </button>

        <div className="flex items-start gap-4">
          <div className="w-20 h-20 rounded-full flex items-center justify-center bg-[#37352F] dark:bg-[#E3E3E3] text-white dark:text-[#191919] font-bold text-2xl">
            {profile.user.avatar || profile.user.name?.substring(0, 2).toUpperCase() || "??"}
          </div>
          <div className="flex-1">
            <h1 className="text-2xl font-semibold text-[#37352F] dark:text-[#FFFFFF]">
              {profile.user.name || "Anonymous"}
            </h1>
            <p className="text-sm text-[#9B9A97] mt-1">{profile.user.email}</p>
            {profile.user.bio && (
              <p className="text-sm text-[#37352F] dark:text-[#E3E3E3] mt-2">
                {profile.user.bio}
              </p>
            )}
            <div className="flex gap-4 mt-3 text-sm text-[#9B9A97]">
              <span>{profile.posts.length} posts</span>
            </div>
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-auto bg-white dark:bg-[#191919]">
        <div className="max-w-3xl mx-auto px-6 py-8">
          <h2 className="text-lg font-semibold text-[#37352F] dark:text-[#FFFFFF] mb-4">
            Posts
          </h2>

          {profile.posts.length === 0 ? (
            <div className="text-center text-gray-500 mt-10">
              No posts yet
            </div>
          ) : (
            <div className="space-y-6">
              {profile.posts.map((item) => (
                <div key={item.id} className="bg-white dark:bg-[#202020] border border-gray-200 dark:border-[#2F2F2F] rounded-lg p-6 hover:border-gray-300 dark:hover:border-[#3F3F3F] transition-colors">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 rounded-full flex items-center justify-center bg-[#37352F] dark:bg-[#E3E3E3] text-white dark:text-[#191919] font-medium text-sm">
                      {profile.user.avatar || profile.user.name?.substring(0, 2).toUpperCase() || "??"}
                    </div>
                    <div>
                      <div className="text-sm font-medium text-[#37352F] dark:text-[#E3E3E3]">
                        <span>{profile.user.name || "Anonymous"}</span>
                        <span className="font-normal ml-1 text-[#9B9A97]">{getActionText(item.type)}</span>
                      </div>
                      <div className="text-xs text-[#9B9A97]">{new Date(item.createdAt).toLocaleDateString()}</div>
                    </div>
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
                        <span>Clone</span>
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
