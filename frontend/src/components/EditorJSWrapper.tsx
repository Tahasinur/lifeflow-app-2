import { useEffect, useRef, useState } from 'react';
import EditorJS from '@editorjs/editorjs';
import Header from '@editorjs/header';
import Paragraph from '@editorjs/paragraph';
import Code from '@editorjs/code';
import Delimiter from '@editorjs/delimiter';
import SimpleImage from '@editorjs/simple-image';
import List from '@editorjs/list';
import Checklist from '@editorjs/checklist';
import Quote from '@editorjs/quote';
import Embed from '@editorjs/embed';
import Table from '@editorjs/table';
import LinkTool from '@editorjs/link';
import Warning from '@editorjs/warning';
import Marker from '@editorjs/marker';
import InlineCode from '@editorjs/inline-code';
// @ts-ignore - NestedList might not have types
import NestedList from '@editorjs/nested-list';
// @ts-ignore - AttachesTool might not have types  
import AttachesTool from '@editorjs/attaches';
import './editorjs-styles.css';

interface EditorJSWrapperProps {
  content: any;
  onUpdate: (content: any) => void;
  editable?: boolean;
}

/**
 * Validate Editor.js block structure
 */
function isValidEditorJsBlock(block: any): boolean {
  if (!block || typeof block !== 'object') return false;
  if (typeof block.type !== 'string') return false;
  if (!block.data || typeof block.data !== 'object') return false;
  return true;
}

/**
 * Ensure content is in valid Editor.js format with validation
 */
function normalizeEditorJsContent(content: any): any {
  // If no content, return empty
  if (!content) {
    return {
      blocks: [],
      version: '2.31.1',
      time: Date.now()
    };
  }

  // If already in Editor.js format (has blocks array)
  if (Array.isArray(content?.blocks)) {
    const validBlocks = content.blocks.filter((block: any) => {
      if (!isValidEditorJsBlock(block)) {
        console.warn('Invalid block structure:', block);
        return false;
      }
      return true;
    });
    return {
      blocks: validBlocks,
      version: content.version || '2.31.1',
      time: content.time || Date.now()
    };
  }

  // If it's TipTap format (has type: 'doc'), convert to empty
  if (content?.type === 'doc') {
    return {
      blocks: [],
      version: '2.31.1',
      time: Date.now()
    };
  }

  // Otherwise return as is with proper structure
  return {
    blocks: [],
    version: '2.31.1',
    time: Date.now()
  };
}

