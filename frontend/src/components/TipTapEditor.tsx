import { useState, useRef, useEffect, useCallback } from 'react';
import { ImageIcon, Image as ImageIconLucide } from 'lucide-react';
import { Page } from '../types';
import { EditorJSWrapper } from './EditorJSWrapper';

interface TipTapEditorProps {
  page: Page;
  onUpdatePage: (page: Page) => void;
}

export function TipTapEditor({ page, onUpdatePage }: TipTapEditorProps) {
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [isHoveringCover, setIsHoveringCover] = useState(false);
  const [isHoveringHeader, setIsHoveringHeader] = useState(false);
  const titleInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isEditingTitle && titleInputRef.current) {
      titleInputRef.current.focus();
      titleInputRef.current.select();
    }
  }, [isEditingTitle]);

  const handleTitleChange = (newTitle: string) => {
    onUpdatePage({
      ...page,
      title: newTitle || 'Untitled',
      updatedAt: new Date().toISOString(),
    });
  };

  const handleIconChange = () => {
    const icons = ['📄', '📝', '📋', '📌', '💡', '🎯', '✨', '🚀', '📚', '🎨', '💼', '🏠', '⭐', '🔥', '💻', '📱'];
    const randomIcon = icons[Math.floor(Math.random() * icons.length)];
    onUpdatePage({
      ...page,
      icon: randomIcon,
      updatedAt: new Date().toISOString(),
    });
  };

  const handleAddCover = () => {
    const coverImages = [
      'https://images.unsplash.com/photo-1579546929518-9e396f3cc809?w=1200',
      'https://images.unsplash.com/photo-1557683316-973673baf926?w=1200',
      'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=1200',
      'https://images.unsplash.com/photo-1519681393784-d120267933ba?w=1200',
      'https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?w=1200',
      'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=1200',
      'https://images.unsplash.com/photo-1518837695005-2083093ee35b?w=1200',
      'https://images.unsplash.com/photo-1472214103451-9374bd1c798e?w=1200',
    ];
    const randomCover = coverImages[Math.floor(Math.random() * coverImages.length)];
    onUpdatePage({
      ...page,
      coverImage: randomCover,
      updatedAt: new Date().toISOString(),
    });
  };

  const handleRemoveCover = () => {
    onUpdatePage({
      ...page,
      coverImage: null,
      updatedAt: new Date().toISOString(),
    });
  };

  const handleEditorUpdate = useCallback((content: any) => {
    onUpdatePage({
      ...page,
      editorContent: content,
      updatedAt: new Date().toISOString(),
    });
  }, [page, onUpdatePage]);

  const editorContent = page.editorContent || convertBlocksToTipTap(page.blocks);

  return (
    <div className="h-full flex flex-col bg-white dark:bg-[#0a0a0a]">
      {page.coverImage && (
        <div 
          className="relative h-56 w-full bg-cover bg-center group overflow-hidden"
          style={{ backgroundImage: `url(${page.coverImage})` }}
          onMouseEnter={() => setIsHoveringCover(true)}
          onMouseLeave={() => setIsHoveringCover(false)}
        >
          {/* Dark overlay gradient */}
          <div className="absolute inset-0 bg-gradient-to-b from-black/10 via-transparent to-transparent group-hover:from-black/40 group-hover:via-black/20 transition-all duration-300" />
          
          {isHoveringCover && (
            <div className="absolute inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center gap-3 animate-in fade-in duration-200">
              <button
                onClick={handleAddCover}
                className="px-4 py-2.5 bg-white dark:bg-[#2F2F2F] text-[#37352F] dark:text-[#E3E3E3] rounded-lg text-sm hover:bg-gray-50 dark:hover:bg-[#3F3F3F] font-medium transition-all hover:scale-105 active:scale-95 shadow-lg"
              >
                Change cover
              </button>
              <button
                onClick={handleRemoveCover}
                className="px-4 py-2.5 bg-red-500/90 dark:bg-red-600/90 text-white rounded-lg text-sm hover:bg-red-600 dark:hover:bg-red-700 font-medium transition-all hover:scale-105 active:scale-95 shadow-lg"
              >
                Remove
              </button>
            </div>
          )}
        </div>
      )}

      <div 
        className="px-12 pt-8 pb-2 border-b border-gray-100 dark:border-[#2F2F2F] transition-colors"
        onMouseEnter={() => setIsHoveringHeader(true)}
        onMouseLeave={() => setIsHoveringHeader(false)}
      >
        {isHoveringHeader && !page.coverImage && (
          <div className="flex gap-2 mb-3 transition-all animate-in fade-in slide-in-from-top-2 duration-200">
            <button
              onClick={handleIconChange}
              className="flex items-center gap-1.5 px-2.5 py-1.5 text-xs text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-[#2F2F2F] rounded-md transition-all hover:text-gray-700 dark:hover:text-gray-300 font-medium"
            >
              <span>😀</span>
              <span>Change icon</span>
            </button>
            <button
              onClick={handleAddCover}
              className="flex items-center gap-1.5 px-2.5 py-1.5 text-xs text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-[#2F2F2F] rounded-md transition-all hover:text-gray-700 dark:hover:text-gray-300 font-medium"
            >
              <ImageIcon size={14} />
              <span>Add cover</span>
            </button>
          </div>
        )}

        <div className="flex items-start gap-4">
          <button
            onClick={handleIconChange}
            className="text-5xl hover:bg-gray-100 dark:hover:bg-[#2F2F2F] rounded-lg p-2 transition-all hover:scale-110 active:scale-95 flex-shrink-0"
            title="Change icon"
          >
            {page.icon || '📄'}
          </button>
          
          {isEditingTitle ? (
            <input
              ref={titleInputRef}
              type="text"
              value={page.title}
              onChange={(e) => handleTitleChange(e.target.value)}
              onBlur={() => setIsEditingTitle(false)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') setIsEditingTitle(false);
              }}
              className="text-4xl font-bold bg-gradient-to-b from-[#37352F] to-[#37352F] dark:from-[#FFFFFF] dark:to-[#FFFFFF] dark:bg-clip-text dark:text-transparent border-b-2 border-blue-500 outline-none w-full placeholder-gray-300 dark:placeholder-gray-600"
              placeholder="Untitled"
              autoFocus
            />
          ) : (
            <h1 
              onClick={() => setIsEditingTitle(true)}
              className="text-4xl font-bold bg-gradient-to-b from-[#37352F] to-[#37352F] dark:from-[#FFFFFF] dark:to-[#FFFFFF] dark:bg-clip-text dark:text-transparent cursor-text hover:bg-gray-50 dark:hover:bg-[#2F2F2F]/50 rounded-lg px-3 py-1 -mx-3 transition-all active:bg-gray-100 dark:active:bg-[#2F2F2F] leading-tight"
            >
              {page.title || 'Untitled'}
            </h1>
          )}
        </div>
      </div>

      <div className="flex-1 overflow-hidden">
        <EditorJSWrapper
          content={editorContent}
          onUpdate={handleEditorUpdate}
          editable={true}
        />
      </div>
    </div>
  );
}

