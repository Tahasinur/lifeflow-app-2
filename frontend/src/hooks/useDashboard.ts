import { useState, useEffect, useRef } from 'react';
import { Page } from '../types';

const getUserId = (): string | null => {
  const storedUser = localStorage.getItem('lifeflow-user');
  if (storedUser) {
    try {
      const user = JSON.parse(storedUser);
      return user.id ? String(user.id) : null;
    } catch (e) {
      console.error('Failed to parse stored user', e);
      localStorage.removeItem('lifeflow-user');
      return null;
    }
  }
  return null;
};

export const getUserFirstName = (): string => {
  const storedUser = localStorage.getItem('lifeflow-user');
  if (storedUser) {
    try {
      const user = JSON.parse(storedUser);
      return user.firstName || 'User';
    } catch (e) {
      console.error('Failed to parse stored user', e);
      return 'User';
    }
  }
  return 'User';
};

const getAuthHeaders = (): Record<string, string> => {
  const userId = getUserId();
  const headers: Record<string, string> = { 'Content-Type': 'application/json' };
  if (userId) {
    headers['X-User-Id'] = userId;
  }
  return headers;
};

export function useDashboard() {
  const [pages, setPages] = useState<Page[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [currentPageId, setCurrentPageId] = useState<string | null>(null);
  
  const saveTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    const userId = getUserId();
    if (!userId) {
      setIsLoading(false);
      return;
    }

    fetch('/api/pages', {
      headers: getAuthHeaders()
    })
      .then((res) => {
        if (!res.ok) {
          console.error("Failed to load pages:", res.status);
          return [];
        }
        return res.json();
      })
      .then((data) => {
        if (!Array.isArray(data)) {
          setPages([]);
          return;
        }
        const formattedPages = data.map((p: any) => ({
          ...p,
          blocks: p.blocksJson ? JSON.parse(p.blocksJson) : [],
          editorContent: p.editorContentJson ? JSON.parse(p.editorContentJson) : null
        }));
        setPages(formattedPages);
        setIsLoading(false);
      })
      .catch((err) => {
        console.error("Failed to load:", err);
        setIsLoading(false);
      });
  }, []);

  const saveToBackend = async (page: Page) => {
    console.log("Saving to backend...", page.title);
    const payload = {
      ...page,
      blocksJson: JSON.stringify(page.blocks || []),
      editorContentJson: page.editorContent ? JSON.stringify(page.editorContent) : null
    };
    try {
      await fetch('/api/pages', {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify(payload),
      });
    } catch (error) {
      console.error("Save failed:", error);
    }
  };

  const handleUpdatePage = async (updatedPage: Page) => {
    setPages((prev) => {
      const exists = prev.find((p) => p.id === updatedPage.id);
      if (exists) {
        return prev.map((p) => (p.id === updatedPage.id ? updatedPage : p));
      }
      return [...prev, updatedPage];
    });

    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current);
    }

    saveTimeoutRef.current = setTimeout(() => {
      saveToBackend(updatedPage);
    }, 1000);
  };

  const handleCreatePage = async (parentId: string | null = null) => {
    let newId;
    try { newId = crypto.randomUUID(); } 
    catch (e) { newId = Date.now().toString(); }

    const newPage: Page = {
      id: newId,
      title: 'Untitled',
      icon: '📄',
      coverImage: null,
      blocks: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      parentId: parentId || null,
      isFavorite: false,
      isDeleted: false,
    };

    await saveToBackend(newPage);
    
    setPages(prev => [...prev, newPage]);
    setCurrentPageId(newPage.id);
    return newPage.id;
  };

  const handleMoveToTrash = async (pageId: string) => {
    setPages((prev) => 
        prev.map(p => p.id === pageId ? { ...p, isDeleted: true } : p)
    );
    try {
      await fetch(`/api/pages/${pageId}`, { 
        method: 'DELETE',
        headers: getAuthHeaders()
      });
    } catch (error) {
      console.error("Delete failed:", error);
    }
  };

  const handleRestorePage = async (pageId: string) => {
    const page = pages.find(p => p.id === pageId);
    if (!page) return;
    const restoredPage = { ...page, isDeleted: false };
    
    await saveToBackend(restoredPage);
    
    setPages(prev => prev.map(p => p.id === pageId ? restoredPage : p));
  };

  const handlePermanentDelete = async (pageId: string) => {
    setPages((prev) => prev.filter((p) => p.id !== pageId));
  };

  const activePages = pages.filter(p => !p.isDeleted);
  const trashPages = pages.filter(p => p.isDeleted);

  return {
    pages: activePages,
    trashPages,
    currentPageId,
    setCurrentPageId,
    isLoading,
    handleCreatePage,
    handleUpdatePage,
    handleMoveToTrash,
    handleRestorePage,
    handlePermanentDelete,
  };
}
