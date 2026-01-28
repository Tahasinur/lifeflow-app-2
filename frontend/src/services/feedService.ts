import { FeedItem } from '../types';

const API_URL = '/api/feed';

const getAuthHeader = () => {
  const token = localStorage.getItem('lifeflow-token');
  return token ? { Authorization: `Bearer ${token}` } : {};
};

const feedService = {
  getAllPosts: async (): Promise<FeedItem[]> => {
    const response = await fetch(API_URL, {
      headers: {
        'Content-Type': 'application/json',
        ...getAuthHeader(),
      } as HeadersInit,
    });
    if (!response.ok) throw new Error('Failed to fetch feed');
    return response.json();
  },

  getFeedItem: async (id: string): Promise<FeedItem> => {
    const response = await fetch(`${API_URL}/${id}`, {
      headers: {
        'Content-Type': 'application/json',
        ...getAuthHeader(),
      } as HeadersInit,
    });
    if (!response.ok) throw new Error('Failed to fetch feed item');
    return response.json();
  },
};

export default feedService;
