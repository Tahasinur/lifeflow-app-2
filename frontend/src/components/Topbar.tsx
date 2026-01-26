import { useState, useEffect } from 'react';
import { Menu, Share2, MoreHorizontal, Star, Copy, Check, Users, X, Copy as CopyIcon, Trash2, Lock, Unlock, Type, Maximize2, Settings, Download, Send } from 'lucide-react';
import { toast } from 'sonner';
import { Page } from '../types';
import { Popover, PopoverTrigger, PopoverContent } from './ui/popover';
import { Input } from './ui/input';
import { NotificationBadge } from './NotificationBadge';
import { getUserFirstName } from '../hooks/useDashboard';

interface TabItem {
  id: string;
  page: Page;
}

interface TopbarProps {
  isSidebarOpen: boolean;
  onToggleSidebar: () => void;
  currentPage?: Page;
  currentPageId?: string;
  onToggleFavorite?: () => void;
  onShareToCommunity?: () => void;
  showShareButton?: boolean;
  openTabs?: TabItem[];
  onSelectTab?: (tabId: string) => void;
  onCloseTab?: (tabId: string) => void;
}

export function Topbar({
  isSidebarOpen,
  onToggleSidebar,
  currentPage,
  currentPageId,
  onToggleFavorite,
  onShareToCommunity,
  showShareButton = false,
  openTabs = [],
  onSelectTab,
  onCloseTab,
}: TopbarProps) {
  const [sharePopoverOpen, setSharePopoverOpen] = useState(false);
  const [moreOptionsOpen, setMoreOptionsOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const [isPageLocked, setIsPageLocked] = useState(currentPage?.isLocked || false);
  const [showSmallText, setShowSmallText] = useState(false);
  const [isFullWidth, setIsFullWidth] = useState(false);
  const [firstName, setFirstName] = useState<string>('User');
  const [userId, setUserId] = useState<string | null>(null);

  // Load user's first name on mount
  useEffect(() => {
    const name = getUserFirstName();
    setFirstName(name);

    // Get current user ID
    const token = localStorage.getItem('lifeflow-token');
    if (token) {
      // Extract user ID from token or fetch it
      try {
        const authResponse = fetch('/api/auth/validate', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        }).then((response) => {
          if (response.ok) {
            return response.json();
          }
        });

        authResponse.then((data) => {
          if (data?.userId) {
            setUserId(data.userId);
          }
        });
      } catch (error) {
        console.error('Error fetching user info:', error);
      }
    }
  }, []);

  const handleCopyLink = async () => {
    const url = window.location.href;
    
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      toast.success('Link copied to clipboard');
    } catch (err) {
      try {
        const textArea = document.createElement('textarea');
        textArea.value = url;
        textArea.style.position = 'fixed';
        textArea.style.left = '-999999px';
        textArea.style.top = '-999999px';
        document.body.appendChild(textArea);
        textArea.focus();
        textArea.select();
        
        const successful = document.execCommand('copy');
        document.body.removeChild(textArea);
        
        if (successful) {
          setCopied(true);
          toast.success('Link copied to clipboard');
        } else {
          toast.error('Failed to copy link');
        }
      } catch (fallbackErr) {
        toast.error('Failed to copy link');
        console.error('Copy failed:', fallbackErr);
      }
    }
    
    setTimeout(() => {
      setCopied(false);
    }, 2000);
  };

  const handleShareToCommunity = () => {
    setSharePopoverOpen(false);
    onShareToCommunity?.();
  };

  // More options handlers
  const handleDuplicate = () => {
    toast.success('Page duplicated successfully!');
    setMoreOptionsOpen(false);
  };

  const handleToggleLock = () => {
    setIsPageLocked(!isPageLocked);
    toast.success(isPageLocked ? 'Page unlocked' : 'Page locked');
  };

  const handleMoveTo = () => {
    toast.info('Move to folder feature coming soon');
    setMoreOptionsOpen(false);
  };

  const handleMoveToTrash = () => {
    toast.success('Page moved to trash');
    setMoreOptionsOpen(false);
  };

  const handleDownloadAsJSON = () => {
    if (currentPage) {
      const data = {
        title: currentPage.title,
        icon: currentPage.icon,
        content: currentPage.content || '',
        createdAt: new Date().toISOString(),
      };
      const json = JSON.stringify(data, null, 2);
      const blob = new Blob([json], { type: 'application/json' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${currentPage.title || 'page'}.json`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      toast.success('Page downloaded as JSON');
      setMoreOptionsOpen(false);
    }
  };

  const handleExportAsPDF = () => {
    toast.info('PDF export feature coming soon');
    setMoreOptionsOpen(false);
  };

  const handleCustomizePageStyle = () => {
    toast.info('Page customization panel coming soon');
    setMoreOptionsOpen(false);
  };

  return (
    <div className="flex flex-col border-b border-gray-200 dark:border-[#2F2F2F] bg-white dark:bg-[#191919]">
      {/* Main toolbar */}
      <div className="h-12 flex items-center justify-between px-4">
        <div className="flex items-center gap-3">
          <button
            onClick={onToggleSidebar}
            className="p-2 hover:bg-gray-100 dark:hover:bg-[#2F2F2F] rounded-md transition-colors text-[#37352F] dark:text-[#E3E3E3]"
            title={isSidebarOpen ? 'Hide sidebar' : 'Show sidebar'}
          >
            <Menu className="w-4 h-4" />
          </button>

          <div className="flex items-center gap-2 text-sm text-[#37352F] dark:text-[#E3E3E3]">
            <span className="text-gray-500 dark:text-gray-400">{firstName}'s Workspace</span>
            <span className="text-gray-400 dark:text-gray-500">/</span>
            <span className="flex items-center gap-2">
              <span>{currentPage?.icon || '📄'}</span>
              <span>{currentPage?.title || 'Untitled'}</span>
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {onToggleFavorite && currentPage && (
            <button
              onClick={onToggleFavorite}
              className={`p-2 hover:bg-gray-100 dark:hover:bg-[#2F2F2F] rounded-md transition-colors ${
                currentPage.isFavorite
                  ? 'text-yellow-400'
                  : 'text-[#37352F] dark:text-[#E3E3E3]'
              }`}
              title={currentPage.isFavorite ? 'Remove from favorites' : 'Add to favorites'}
            >
              <Star className={`w-4 h-4 ${currentPage.isFavorite ? 'fill-yellow-400' : ''}`} />
            </button>
          )}

          {userId && (
            <NotificationBadge userId={userId} />
          )}
          
          <Popover open={sharePopoverOpen} onOpenChange={setSharePopoverOpen}>
            <PopoverTrigger asChild>
              <button
                className="flex items-center gap-2 px-3 py-1.5 text-sm hover:bg-gray-100 dark:hover:bg-[#2F2F2F] rounded-md transition-colors text-[#37352F] dark:text-[#E3E3E3]"
              >
                <Share2 className="w-4 h-4" />
                <span>Share</span>
              </button>
            </PopoverTrigger>
            <PopoverContent align="end" className="w-80 bg-white dark:bg-[#252525] border-gray-200 dark:border-[#2F2F2F]">
              <div className="space-y-4">
                <div>
                  <h3 className="text-sm font-semibold text-[#37352F] dark:text-[#E3E3E3]">
                    Share to web
                  </h3>
                </div>

                <div className="flex items-center gap-2">
                  <Input
                    type="text"
                    value={window.location.href}
                    readOnly
                    className="flex-1 text-xs bg-gray-50 dark:bg-[#191919] border-gray-200 dark:border-[#2F2F2F] text-[#37352F] dark:text-[#E3E3E3]"
                  />
                  <button
                    onClick={handleCopyLink}
                    className="flex items-center gap-2 px-3 py-2 text-sm bg-black dark:bg-[#E3E3E3] text-white dark:text-[#191919] rounded-md hover:bg-gray-800 dark:hover:bg-[#FFFFFF] transition-colors whitespace-nowrap"
                  >
                    {copied ? (
                      <>
                        <Check className="w-4 h-4" />
                        <span>Copied</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-4 h-4" />
                        <span>Copy</span>
                      </>
                    )}
                  </button>
                </div>

                {showShareButton && onShareToCommunity && (
                  <>
                    <div className="border-t border-gray-200 dark:border-[#3F3F3F]" />
                    <div>
                      <h3 className="text-sm font-semibold text-[#37352F] dark:text-[#E3E3E3] mb-2">
                        Share to community
                      </h3>
                      <p className="text-xs text-gray-500 dark:text-gray-400 mb-3">
                        Post this page as a template for others to use
                      </p>
                      <button
                        onClick={handleShareToCommunity}
                        className="w-full flex items-center justify-center gap-2 px-3 py-2 text-sm bg-blue-600 hover:bg-blue-700 text-white rounded-md transition-colors"
                      >
                        <Users className="w-4 h-4" />
                        <span>Share to Community</span>
                      </button>
                    </div>
                  </>
                )}
              </div>
            </PopoverContent>
          </Popover>

          <Popover open={moreOptionsOpen} onOpenChange={setMoreOptionsOpen}>
            <PopoverTrigger asChild>
              <button
                className="p-2 hover:bg-gray-100 dark:hover:bg-[#2F2F2F] rounded-md transition-colors text-[#37352F] dark:text-[#E3E3E3]"
                title="More options"
              >
                <MoreHorizontal className="w-4 h-4" />
              </button>
            </PopoverTrigger>
            <PopoverContent align="end" className="w-56 bg-white dark:bg-[#252525] border-gray-200 dark:border-[#2F2F2F] p-0">
              <div className="py-1">
                {/* Copy Link */}
                <button
                  onClick={() => {
                    handleCopyLink();
                    setMoreOptionsOpen(false);
                  }}
                  className="w-full flex items-center gap-3 px-3 py-2 text-sm hover:bg-gray-100 dark:hover:bg-[#2F2F2F] text-[#37352F] dark:text-[#E3E3E3] transition-colors"
                >
                  <Copy className="w-4 h-4" />
                  <span>Copy link</span>
                </button>

                {/* Duplicate */}
                <button
                  onClick={handleDuplicate}
                  className="w-full flex items-center gap-3 px-3 py-2 text-sm hover:bg-gray-100 dark:hover:bg-[#2F2F2F] text-[#37352F] dark:text-[#E3E3E3] transition-colors"
                >
                  <CopyIcon className="w-4 h-4" />
                  <span>Duplicate</span>
                </button>

                {/* Move To */}
                <button
                  onClick={handleMoveTo}
                  className="w-full flex items-center gap-3 px-3 py-2 text-sm hover:bg-gray-100 dark:hover:bg-[#2F2F2F] text-[#37352F] dark:text-[#E3E3E3] transition-colors"
                >
                  <Share2 className="w-4 h-4" />
                  <span>Move to</span>
                </button>

                {/* Move to Trash */}
                <button
                  onClick={handleMoveToTrash}
                  className="w-full flex items-center gap-3 px-3 py-2 text-sm hover:bg-red-50 dark:hover:bg-red-950/30 text-red-600 dark:text-red-400 transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                  <span>Move to Trash</span>
                </button>

                <div className="border-t border-gray-200 dark:border-[#3F3F3F] my-1" />

                {/* Text Size Toggle */}
                <button
                  onClick={() => {
                    setShowSmallText(!showSmallText);
                    toast.success(showSmallText ? 'Default text size' : 'Small text enabled');
                  }}
                  className="w-full flex items-center gap-3 px-3 py-2 text-sm hover:bg-gray-100 dark:hover:bg-[#2F2F2F] text-[#37352F] dark:text-[#E3E3E3] transition-colors"
                >
                  <Type className="w-4 h-4" />
                  <span>Small text</span>
                  <span className={`ml-auto w-4 h-4 rounded border ${showSmallText ? 'bg-blue-600 border-blue-600' : 'border-gray-300 dark:border-gray-600'}`} />
                </button>

                {/* Full Width Toggle */}
                <button
                  onClick={() => {
                    setIsFullWidth(!isFullWidth);
                    toast.success(isFullWidth ? 'Standard width' : 'Full width enabled');
                  }}
                  className="w-full flex items-center gap-3 px-3 py-2 text-sm hover:bg-gray-100 dark:hover:bg-[#2F2F2F] text-[#37352F] dark:text-[#E3E3E3] transition-colors"
                >
                  <Maximize2 className="w-4 h-4" />
                  <span>Full width</span>
                  <span className={`ml-auto w-4 h-4 rounded border ${isFullWidth ? 'bg-blue-600 border-blue-600' : 'border-gray-300 dark:border-gray-600'}`} />
                </button>

                {/* Lock/Unlock */}
                <button
                  onClick={handleToggleLock}
                  className="w-full flex items-center gap-3 px-3 py-2 text-sm hover:bg-gray-100 dark:hover:bg-[#2F2F2F] text-[#37352F] dark:text-[#E3E3E3] transition-colors"
                >
                  {isPageLocked ? (
                    <>
                      <Lock className="w-4 h-4" />
                      <span>Unlock page</span>
                    </>
                  ) : (
                    <>
                      <Unlock className="w-4 h-4" />
                      <span>Lock page</span>
                    </>
                  )}
                </button>

                {/* Customize Page */}
                <button
                  onClick={handleCustomizePageStyle}
                  className="w-full flex items-center gap-3 px-3 py-2 text-sm hover:bg-gray-100 dark:hover:bg-[#2F2F2F] text-[#37352F] dark:text-[#E3E3E3] transition-colors"
                >
                  <Settings className="w-4 h-4" />
                  <span>Customize page</span>
                </button>

                <div className="border-t border-gray-200 dark:border-[#3F3F3F] my-1" />

                {/* Download as JSON */}
                <button
                  onClick={handleDownloadAsJSON}
                  className="w-full flex items-center gap-3 px-3 py-2 text-sm hover:bg-gray-100 dark:hover:bg-[#2F2F2F] text-[#37352F] dark:text-[#E3E3E3] transition-colors"
                >
                  <Download className="w-4 h-4" />
                  <span>Export</span>
                </button>

                {/* Import */}
                <button
                  onClick={() => {
                    toast.info('Import feature coming soon');
                    setMoreOptionsOpen(false);
                  }}
                  className="w-full flex items-center gap-3 px-3 py-2 text-sm hover:bg-gray-100 dark:hover:bg-[#2F2F2F] text-[#37352F] dark:text-[#E3E3E3] transition-colors"
                >
                  <Send className="w-4 h-4" />
                  <span>Import</span>
                </button>
              </div>
            </PopoverContent>
          </Popover>
        </div>
      </div>

      {/* Tabs section */}
      {openTabs && openTabs.length > 0 && (
        <div className="h-10 flex items-center gap-1 px-4 bg-gray-50 dark:bg-[#1A1A1A] border-t border-gray-200 dark:border-[#2F2F2F] overflow-x-auto">
          {openTabs.map((tab, index) => (
            <button
              key={tab.id}
              onClick={() => onSelectTab?.(tab.id)}
              className={`flex items-center gap-2 px-3 py-1.5 text-sm rounded-md transition-colors whitespace-nowrap ${
                currentPageId === tab.id
                  ? 'bg-white dark:bg-[#2F2F2F] text-[#37352F] dark:text-[#E3E3E3]'
                  : 'text-[#9B9A97] dark:text-[#888888] hover:bg-gray-100 dark:hover:bg-[#2F2F2F]'
              }`}
            >
              <span>{tab.page.icon}</span>
              <span className="max-w-[150px] truncate">{tab.page.title || 'Untitled'}</span>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onCloseTab?.(tab.id);
                }}
                className="p-0.5 hover:bg-gray-200 dark:hover:bg-[#3F3F3F] rounded transition-colors"
              >
                <X className="w-3 h-3" />
              </button>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
