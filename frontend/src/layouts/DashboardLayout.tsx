import { useState } from 'react';
import { Outlet } from 'react-router';
import { AnimatePresence, motion } from 'framer-motion';
import { Sidebar } from '../components/Sidebar';
import { Topbar } from '../components/Topbar';
import { ShareModal } from '../components/ShareModal';
import { useDashboard } from '../hooks/useDashboard';

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

  const toggleSidebar = () => {
    setIsSidebarOpen((prev) => !prev);
  };

  const currentPage = pages.find((p) => p.id === currentPageId);

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
