import { useState, useRef, useEffect, useMemo } from 'react';
import { 
  useCreateBlockNote, 
  SuggestionMenuController, 
  getDefaultReactSlashMenuItems 
} from "@blocknote/react";
import { BlockNoteView } from "@blocknote/mantine";
import "@blocknote/mantine/style.css";
import "@blocknote/core/fonts/inter.css";
import './blocknote-custom.css';
import { Page } from '../types';
import { ImageIcon, Image as ImageIconLucide, Calendar as CalendarIcon } from 'lucide-react';

interface BlockNoteEditorWrapperProps {
  page: Page;
  onUpdatePage: (updatedPage: Page) => void;
}


/**
 * BlockNote Editor - True Notion-like editor
 * Features:
 * - Slash commands (/) work anywhere
 * - Drag and drop blocks
 * - Modern UI matching Notion
 * - Custom calendar/date picker block
 */
export function BlockNoteEditorWrapper({ page, onUpdatePage }: BlockNoteEditorWrapperProps) {
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

  // Convert EditorJS format to BlockNote format safely
  const initialContent = useMemo(() => {
    try {
      return convertToBlockNoteFormat(page.editorContent);
    } catch (error) {
      console.error('Error converting content:', error);
      return undefined;
    }
  }, []);

  // Create editor instance only once
  const editor = useCreateBlockNote({
    initialContent: initialContent,
  });

  // Handle content changes
  const handleChange = () => {
    try {
      const blocks = editor.document;
      onUpdatePage({
        ...page,
        editorContent: blocks,
        updatedAt: new Date().toISOString(),
      });
    } catch (error) {
      console.error('Error saving content:', error);
    }
  };

  const handleTitleChange = (newTitle: string) => {
    onUpdatePage({
      ...page,
      title: newTitle || 'Untitled',
      updatedAt: new Date().toISOString(),
    });
  };

  const handleIconChange = (emoji: string) => {
    onUpdatePage({
      ...page,
      icon: emoji,
      updatedAt: new Date().toISOString(),
    });
  };

  const handleCoverChange = () => {
    const imageUrl = prompt('Enter image URL:');
    if (imageUrl) {
      onUpdatePage({
        ...page,
        coverImage: imageUrl,
        updatedAt: new Date().toISOString(),
      });
    }
  };

  const handleRemoveCover = () => {
    onUpdatePage({
      ...page,
      coverImage: null,
      updatedAt: new Date().toISOString(),
    });
  };

  return (
    <div className="notion-page h-full overflow-auto">
      {/* Cover Image */}
      <div
        className="relative"
        onMouseEnter={() => setIsHoveringCover(true)}
        onMouseLeave={() => setIsHoveringCover(false)}
      >
        {page.coverImage ? (
          <div className="relative w-full h-64 bg-gray-100 dark:bg-gray-800">
            <img
              src={page.coverImage}
              alt="Cover"
              className="w-full h-full object-cover"
            />
            {isHoveringCover && (
              <div className="absolute top-4 right-4 flex gap-2">
                <button
                  onClick={handleCoverChange}
                  className="px-3 py-1.5 bg-white dark:bg-gray-800 text-sm rounded shadow hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                >
                  Change cover
                </button>
                <button
                  onClick={handleRemoveCover}
                  className="px-3 py-1.5 bg-white dark:bg-gray-800 text-sm rounded shadow hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                >
                  Remove
                </button>
              </div>
            )}
          </div>
        ) : (
          isHoveringCover && (
            <div className="relative w-full h-32 bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
              <button
                onClick={handleCoverChange}
                className="px-4 py-2 bg-white dark:bg-gray-800 text-sm rounded shadow hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors flex items-center gap-2"
              >
                <ImageIconLucide size={16} />
                Add cover
              </button>
            </div>
          )
        )}
      </div>

      {/* Header: Title and Icon */}
      <div
        className="px-16 pt-6 pb-2"
        onMouseEnter={() => setIsHoveringHeader(true)}
        onMouseLeave={() => setIsHoveringHeader(false)}
      >
        <div className="flex items-start gap-2 mb-2">
          {/* Icon */}
          <button
            className="text-6xl hover:bg-gray-100 dark:hover:bg-gray-800 rounded p-1 transition-colors"
            onClick={() => {
              const emoji = prompt('Enter an emoji:', page.icon);
              if (emoji) handleIconChange(emoji);
            }}
            title="Change icon"
          >
            {page.icon || '📄'}
          </button>

          {isHoveringHeader && !page.icon && (
            <button
              onClick={() => {
                const emoji = prompt('Enter an emoji:');
                if (emoji) handleIconChange(emoji);
              }}
              className="text-sm text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 px-2 py-1 hover:bg-gray-100 dark:hover:bg-gray-800 rounded transition-colors"
            >
              Add icon
            </button>
          )}
        </div>

        {/* Title */}
        {isEditingTitle ? (
          <input
            ref={titleInputRef}
            type="text"
            value={page.title}
            onChange={(e) => handleTitleChange(e.target.value)}
            onBlur={() => setIsEditingTitle(false)}
            onKeyDown={(e) => e.key === 'Enter' && setIsEditingTitle(false)}
            className="text-5xl font-bold w-full bg-transparent border-none outline-none text-gray-900 dark:text-gray-100 placeholder-gray-400"
            placeholder="Untitled"
          />
        ) : (
          <h1
            onClick={() => setIsEditingTitle(true)}
            className="text-5xl font-bold cursor-text text-gray-900 dark:text-gray-100 hover:bg-gray-50 dark:hover:bg-gray-900 rounded px-1 -ml-1 transition-colors"
          >
            {page.title || 'Untitled'}
          </h1>
        )}
      </div>

      {/* BlockNote Editor */}
      <div className="blocknote-wrapper px-16 pb-16 pt-2">
        <BlockNoteView
          editor={editor}
          editable={true}
          onChange={handleChange}
          theme="dark"
          slashMenu={false}
          data-theming-css-variables-demo
        >
          <SuggestionMenuController
            triggerCharacter={"/"}
            getItems={async (query) => {
              const defaultItems = getDefaultReactSlashMenuItems(editor);
              const customItems = [
                ...defaultItems,
                {
                  title: "Calendar",
                  onItemClick: () => {
                    const currentBlock = editor.getTextCursorPosition().block;
                    
                    // Generate a simple calendar placeholder for current month
                    const now = new Date();
                    const monthName = now.toLocaleString('default', { month: 'long', year: 'numeric' });
                    
                    // Insert a simple paragraph with calendar placeholder
                    editor.insertBlocks(
                      [
                        {
                          type: "paragraph",
                          content: [
                            {
                              type: "text",
                              text: `📅 Calendar - ${monthName}`,
                              styles: { bold: true },
                            },
                          ],
                        },
                        {
                          type: "paragraph",
                          content: [
                            {
                              type: "text",
                              text: "Sun  Mon  Tue  Wed  Thu  Fri  Sat",
                              styles: { code: true },
                            },
                          ],
                        },
                        {
                          type: "paragraph",
                          content: [
                            {
                              type: "text",
                              text: " 1    2    3    4    5    6    7",
                              styles: { code: true },
                            },
                          ],
                        },
                        {
                          type: "paragraph",
                          content: [
                            {
                              type: "text",
                              text: " 8    9   10   11   12   13   14",
                              styles: { code: true },
                            },
                          ],
                        },
                        {
                          type: "paragraph",
                          content: [
                            {
                              type: "text",
                              text: "15   16   17   18   19   20   21",
                              styles: { code: true },
                            },
                          ],
                        },
                        {
                          type: "paragraph",
                          content: [
                            {
                              type: "text",
                              text: "22   23   24   25   26   27   28",
                              styles: { code: true },
                            },
                          ],
                        },

                      ],
                      currentBlock,
                      "after"
                    );
                    
                    // If the current block is empty, remove it
                    if (
                      Array.isArray(currentBlock.content) &&
                      currentBlock.content.length === 0
                    ) {
                      editor.removeBlocks([currentBlock]);
                    }
                  },
                  aliases: ["calendar", "date", "planner"],
                  group: "Other",
                  icon: <CalendarIcon size={18} />,
                  subtext: "Insert a calendar",
                },
              ];
              
              if (!query) return customItems;

              
              return customItems.filter((item) => {
                const lowerQuery = query.toLowerCase();
                return (
                  item.title.toLowerCase().includes(lowerQuery) ||
                  (item.aliases &&
                    item.aliases.some((alias) =>
                      alias.toLowerCase().includes(lowerQuery)
                    ))
                );
              });
            }}
          />
        </BlockNoteView>
      </div>
    </div>
  );
}

/**
 * Convert EditorJS format to BlockNote format
 * For now, start with empty content to avoid conversion errors
 */
function convertToBlockNoteFormat(content: any): any[] | undefined {
  // If content is already in BlockNote format (array), return it
  if (Array.isArray(content) && content.length > 0) {
    return content;
  }
  
  // TODO: Implement proper conversion from EditorJS to BlockNote format if needed
  // For now, return undefined to start with empty editor if no valid BlockNote content
  return undefined;
}

export default BlockNoteEditorWrapper;
