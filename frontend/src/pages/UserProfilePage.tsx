import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Heart, MessageCircle, Copy, ArrowLeft } from 'lucide-react';
import { toast } from 'sonner';
import { FeedItem } from '../types';
import { FollowButton } from '../components/FollowButton';
import { followService } from '../services/followService';
import { webSocketNotificationService } from '../services/webSocketNotificationService';

interface UserProfile {
  id: string;
  name: string;
  email?: string;
  avatar?: string;
  bio?: string;
}

export function UserProfilePage() {
  const { userId } = useParams<{ userId: string }>();
  const navigate = useNavigate();
  const [user, setUser] = useState<UserProfile | null>(null);
  // ... existing state ...

  // ... loadUserProfile and other methods ...

  const handleMessageUser = () => {
    if (!user || !user.email) {
       toast.error("Cannot message this user (email hidden)");
       return;
    }
    navigate(`/dashboard/inbox?createDirect=${encodeURIComponent(user.email)}`);
  };

  const cloneTemplate = (item: FeedItem) => {
    if (item.sourcePageId) {
      toast.info('Template cloning coming soon');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full bg-white dark:bg-[#191919]">
        <div className="text-gray-500">Loading profile...</div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <div className="flex flex-col h-full bg-white dark:bg-[#191919]">
      {/* Header Section */}
      <div className="border-b border-gray-200 dark:border-[#2F2F2F] bg-gradient-to-r from-blue-50 to-purple-50 dark:from-[#2F2F2F] dark:to-[#252525] px-6 py-8">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-sm text-[#9B9A97] hover:text-[#37352F] dark:hover:text-[#E3E3E3] mb-6"
        >
          <ArrowLeft size={16} />
          Back
        </button>

        <div className="flex items-start gap-6">
          {/* Avatar */}
          <div className="w-24 h-24 rounded-full flex items-center justify-center bg-[#37352F] dark:bg-[#E3E3E3] text-white dark:text-[#191919] font-bold text-3xl flex-shrink-0 shadow-lg">
            {user.avatar || user.name?.substring(0, 2).toUpperCase() || '??'}
          </div>

          {/* Profile Info */}
          <div className="flex-1 pt-2">
            <h1 className="text-3xl font-bold text-[#37352F] dark:text-[#FFFFFF] mb-3">
              {user.name}
            </h1>

            {user.bio && (
              <p className="text-sm text-[#37352F] dark:text-[#E3E3E3] max-w-2xl mb-4">
                {user.bio}
              </p>
            )}

            {/* Follower and Following Stats */}
            <div className="flex gap-6 mb-4">
              <div className="flex flex-col">
                <span className="text-lg font-bold text-blue-600 dark:text-blue-400">
                  {followerCount}
                </span>
                <span className="text-xs text-[#9B9A97]">Followers</span>
              </div>
              <div className="flex flex-col">
                <span className="text-lg font-bold text-blue-600 dark:text-blue-400">
                  {followingCount}
                </span>
                <span className="text-xs text-[#9B9A97]">Following</span>
              </div>
            </div>

            {/* Template Count */}
            <div className="text-sm font-medium text-[#37352F] dark:text-[#E3E3E3]">
              <span className="text-lg font-bold text-blue-600 dark:text-blue-400">
                {templates.length}
              </span>
              <span className="ml-2 text-[#9B9A97]">
                Public Template{templates.length !== 1 ? 's' : ''}
              </span>
            </div>
          </div>

          {/* Message and Follow Buttons */}
          <div className="flex-shrink-0 flex gap-2">
            <button
              onClick={handleMessageUser}
              className="flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors font-medium"
            >
              <MessageCircle size={16} />
              Message
            </button>
            {currentUserId && user && (
              <FollowButton
                currentUserId={currentUserId}
                targetUserId={user.id}
                targetUserName={user.name}
                targetUserAvatar={user.avatar}
                onFollowChange={(isFollowing) => {
                  // Update follower count when follow status changes
                  if (isFollowing) {
                    setFollowerCount((prev) => prev + 1);
                  } else {
                    setFollowerCount((prev) => Math.max(0, prev - 1));
                  }
                }}
              />
            )}
          </div>
        </div>
      </div>

      {/* Templates Grid Section */}
      <div className="flex-1 overflow-auto bg-white dark:bg-[#191919]">
        <div className="max-w-6xl mx-auto px-6 py-8">
          {templates && templates.length > 0 ? (
            <>
              <h2 className="text-2xl font-bold text-[#37352F] dark:text-[#FFFFFF] mb-6">
                Public Templates
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {templates.map((template) => (
                  <div
                    key={template.id}
                    className="bg-white dark:bg-[#202020] border border-gray-200 dark:border-[#2F2F2F] rounded-lg overflow-hidden hover:border-gray-300 dark:hover:border-[#3F3F3F] hover:shadow-md dark:hover:shadow-lg transition-all group"
                  >
                    {/* Card Content */}
                    <div className="p-4">
                      <h3 className="text-lg font-semibold mb-2 text-[#37352F] dark:text-[#FFFFFF] group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                        {template.title}
                      </h3>

                      <p className="text-sm text-[#37352F] dark:text-[#E3E3E3] mb-3 line-clamp-2">
                        {template.description}
                      </p>

                      {/* Tags */}
                      {template.tags && template.tags.length > 0 && (
                        <div className="flex gap-2 mb-4 flex-wrap">
                          {template.tags.slice(0, 2).map((tag, idx) => (
                            <span
                              key={idx}
                              className="px-2 py-1 bg-gray-100 dark:bg-[#2F2F2F] text-xs rounded-full text-[#37352F] dark:text-[#E3E3E3]"
                            >
                              {tag}
                            </span>
                          ))}
                          {template.tags.length > 2 && (
                            <span className="px-2 py-1 bg-gray-100 dark:bg-[#2F2F2F] text-xs rounded-full text-[#37352F] dark:text-[#E3E3E3]">
                              +{template.tags.length - 2}
                            </span>
                          )}
                        </div>
                      )}

                      {/* Date */}
                      <div className="text-xs text-[#9B9A97] mb-4">
                        {new Date(template.createdAt).toLocaleDateString()}
                      </div>

                      {/* Actions */}
                      <div className="flex items-center gap-2 pt-3 border-t border-gray-100 dark:border-[#2F2F2F]">
                        <button
                          onClick={() => toggleLike(template.id)}
                          className={`flex items-center gap-1 px-3 py-2 text-sm rounded-lg hover:bg-gray-50 dark:hover:bg-[#2F2F2F] transition-colors ${
                            likedItems.has(template.id)
                              ? 'text-red-500'
                              : 'text-[#37352F] dark:text-[#E3E3E3]'
                          }`}
                        >
                          <Heart
                            size={16}
                            fill={
                              likedItems.has(template.id)
                                ? 'currentColor'
                                : 'none'
                            }
                          />
                          <span>{template.likes}</span>
                        </button>

                        {template.type === 'template' && template.sourcePageId && (
                          <button
                            onClick={() => cloneTemplate(template)}
                            className="flex items-center gap-1 px-3 py-2 text-sm rounded-lg bg-blue-50 dark:bg-blue-900/20 hover:bg-blue-100 dark:hover:bg-blue-900/30 transition-colors text-blue-600 dark:text-blue-400 ml-auto"
                          >
                            <Copy size={16} />
                            <span>Clone</span>
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </>
          ) : (
            <div className="text-center py-12">
              <p className="text-gray-500 dark:text-gray-400 text-lg">
                No public templates yet
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
