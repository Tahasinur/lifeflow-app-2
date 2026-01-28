import { useState, useEffect } from 'react';
import { X, Copy, Check } from 'lucide-react';
import { toast } from 'sonner';
import { Page } from '../types';

interface ShareModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  preSelectedPageId?: string;
}

export function ShareModal({ isOpen, onClose, onSuccess, preSelectedPageId }: ShareModalProps) {
  const [pages, setPages] = useState<Page[]>([]);
  const [selectedPageId, setSelectedPageId] = useState('');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [postType, setPostType] = useState<'template' | 'blog' | 'workspace_update'>('template');
  const [tags, setTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [isPageLocked, setIsPageLocked] = useState(false);
  const [shareLink, setShareLink] = useState('');
  const [linkCopied, setLinkCopied] = useState(false);

  useEffect(() => {
    if (isOpen) {
      loadPages();
    }
  }, [isOpen]);

  useEffect(() => {
    if (preSelectedPageId && pages.length > 0) {
      setPostType('template');
      setSelectedPageId(preSelectedPageId);
      setIsPageLocked(true);
      
      const selectedPage = pages.find(p => p.id === preSelectedPageId);
      if (selectedPage) {
        setTitle(selectedPage.title || 'Untitled');
      }
    } else if (!preSelectedPageId) {
      setIsPageLocked(false);
    }
  }, [preSelectedPageId, pages]);

  const loadPages = async () => {
    const storedUser = localStorage.getItem('lifeflow-user');
    const userId = storedUser ? JSON.parse(storedUser).id : null;
    
    try {
      const res = await fetch('/api/pages', {
        headers: userId ? { 'X-User-Id': userId } : {}
      });
      if (res.ok) {
        const data = await res.json();
        setPages(data || []);
      } else {
        console.error('Failed to load pages:', res.statusText);
        setPages([]);
      }
    } catch (err) {
      console.error('Failed to load pages:', err);
      setPages([]);
    }
  };

  const handleAddTag = () => {
    if (tagInput.trim() && !tags.includes(tagInput.trim())) {
      setTags([...tags, tagInput.trim()]);
      setTagInput('');
    }
  };

  const handleRemoveTag = (tag: string) => {
    setTags(tags.filter(t => t !== tag));
  };

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(shareLink);
      setLinkCopied(true);
      toast.success('Link copied to clipboard');
      setTimeout(() => setLinkCopied(false), 2000);
    } catch (err) {
      try {
        const textArea = document.createElement('textarea');
        textArea.value = shareLink;
        textArea.style.position = 'fixed';
        textArea.style.left = '-999999px';
        document.body.appendChild(textArea);
        textArea.select();
        const successful = document.execCommand('copy');
        document.body.removeChild(textArea);
        
        if (successful) {
          setLinkCopied(true);
          toast.success('Link copied to clipboard');
          setTimeout(() => setLinkCopied(false), 2000);
        } else {
          toast.error('Failed to copy link');
        }
      } catch (fallbackErr) {
        toast.error('Failed to copy link');
      }
    }
  };

  const handleClose = () => {
    setTitle('');
    setDescription('');
    setSelectedPageId('');
    setTags([]);
    setPostType('template');
    setIsPageLocked(false);
    onClose();
  };

  const handleSubmit = async () => {
    if (!title.trim()) {
      toast.error('Please enter a title');
      return;
    }

    const storedUser = localStorage.getItem('lifeflow-user');
    if (!storedUser) {
      toast.error('Please log in to share');
      return;
    }

    const user = JSON.parse(storedUser);
    setLoading(true);

    try {
      const res = await fetch('/api/feed', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'X-User-Id': String(user.id),
          'Authorization': `Bearer ${localStorage.getItem('lifeflow-token')}`
        },
        body: JSON.stringify({
          title,
          description,
          type: postType,
          sourcePageId: selectedPageId || null,
          tags,
          userId: String(user.id)
        })
      });

      if (res.ok) {
        const data = await res.json();
        // Generate a shareable link
        const link = `${window.location.origin}/community/${data.id || 'shared'}`;
        setShareLink(link);
        toast.success('Post shared successfully!');
        onSuccess();
        // Don't close immediately to show the share link
      } else {
        toast.error('Failed to share post');
      }
    } catch (err) {
      console.error('Share error:', err);
      toast.error('Failed to share post');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  const selectedPage = pages.find(p => p.id === selectedPageId);

  // If link was copied, show the link display
  if (shareLink) {
    return (
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
        <div className="bg-white dark:bg-[#202020] rounded-lg w-full max-w-lg mx-4 max-h-[90vh] overflow-auto">
          <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-[#2F2F2F]">
            <h3 className="font-semibold text-[#37352F] dark:text-[#FFFFFF]">Share Link</h3>
            <button 
              onClick={handleClose}
              className="p-1 hover:bg-gray-100 dark:hover:bg-[#2F2F2F] rounded"
            >
              <X size={20} className="text-gray-500" />
            </button>
          </div>

          <div className="p-6 space-y-4">
            <div>
              <h4 className="text-sm font-medium text-[#37352F] dark:text-[#E3E3E3] mb-3">
                Your post has been shared!
              </h4>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                Copy the link below to share with others:
              </p>
            </div>

            <div className="flex items-center gap-2">
              <input
                type="text"
                value={shareLink}
                readOnly
                className="flex-1 px-3 py-2 border border-gray-300 dark:border-[#3F3F3F] rounded-lg bg-gray-50 dark:bg-[#191919] text-[#37352F] dark:text-[#E3E3E3] text-sm focus:outline-none"
              />
              <button
                onClick={handleCopyLink}
                className="flex items-center gap-2 px-3 py-2 text-sm bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors whitespace-nowrap"
              >
                {linkCopied ? (
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
          </div>

          <div className="p-4 border-t border-gray-200 dark:border-[#2F2F2F] flex justify-end">
            <button
              onClick={handleClose}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm"
            >
              Done
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-[#202020] rounded-lg w-full max-w-lg mx-4 max-h-[90vh] overflow-auto">
        <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-[#2F2F2F]">
          <h3 className="font-semibold text-[#37352F] dark:text-[#FFFFFF]">Share to Community</h3>
          <button 
            onClick={handleClose}
            className="p-1 hover:bg-gray-100 dark:hover:bg-[#2F2F2F] rounded"
          >
            <X size={20} className="text-gray-500" />
          </button>
        </div>

        <div className="p-4 space-y-4">
          <div>
            <label className="block text-sm font-medium text-[#37352F] dark:text-[#E3E3E3] mb-1">
              Post Type
            </label>
            <select
              value={postType}
              onChange={(e) => setPostType(e.target.value as any)}
              className="w-full px-3 py-2 border border-gray-300 dark:border-[#3F3F3F] rounded-lg bg-white dark:bg-[#191919] text-[#37352F] dark:text-[#E3E3E3] text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="template">Template</option>
              <option value="blog">Blog Post</option>
              <option value="workspace_update">Workspace Update</option>
            </select>
          </div>

          {postType === 'template' && (
            <div>
              <label className="block text-sm font-medium text-[#37352F] dark:text-[#E3E3E3] mb-1">
                Select Page to Share
              </label>
              {isPageLocked && selectedPage ? (
                <div className="w-full px-3 py-2 border border-gray-300 dark:border-[#3F3F3F] rounded-lg bg-gray-100 dark:bg-[#2F2F2F] text-[#37352F] dark:text-[#E3E3E3] text-sm">
                  {selectedPage.icon || '📄'} {selectedPage.title || 'Untitled'}
                </div>
              ) : (
                <select
                  value={selectedPageId}
                  onChange={(e) => setSelectedPageId(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-[#3F3F3F] rounded-lg bg-white dark:bg-[#191919] text-[#37352F] dark:text-[#E3E3E3] text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">-- Select a page --</option>
                  {pages.map(page => (
                    <option key={page.id} value={page.id}>
                      {page.icon || '📄'} {page.title || 'Untitled'}
                    </option>
                  ))}
                </select>
              )}
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-[#37352F] dark:text-[#E3E3E3] mb-1">
              Title *
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Give your post a title"
              className="w-full px-3 py-2 border border-gray-300 dark:border-[#3F3F3F] rounded-lg bg-white dark:bg-[#191919] text-[#37352F] dark:text-[#E3E3E3] text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-[#37352F] dark:text-[#E3E3E3] mb-1">
              Description
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Tell others about your post..."
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 dark:border-[#3F3F3F] rounded-lg bg-white dark:bg-[#191919] text-[#37352F] dark:text-[#E3E3E3] text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-[#37352F] dark:text-[#E3E3E3] mb-1">
              Tags
            </label>
            <div className="flex gap-2 flex-wrap mb-2">
              {tags.map((tag, idx) => (
                <span 
                  key={idx} 
                  className="px-2 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 text-xs rounded-full flex items-center gap-1"
                >
                  {tag}
                  <button onClick={() => handleRemoveTag(tag)} className="hover:text-blue-800">
                    <X size={12} />
                  </button>
                </span>
              ))}
            </div>
            <div className="flex gap-2">
              <input
                type="text"
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddTag())}
                placeholder="Add a tag"
                className="flex-1 px-3 py-2 border border-gray-300 dark:border-[#3F3F3F] rounded-lg bg-white dark:bg-[#191919] text-[#37352F] dark:text-[#E3E3E3] text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <button
                onClick={handleAddTag}
                className="px-3 py-2 bg-gray-100 dark:bg-[#2F2F2F] text-[#37352F] dark:text-[#E3E3E3] rounded-lg hover:bg-gray-200 dark:hover:bg-[#3F3F3F] text-sm"
              >
                Add
              </button>
            </div>
          </div>
        </div>

        <div className="p-4 border-t border-gray-200 dark:border-[#2F2F2F] flex justify-end gap-2">
          <button
            onClick={handleClose}
            className="px-4 py-2 text-[#37352F] dark:text-[#E3E3E3] hover:bg-gray-100 dark:hover:bg-[#2F2F2F] rounded-lg text-sm"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={loading || !title.trim()}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed text-sm"
          >
            {loading ? 'Sharing...' : 'Share'}
          </button>
        </div>
      </div>
    </div>
  );
}