function convertBlocksToTipTap(blocks: any[]): any {
  // Convert old block format to Editor.js format
  if (!blocks || blocks.length === 0) {
    return {
      blocks: [],
      version: '2.31.1',
      time: Date.now()
    };
  }

  const editorBlocks = blocks.map(block => {
    switch (block.type) {
      case 'heading1':
        return {
          type: 'header',
          data: { text: block.content || '', level: 1 }
        };
      case 'heading2':
        return {
          type: 'header',
          data: { text: block.content || '', level: 2 }
        };
      case 'heading3':
        return {
          type: 'header',
          data: { text: block.content || '', level: 3 }
        };
      case 'bullet':
        return {
          type: 'list',
          data: { 
            style: 'unordered', 
            items: Array.isArray(block.items) ? block.items : [block.content || '']
          }
        };
      case 'numbered':
        return {
          type: 'list',
          data: { 
            style: 'ordered', 
            items: Array.isArray(block.items) ? block.items : [block.content || '']
          }
        };
      case 'todo':
        return {
          type: 'checklist',
          data: { items: [{ text: block.content || '', checked: block.checked || false }] }
        };
      case 'quote':
        return {
          type: 'quote',
          data: { text: block.content || '', caption: '', alignment: 'left' }
        };
      case 'code':
        return {
          type: 'code',
          data: { code: block.content || '', language: block.language || 'javascript' }
        };
      case 'divider':
        return {
          type: 'delimiter',
          data: {}
        };
      case 'image':
        return {
          type: 'image',
          data: { url: block.src || block.content, caption: '', withBorder: false, withBackground: false, stretched: false }
        };
      default:
        return {
          type: 'paragraph',
          data: { text: block.content || '' }
        };
    }
  });

  return {
    blocks: editorBlocks,
    version: '2.31.1',
    time: Date.now()
  };
}

export default TipTapEditor;
