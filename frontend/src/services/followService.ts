import { toast } from 'sonner';

const API_BASE_URL = 'http://localhost:8080/api';

export interface FollowResponse {
  success: boolean;
  message: string;
  follow?: {
    id: string;
    follower: { id: string; name: string };
    following: { id: string; name: string };
    createdAt: string;
  };
}

export interface IsFollowingResponse {
  isFollowing: boolean;
}

export interface FollowerCountResponse {
  count: number;
}

export interface FollowingCountResponse {
  count: number;
}

export interface FollowDTO {
  id: string;
  follower: { id: string; name: string; avatar?: string };
  following: { id: string; name: string; avatar?: string };
  isMuted: boolean;
  createdAt: string;
}

export interface PaginatedResponse<T> {
  content: T[];
  totalElements: number;
  totalPages: number;
  currentPage: number;
}

export const followService = {
  /**
   * Follow a user
   */
  async followUser(followerId: string, followingId: string): Promise<FollowResponse> {
    try {
      const response = await fetch(
        `${API_BASE_URL}/follows/${followerId}/follow/${followingId}`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
        }
      );

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message || 'Failed to follow user');
      }
      return data;
    } catch (error) {
      console.error('Error following user:', error);
      throw error;
    }
  },

  /**
   * Unfollow a user
   */
  async unfollowUser(followerId: string, followingId: string): Promise<FollowResponse> {
    try {
      const response = await fetch(
        `${API_BASE_URL}/follows/${followerId}/unfollow/${followingId}`,
        {
          method: 'DELETE',
          headers: {
            'Content-Type': 'application/json',
          },
        }
      );

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message || 'Failed to unfollow user');
      }
      return data;
    } catch (error) {
      console.error('Error unfollowing user:', error);
      throw error;
    }
  },

  /**
   * Check if a user is following another user
   */
  async isFollowing(followerId: string, followingId: string): Promise<boolean> {
    try {
      const response = await fetch(
        `${API_BASE_URL}/follows/${followerId}/is-following/${followingId}`
      );

      if (!response.ok) {
        throw new Error('Failed to check follow status');
      }

      const data = (await response.json()) as IsFollowingResponse;
      return data.isFollowing;
    } catch (error) {
      console.error('Error checking follow status:', error);
      return false;
    }
  },

  /**
   * Get follower count for a user
   */
  async getFollowerCount(userId: string): Promise<number> {
    try {
      const response = await fetch(`${API_BASE_URL}/follows/${userId}/follower-count`);

      if (!response.ok) {
        throw new Error('Failed to get follower count');
      }

      const data = (await response.json()) as FollowerCountResponse;
      return data.count;
    } catch (error) {
      console.error('Error getting follower count:', error);
      return 0;
    }
  },

  /**
   * Get following count for a user
   */
  async getFollowingCount(userId: string): Promise<number> {
    try {
      const response = await fetch(`${API_BASE_URL}/follows/${userId}/following-count`);

      if (!response.ok) {
        throw new Error('Failed to get following count');
      }

      const data = (await response.json()) as FollowingCountResponse;
      return data.count;
    } catch (error) {
      console.error('Error getting following count:', error);
      return 0;
    }
  },

  /**
   * Get followers of a user
   */
  async getFollowers(
    userId: string,
    page: number = 0,
    size: number = 20
  ): Promise<PaginatedResponse<FollowDTO>> {
    try {
      const response = await fetch(
        `${API_BASE_URL}/follows/${userId}/followers?page=${page}&size=${size}`
      );

      if (!response.ok) {
        throw new Error('Failed to get followers');
      }

      return await response.json();
    } catch (error) {
      console.error('Error getting followers:', error);
      throw error;
    }
  },

  /**
   * Get following list for a user
   */
  async getFollowing(
    userId: string,
    page: number = 0,
    size: number = 20
  ): Promise<PaginatedResponse<FollowDTO>> {
    try {
      const response = await fetch(
        `${API_BASE_URL}/follows/${userId}/following?page=${page}&size=${size}`
      );

      if (!response.ok) {
        throw new Error('Failed to get following list');
      }

      return await response.json();
    } catch (error) {
      console.error('Error getting following list:', error);
      throw error;
    }
  },

  /**
   * Mute a user
   */
  async muteUser(followerId: string, followingId: string): Promise<FollowResponse> {
    try {
      const response = await fetch(
        `${API_BASE_URL}/follows/${followerId}/mute/${followingId}`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
        }
      );

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message || 'Failed to mute user');
      }
      return data;
    } catch (error) {
      console.error('Error muting user:', error);
      throw error;
    }
  },

  /**
   * Unmute a user
   */
  async unmuteUser(followerId: string, followingId: string): Promise<FollowResponse> {
    try {
      const response = await fetch(
        `${API_BASE_URL}/follows/${followerId}/unmute/${followingId}`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
        }
      );

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message || 'Failed to unmute user');
      }
      return data;
    } catch (error) {
      console.error('Error unmuting user:', error);
      throw error;
    }
  },

  /**
   * Get muted follows for a user
   */
  async getMutedFollows(userId: string): Promise<FollowDTO[]> {
    try {
      const response = await fetch(`${API_BASE_URL}/follows/${userId}/muted`);

      if (!response.ok) {
        throw new Error('Failed to get muted follows');
      }

      return await response.json();
    } catch (error) {
      console.error('Error getting muted follows:', error);
      return [];
    }
  },
};
