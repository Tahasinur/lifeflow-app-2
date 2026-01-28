import { useState, useEffect } from 'react';
import { Outlet, useNavigate } from 'react-router';
import { AnimatePresence, motion } from 'framer-motion';
import { Sidebar } from '../components/Sidebar';
import { Topbar } from '../components/Topbar';
import { ShareModal } from '../components/ShareModal';
import { useDashboard } from '../hooks/useDashboard';
import { useOpenTabs } from '../hooks/useOpenTabs';

export function DashboardLayout() {
  const {
    pages,
    trashPages,
    currentPageId,
    setCurrentPageId,
    handleCreatePage,
    handleMoveToTrash,
    handleRestorePage,
    handlePermanentDelete,
    handleUpdatePage,
  } = useDashboard();

  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);
  const navigate = useNavigate();

  // Get userId from localStorage
  const getUserId = () => {
    const userDataStr = localStorage.getItem('lifeflow-user');
    if (userDataStr) {
      try {
        const userData = JSON.parse(userDataStr);
        return userData.userId;
      } catch (e) {
        console.error('Error parsing user data:', e);
      }
    }
    return null;
  };

  const userId = getUserId();
  const { openTabs, openTab, closeTab } = useOpenTabs(userId);

  // Debug logging
  useEffect(() => {
    console.log('[DashboardLayout] userId:', userId);
    console.log('[DashboardLayout] openTabs:', openTabs);
  }, [userId, openTabs]);

  const toggleSidebar = () => {
    setIsSidebarOpen((prev) => !prev);
  };

  const currentPage = pages.find((p) => p.id === currentPageId);

  // Auto-open tab when a page is selected
  useEffect(() => {
    console.log('[DashboardLayout] Auto-open effect triggered:', {
      currentPageId,
      hasCurrentPage: !!currentPage,
      pageTitle: currentPage?.title,
      userId,
    });
    
    if (currentPage && userId) {
      console.log('[DashboardLayout] Calling openTab for:', currentPage.title);
      openTab(currentPage);
    }
  }, [currentPageId, currentPage, userId, openTab]);

  // Handle tab selection
  const handleSelectTab = (tabId: string) => {
    const tab = openTabs.find(t => t.id === tabId);
    if (tab) {
      setCurrentPageId(tab.pageId);
      navigate(`/dashboard?pageId=${tab.pageId}`);
    }
  };

  // Handle tab close
  const handleCloseTab = async (tabId: string) => {
    const tab = openTabs.find(t => t.id === tabId);
    const success = await closeTab(tabId);
    
    if (success && tab) {
      // If closing the current tab, switch to another tab
      if (tab.pageId === currentPageId) {
        const remainingTabs = openTabs.filter(t => t.id !== tabId);
        if (remainingTabs.length > 0) {
          // Switch to the previous tab or the first available tab
          const currentIndex = openTabs.findIndex(t => t.id === tabId);
          const nextTab = remainingTabs[Math.max(0, currentIndex - 1)];
          setCurrentPageId(nextTab.pageId);
          navigate(`/dashboard?pageId=${nextTab.pageId}`);
        } else {
          // No tabs left, go to dashboard home
          navigate('/dashboard');
        }
      }
    }
  };

  return (
    <div className="flex h-screen bg-white dark:bg-[#191919]">
      {/* Glassmorphic Sidebar */}
      <motion.div
        className={`transition-all duration-300 ease-in-out overflow-hidden ${
          isSidebarOpen ? 'w-64 opacity-100' : 'w-0 opacity-0'
        } backdrop-blur-md bg-white/80 dark:bg-white/10 border-r border-white/20`}
        initial={false}
        animate={{
          width: isSidebarOpen ? 256 : 0,
          opacity: isSidebarOpen ? 1 : 0,
        }}
        transition={{ duration: 0.3, ease: 'easeInOut' }}
      >
        <Sidebar
          pages={pages}
          currentPageId={currentPageId}
          onSelectPage={setCurrentPageId}
          onCreatePage={handleCreatePage}
          onDeletePage={handleMoveToTrash}
        />
      </motion.div>
      
      <main className="flex-1 flex flex-col overflow-hidden">
        <Topbar
          isSidebarOpen={isSidebarOpen}
          onToggleSidebar={toggleSidebar}
          currentPage={currentPage}
          currentPageId={currentPageId || undefined}
          onToggleFavorite={
            currentPage
              ? () => handleUpdatePage({ ...currentPage, isFavorite: !currentPage.isFavorite })
              : undefined
          }
          onShareToCommunity={() => setIsShareModalOpen(true)}
          showShareButton={!!currentPageId}
          openTabs={openTabs.map(tab => ({
            id: tab.id,
            page: tab.page,
          }))}
          onSelectTab={handleSelectTab}
          onCloseTab={handleCloseTab}
        />
        
        {/* Page Transition with Smooth Fade & Slide */}
        <AnimatePresence mode="wait">
          <motion.div
            key={currentPageId}
            className="flex-1 overflow-auto"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.3, ease: 'easeInOut' }}
          >
            <Outlet
              context={{
                pages,
                trashPages,
                currentPageId,
                handleUpdatePage,
                handleRestorePage,
                handlePermanentDelete,
              }}
            />
          </motion.div>
        </AnimatePresence>
      </main>

      <ShareModal
        isOpen={isShareModalOpen}
        onClose={() => setIsShareModalOpen(false)}
        onSuccess={() => {}}
        preSelectedPageId={currentPageId || undefined}
      />
    </div>
  );
}
