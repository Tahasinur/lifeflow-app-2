import { useState, useEffect } from 'react';
import { Heart, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { followService } from '../services/followService';
import { webSocketNotificationService } from '../services/webSocketNotificationService';

interface FollowButtonProps {
  currentUserId: string;
  targetUserId: string;
  targetUserName?: string;
  targetUserAvatar?: string;
  onFollowChange?: (isFollowing: boolean) => void;
}

export function FollowButton({
  currentUserId,
  targetUserId,
  targetUserName = 'User',
  targetUserAvatar,
  onFollowChange,
}: FollowButtonProps) {
  const [isFollowing, setIsFollowing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    // Don't show follow button for own profile
    if (currentUserId === targetUserId) {
      setLoading(false);
      return;
    }

    checkFollowStatus();
  }, [currentUserId, targetUserId]);

  const checkFollowStatus = async () => {
    try {
      setLoading(true);
      const following = await followService.isFollowing(currentUserId, targetUserId);
      setIsFollowing(following);
    } catch (error) {
      console.error('Error checking follow status:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleFollowToggle = async () => {
    if (currentUserId === targetUserId) {
      toast.error('You cannot follow yourself');
      return;
    }

    try {
      setSubmitting(true);

      if (isFollowing) {
        // Unfollow
        await followService.unfollowUser(currentUserId, targetUserId);
        setIsFollowing(false);
        toast.success('Unfollowed user');

        // Publish unfollow event via WebSocket
        if (webSocketNotificationService.isConnected()) {
          webSocketNotificationService.publishUnfollowEvent(targetUserId, targetUserName);
        }

        onFollowChange?.(false);
      } else {
        // Follow
        await followService.followUser(currentUserId, targetUserId);
        setIsFollowing(true);
        toast.success(`Now following ${targetUserName}`);

        // Publish follow event via WebSocket
        if (webSocketNotificationService.isConnected()) {
          webSocketNotificationService.publishFollowEvent(
            targetUserId,
            targetUserName,
            targetUserAvatar
          );
        }

        onFollowChange?.(true);
      }
    } catch (error) {
      console.error('Error toggling follow status:', error);
      toast.error(isFollowing ? 'Failed to unfollow user' : 'Failed to follow user');
    } finally {
      setSubmitting(false);
    }
  };

  // Don't render button for own profile
  if (currentUserId === targetUserId) {
    return null;
  }

  return (
    <button
      onClick={handleFollowToggle}
      disabled={loading || submitting}
      className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all duration-200 ${
        isFollowing
          ? 'bg-red-50 dark:bg-red-950 text-red-600 dark:text-red-300 hover:bg-red-100 dark:hover:bg-red-900 border border-red-200 dark:border-red-800'
          : 'bg-blue-600 text-white hover:bg-blue-700 dark:bg-blue-700 dark:hover:bg-blue-600'
      } disabled:opacity-50 disabled:cursor-not-allowed`}
      title={isFollowing ? 'Unfollow this user' : 'Follow this user'}
    >
      {submitting ? (
        <>
          <Loader2 size={16} className="animate-spin" />
          <span className="text-sm">{isFollowing ? 'Unfollowing...' : 'Following...'}</span>
        </>
      ) : (
        <>
          <Heart
            size={16}
            fill={isFollowing ? 'currentColor' : 'none'}
            className={isFollowing ? 'text-red-600 dark:text-red-300' : ''}
          />
          <span className="text-sm">{isFollowing ? 'Following' : 'Follow'}</span>
        </>
      )}
    </button>
  );
}
