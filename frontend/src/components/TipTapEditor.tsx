import { useState, useRef, useEffect, useCallback } from 'react';
import { ImageIcon, Image as ImageIconLucide } from 'lucide-react';
import { Page } from '../types';
import { LifeflowEditor } from './LifeflowEditor';

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
    <div className="h-full flex flex-col">
      {page.coverImage && (
        <div 
          className="relative h-48 w-full bg-cover bg-center group"
          style={{ backgroundImage: `url(${page.coverImage})` }}
          onMouseEnter={() => setIsHoveringCover(true)}
          onMouseLeave={() => setIsHoveringCover(false)}
        >
          {isHoveringCover && (
            <div className="absolute inset-0 bg-black/30 flex items-center justify-center gap-2">
              <button
                onClick={handleAddCover}
                className="px-3 py-1.5 bg-white/90 dark:bg-[#2F2F2F] text-[#37352F] dark:text-[#E3E3E3] rounded text-sm hover:bg-white dark:hover:bg-[#3F3F3F]"
              >
                Change cover
              </button>
              <button
                onClick={handleRemoveCover}
                className="px-3 py-1.5 bg-white/90 dark:bg-[#2F2F2F] text-red-600 dark:text-red-400 rounded text-sm hover:bg-white dark:hover:bg-[#3F3F3F]"
              >
                Remove
              </button>
            </div>
          )}
        </div>
      )}

      <div 
        className="px-12 pt-6 pb-2"
        onMouseEnter={() => setIsHoveringHeader(true)}
        onMouseLeave={() => setIsHoveringHeader(false)}
      >
        {isHoveringHeader && !page.coverImage && (
          <div className="flex gap-2 mb-2 transition-opacity">
            <button
              onClick={handleIconChange}
              className="flex items-center gap-1 px-2 py-1 text-xs text-gray-500 hover:bg-gray-100 dark:hover:bg-[#2F2F2F] rounded"
            >
              <span>😀</span>
              <span>Add icon</span>
            </button>
            <button
              onClick={handleAddCover}
              className="flex items-center gap-1 px-2 py-1 text-xs text-gray-500 hover:bg-gray-100 dark:hover:bg-[#2F2F2F] rounded"
            >
              <ImageIcon size={14} />
              <span>Add cover</span>
            </button>
          </div>
        )}

        <div className="flex items-start gap-3">
          <button
            onClick={handleIconChange}
            className="text-5xl hover:bg-gray-100 dark:hover:bg-[#2F2F2F] rounded p-1 transition-colors"
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
              className="text-4xl font-bold bg-transparent border-none outline-none w-full text-[#37352F] dark:text-[#FFFFFF]"
              placeholder="Untitled"
            />
          ) : (
            <h1 
              onClick={() => setIsEditingTitle(true)}
              className="text-4xl font-bold text-[#37352F] dark:text-[#FFFFFF] cursor-text hover:bg-gray-50 dark:hover:bg-[#252525] rounded px-1 -mx-1"
            >
              {page.title || 'Untitled'}
            </h1>
          )}
        </div>
      </div>

      <div className="flex-1 overflow-hidden">
        <LifeflowEditor
          content={editorContent}
          onUpdate={handleEditorUpdate}
          editable={true}
        />
      </div>
    </div>
  );
}

function convertBlocksToTipTap(blocks: any[]): any {
  if (!blocks || blocks.length === 0) {
    return {
      type: 'doc',
      content: [
        { type: 'paragraph' }
      ]
    };
  }

  const content = blocks.map(block => {
    switch (block.type) {
      case 'heading1':
        return {
          type: 'heading',
          attrs: { level: 1 },
          content: block.content ? [{ type: 'text', text: block.content }] : undefined
        };
      case 'heading2':
        return {
          type: 'heading',
          attrs: { level: 2 },
          content: block.content ? [{ type: 'text', text: block.content }] : undefined
        };
      case 'heading3':
        return {
          type: 'heading',
          attrs: { level: 3 },
          content: block.content ? [{ type: 'text', text: block.content }] : undefined
        };
      case 'bullet':
        return {
          type: 'bulletList',
          content: [{
            type: 'listItem',
            content: [{
              type: 'paragraph',
              content: block.content ? [{ type: 'text', text: block.content }] : undefined
            }]
          }]
        };
      case 'numbered':
        return {
          type: 'orderedList',
          content: [{
            type: 'listItem',
            content: [{
              type: 'paragraph',
              content: block.content ? [{ type: 'text', text: block.content }] : undefined
            }]
          }]
        };
      case 'todo':
        return {
          type: 'taskList',
          content: [{
            type: 'taskItem',
            attrs: { checked: block.checked || false },
            content: [{
              type: 'paragraph',
              content: block.content ? [{ type: 'text', text: block.content }] : undefined
            }]
          }]
        };
      case 'quote':
        return {
          type: 'blockquote',
          content: [{
            type: 'paragraph',
            content: block.content ? [{ type: 'text', text: block.content }] : undefined
          }]
        };
      case 'code':
        return {
          type: 'codeBlock',
          attrs: { language: block.language || 'javascript' },
          content: block.content ? [{ type: 'text', text: block.content }] : undefined
        };
      case 'divider':
        return { type: 'horizontalRule' };
      case 'image':
        return {
          type: 'image',
          attrs: { src: block.src || block.content }
        };
      default:
        return {
          type: 'paragraph',
          content: block.content ? [{ type: 'text', text: block.content }] : undefined
        };
    }
  });

  return {
    type: 'doc',
    content
  };
}

export default TipTapEditor;
