import { useState, useEffect, useCallback } from 'react';
import { Page } from '../types';

interface TabItem {
  id: string;
  pageId: string;
  tabOrder: number;
  openedAt: string;
  page: Page;
}

interface OpenTabDTO {
  id: string;
  userId: string;
  pageId: string;
  tabOrder: number;
  openedAt: string;
  page: Page;
}

const API_BASE_URL = '/api/tabs';

export function useOpenTabs(userId: string | null) {
  const [openTabs, setOpenTabs] = useState<TabItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Fetch all open tabs from backend
  const fetchTabs = useCallback(async () => {
    console.log('[useOpenTabs] fetchTabs called, userId:', userId);
    
    if (!userId) {
      console.log('[useOpenTabs] No userId, skipping fetch');
      setOpenTabs([]);
      setIsLoading(false);
      return;
    }

    try {
      console.log('[useOpenTabs] Fetching from:', API_BASE_URL);
      const response = await fetch(API_BASE_URL, {
        headers: {
          'X-User-Id': userId,
        },
      });

      console.log('[useOpenTabs] Fetch response status:', response.status);

      if (response.ok) {
        const data: OpenTabDTO[] = await response.json();
        console.log('[useOpenTabs] Fetched tabs:', data);
        
        const tabs: TabItem[] = data.map(dto => ({
          id: dto.id,
          pageId: dto.pageId,
          tabOrder: dto.tabOrder,
          openedAt: dto.openedAt,
          page: dto.page,
        }));
        setOpenTabs(tabs);
        
        // Also save to localStorage as backup
        localStorage.setItem('lifeflow-open-tabs', JSON.stringify(tabs));
      } else {
        console.error('[useOpenTabs] Fetch failed with status:', response.status);
      }
    } catch (error) {
      console.error('Error fetching tabs:', error);
      
      // Fallback to localStorage
      const savedTabs = localStorage.getItem('lifeflow-open-tabs');
      if (savedTabs) {
        try {
          setOpenTabs(JSON.parse(savedTabs));
        } catch (e) {
          console.error('Error parsing saved tabs:', e);
        }
      }
    } finally {
      setIsLoading(false);
    }
  }, [userId]);

  // Load tabs on mount
  useEffect(() => {
    console.log('[useOpenTabs] Fetching tabs for userId:', userId);
    fetchTabs();
  }, [fetchTabs]);

  // Open a new tab (or switch to existing)
  const openTab = useCallback(async (page: Page): Promise<boolean> => {
    console.log('[useOpenTabs] openTab called for:', page.title, 'pageId:', page.id, 'userId:', userId);
    
    if (!userId) {
      console.log('[useOpenTabs] No userId, cannot open tab');
      return false;
    }

    try {
      console.log('[useOpenTabs] Posting new tab to:', API_BASE_URL, 'with pageId:', page.id);
      
      const response = await fetch(API_BASE_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-User-Id': userId,
        },
        body: JSON.stringify({ pageId: page.id }),
      });

      console.log('[useOpenTabs] POST response status:', response.status);

      if (response.ok) {
        const newTab: OpenTabDTO = await response.json();
        console.log('[useOpenTabs] Received new tab from backend:', newTab);
        
        const tabItem: TabItem = {
          id: newTab.id,
          pageId: newTab.pageId,
          tabOrder: newTab.tabOrder,
          openedAt: newTab.openedAt,
          page: newTab.page,
        };
        
        // Use functional update to avoid stale closure
        setOpenTabs(prev => {
          // Check if tab already exists
          const existingTab = prev.find(tab => tab.pageId === page.id);
          if (existingTab) {
            // Tab already open, don't add duplicate
            console.log('[useOpenTabs] Tab already exists:', page.title);
            return prev;
          }
          
          const updated = [...prev, tabItem];
          console.log('[useOpenTabs] Added new tab:', page.title, 'Total tabs:', updated.length);
          // Update localStorage with fresh state
          localStorage.setItem('lifeflow-open-tabs', JSON.stringify(updated));
          return updated;
        });
        
        return true;
      }
    } catch (error) {
      console.error('Error opening tab:', error);
      
      // Fallback: add to local state only
      const tabItem: TabItem = {
        id: `temp-${Date.now()}`,
        pageId: page.id,
        tabOrder: 0, // Will be updated when we have prev
        openedAt: new Date().toISOString(),
        page: page,
      };
      
      setOpenTabs(prev => {
        // Check for existing tab
        const existingTab = prev.find(tab => tab.pageId === page.id);
        if (existingTab) {
          return prev;
        }
        
        const updated = [...prev, { ...tabItem, tabOrder: prev.length }];
        localStorage.setItem('lifeflow-open-tabs', JSON.stringify(updated));
        return updated;
      });
      
      return true;
    }

    return false;
  }, [userId]);

  // Close a tab
  const closeTab = useCallback(async (tabId: string): Promise<boolean> => {
    if (!userId) return false;

    try {
      const response = await fetch(`${API_BASE_URL}/${tabId}`, {
        method: 'DELETE',
        headers: {
          'X-User-Id': userId,
        },
      });

      if (response.ok) {
        setOpenTabs(prev => {
          const updated = prev.filter(tab => tab.id !== tabId);
          localStorage.setItem('lifeflow-open-tabs', JSON.stringify(updated));
          return updated;
        });
        
        return true;
      }
    } catch (error) {
      console.error('Error closing tab:', error);
      
      // Fallback: remove from local state only
      setOpenTabs(prev => {
        const updated = prev.filter(tab => tab.id !== tabId);
        localStorage.setItem('lifeflow-open-tabs', JSON.stringify(updated));
        return updated;
      });
      
      return true;
    }

    return false;
  }, [userId]);

  // Reorder tabs
  const reorderTabs = useCallback(async (tabIds: string[]): Promise<boolean> => {
    if (!userId) return false;

    // Update local state immediately for responsive UI
    setOpenTabs(prev => {
      const reorderedTabs = tabIds
        .map(id => prev.find(tab => tab.id === id))
        .filter((tab): tab is TabItem => tab !== undefined)
        .map((tab, index) => ({ ...tab, tabOrder: index }));
      
      localStorage.setItem('lifeflow-open-tabs', JSON.stringify(reorderedTabs));
      return reorderedTabs;
    });

    try {
      const response = await fetch(`${API_BASE_URL}/reorder`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'X-User-Id': userId,
        },
        body: JSON.stringify({ tabIds }),
      });

      return response.ok;
    } catch (error) {
      console.error('Error reordering tabs:', error);
      return false;
    }
  }, [userId]);

  return {
    openTabs,
    isLoading,
    openTab,
    closeTab,
    reorderTabs,
    refreshTabs: fetchTabs,
  };
}