export function EditorJSWrapper({ content, onUpdate, editable = true }: EditorJSWrapperProps) {
  const editorInstance = useRef<EditorJS | null>(null);
  const editorRef = useRef<HTMLDivElement>(null);
  const isInitialized = useRef(false);
  const [isReady, setIsReady] = useState(false);
  
  // Store the initial content in a ref to prevent re-initialization
  const initialContentRef = useRef(normalizeEditorJsContent(content));

  // Initialize editor only once on mount
  useEffect(() => {
    if (!editorRef.current || isInitialized.current) return;

    const initializeEditor = async () => {
      try {
        // Mark as initialized immediately to prevent double initialization
        isInitialized.current = true;

        editorInstance.current = new EditorJS({
          holder: editorRef.current!,
          readOnly: !editable,
          
          /**
           * Tools configuration
           * This includes all MVP features requested
           */
          tools: {
            // Heading tool
            header: {
              class: Header as any,
              shortcut: 'CMD+SHIFT+H',
              config: {
                placeholder: 'Enter a heading',
                levels: [1, 2, 3, 4, 5, 6],
                defaultLevel: 2,
              },
            },
            
            // Paragraph (default block)
            paragraph: {
              class: Paragraph as any,
              inlineToolbar: true,
            },
            
            // Nested List (replaces simple list for better functionality)
            list: {
              class: NestedList as any,
              inlineToolbar: true,
              shortcut: 'CMD+SHIFT+L',
              config: {
                defaultStyle: 'unordered',
              },
            },
            
            // Checklist
            checklist: {
              class: Checklist as any,
              inlineToolbar: true,
              shortcut: 'CMD+SHIFT+C',
            },
            
            // Quote
            quote: {
              class: Quote as any,
              inlineToolbar: true,
              shortcut: 'CMD+SHIFT+Q',
              config: {
                quotePlaceholder: 'Enter a quote',
                captionPlaceholder: 'Quote\'s author',
              },
            },
            
            // Warning
            warning: {
              class: Warning as any,
              inlineToolbar: true,
              shortcut: 'CMD+SHIFT+W',
              config: {
                titlePlaceholder: 'Title',
                messagePlaceholder: 'Message',
              },
            },
            
            // Code block
            code: {
              class: Code as any,
              shortcut: 'CMD+SHIFT+C',
            },
            
            // Simple Image (no backend)
            image: {
              class: SimpleImage as any,
              shortcut: 'CMD+SHIFT+I',
            },
            
            // Embeds (YouTube, Twitter, etc)
            embed: {
              class: Embed as any,
              inlineToolbar: true,
              config: {
                services: {
                  youtube: true,
                  twitter: true,
                  instagram: true,
                  vimeo: true,
                  gfycat: true,
                  twitch: true,
                  coub: true,
                  codepen: true,
                  imgur: true,
                },
              },
            },
            
            // Table
            table: {
              class: Table as any,
              inlineToolbar: true,
              shortcut: 'CMD+ALT+T',
            },
            
            // Link Tool
            linkTool: {
              class: LinkTool as any,
              config: {
                endpoint: 'http://localhost:8090/api/linkmetadata',
              },
            },
            
            // Attaches
            attaches: {
              class: AttachesTool as any,
              config: {
                endpoint: 'http://localhost:8090/api/uploadFile',
              },
            },
            
            // Delimiter
            delimiter: {
              class: Delimiter as any,
              shortcut: 'CMD+SHIFT+D',
            },
            
            // Inline tools
            marker: {
              class: Marker as any,
              shortcut: 'CMD+SHIFT+M',
            },
            
            inlineCode: {
              class: InlineCode as any,
              shortcut: 'CMD+SHIFT+K',
            },
          },
          
          /**
           * Initial data
           */
          data: initialContentRef.current,
          
          /**
           * Placeholder text
           */
          placeholder: 'Start writing or press "/" for commands...',
          
          /**
           * Auto-focus on the editor
           */
          autofocus: true,
          
          /**
           * Enable drag & drop for blocks
           */
          // @ts-ignore
          onReady: () => {
            setIsReady(true);
            console.log('EditorJS is ready to work!');
          },
          
          /**
           * onChange callback
           * This is called on every change but we debounce the save
           */
          onChange: async (api: any, event: any) => {
            try {
              if (editorInstance.current) {
                const savedData = await editorInstance.current.save();
                onUpdate(savedData);
              }
            } catch (error) {
              console.error('Error saving editor data:', error);
            }
          },
          
          /**
           * Inline toolbar
           */
          inlineToolbar: ['bold', 'italic', 'link', 'marker', 'inlineCode'],
          
          /**
           * Minimum height
           */
          minHeight: 300,
        } as any);

        console.log('EditorJS initialized successfully');
      } catch (error) {
        console.error('Failed to initialize EditorJS:', error);
        isInitialized.current = false;
      }
    };

    initializeEditor();

    // Cleanup function
    return () => {
      if (editorInstance.current) {
        try {
          editorInstance.current.destroy();
          editorInstance.current = null;
        } catch (error) {
          console.warn('Error destroying editor:', error);
        }
      }
      isInitialized.current = false;
    };
  }, []); // Empty dependency array - only initialize once

  // Handle readOnly mode changes
  useEffect(() => {
    if (editorInstance.current && isReady) {
      try {
        // @ts-ignore
        editorInstance.current.readOnly.toggle(!editable);
      } catch (error) {
        console.warn('Error toggling read-only mode:', error);
      }
    }
  }, [editable, isReady]);

  return (
    <div className="editorjs-container">
      <div ref={editorRef} className="editor-js-wrapper" />
    </div>
  );
}

export default EditorJSWrapper;
