import { useState, useEffect } from 'react';
import { Outlet, useNavigate, useParams } from 'react-router-dom';
import { Sidebar } from '../components/Sidebar';
import { Topbar } from '../components/Topbar'; 
import { Page } from '../types';
import { toast } from 'sonner';

// --- HELPER 1: Convert Backend Data (JSON String) -> Frontend Data (Array) ---
// This ensures the Editor always receives a valid 'blocks' array
const parsePage = (backendPage: any): Page => ({
    ...backendPage,
    // If blocksJson exists, parse it. If not, fallback to empty array.
    blocks: backendPage.blocksJson ? JSON.parse(backendPage.blocksJson) : [],
});

// --- HELPER 2: Convert Frontend Data (Array) -> Backend Data (JSON String) ---
// This ensures your content is actually saved to the database as text
const serializePage = (frontendPage: Page): any => {
    const { blocks, ...rest } = frontendPage;
    return {
        ...rest,
        blocksJson: JSON.stringify(blocks || [])
    };
};

export function DashboardLayout() {
  const navigate = useNavigate();
  const { pageId } = useParams();
  const [pages, setPages] = useState<Page[]>([]);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // 1. Load Pages (Now with Parsing!)
  const loadPages = async () => {
    const userJson = localStorage.getItem('lifeflow-user');
    if (!userJson) return;
    
    const user = JSON.parse(userJson);

    try {
      const res = await fetch(`/api/pages?userId=${user.id}`);
      if (res.ok) {
          const rawData = await res.json();
          // Transform every page from the backend format to the frontend format
          const cleanData = rawData.map(parsePage);
          setPages(cleanData);
      }
    } catch (err) {
      console.error("Failed to load pages", err);
    }
  };

  useEffect(() => { loadPages(); }, []);

  // 2. Create Page
  const handleCreatePage = async (parentId?: string | null) => {
    const userJson = localStorage.getItem('lifeflow-user');
    if (!userJson) { toast.error("Login required"); return; }
    const user = JSON.parse(userJson);

    const newPage = {
        id: crypto.randomUUID(),
        title: 'Untitled',
        icon: '📄',
        parentId: parentId || null,
        userId: user.id,
        blocks: [], // Initialize empty blocks
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
    };

    try {
        // Send SERIALIZED data (blocksJson) to backend
        const res = await fetch('/api/pages', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(serializePage(newPage as Page)) 
        });
        
        if (res.ok) {
            await loadPages();
            navigate(`/${newPage.id}`);
        }
    } catch (e) { toast.error("Failed to create"); }
  };

  // 3. Update Page
  const handleUpdatePage = async (updatedPage: Page) => {
    // Optimistic Update (Update UI instantly)
    setPages(prev => prev.map(p => p.id === updatedPage.id ? updatedPage : p));

    try {
        // Send SERIALIZED data to backend
        await fetch('/api/pages', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(serializePage(updatedPage))
        });
    } catch (e) { console.error("Save failed", e); }
  };

  // 4. Delete Page
  const handleDeletePage = async (id: string) => {
     try {
        const res = await fetch(`/api/pages/${id}`, { method: 'DELETE' });
        
        if (res.ok) {
            await loadPages();
            // Smart Redirect: Only go home if we deleted the page we are currently viewing
            if (pageId === id) {
                navigate('/');
            }
        }
     } catch (e) { console.error(e); }
  };

  return (
    <div className="flex h-screen w-full overflow-hidden bg-white dark:bg-[#191919]">
      <Sidebar
        pages={pages}
        currentPageId={pageId || null}
        onSelectPage={(id) => navigate(`/${id}`)}
        onCreatePage={handleCreatePage}
        onDeletePage={handleDeletePage}
      />
      
      <main className="flex-1 h-full flex flex-col overflow-hidden">
        <Topbar 
            pageTitle={pages.find(p => p.id === pageId)?.title || "Lifeflow"} 
            isMobileMenuOpen={isMobileMenuOpen}
            onToggleMobileMenu={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
        />
        
        <div className="flex-1 overflow-auto">
             <Outlet context={{ 
                pages, 
                loadPages, 
                handleUpdatePage, 
                currentPageId: pageId || null 
             }} />
        </div>
      </main>
    </div>
  );
}