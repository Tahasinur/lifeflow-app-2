import { useEffect, useRef } from 'react';
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
import { ModernEditorUI } from './ModernEditorUI';
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
  const contentRef = useRef(content);

  // Update content ref when content prop changes
  useEffect(() => {
    contentRef.current = content;
  }, [content]);

  useEffect(() => {
    if (!editorRef.current) return;

    const initializeEditor = async () => {
      // Destroy existing editor instance
      if (editorInstance.current) {
        try {
          editorInstance.current.destroy();
        } catch (error) {
          console.warn('Error destroying editor:', error);
        }
        editorInstance.current = null;
      }

      // Initialize editor with current content
      editorInstance.current = new EditorJS({
        holder: editorRef.current!,
        readOnly: !editable,
        sanitizer: {
          p: true,
          b: true,
          strong: true,
          i: true,
          em: true,
          u: true,
          s: true,
          a: true,
          code: true,
          pre: true,
          ul: true,
          ol: true,
          li: true,
          blockquote: true,
          figure: true,
          h1: true,
          h2: true,
          h3: true,
          h4: true,
          h5: true,
          h6: true,
          img: { src: true, alt: true }
        },
        tools: {
          header: {
            class: Header as any,
            shortcut: 'CMD+SHIFT+H',
            config: {
              placeholder: 'Heading',
              levels: [1, 2, 3, 4, 5, 6],
              defaultLevel: 2,
            },
          },
          paragraph: {
            class: Paragraph as any,
            inlineToolbar: true,
            shortcut: 'CMD+ALT+P',
          },
          list: {
            class: List as any,
            inlineToolbar: true,
            shortcut: 'CMD+SHIFT+L',
            config: {
              defaultStyle: 'unordered',
            },
          },
          checklist: {
            class: Checklist as any,
            inlineToolbar: true,
            shortcut: 'CMD+SHIFT+C',
          },
          quote: {
            class: Quote as any,
            inlineToolbar: true,
            shortcut: 'CMD+SHIFT+Q',
            config: {
              quotePlaceholder: 'Enter a quote',
              captionPlaceholder: 'Quote author',
            },
          },
          warning: {
            class: Warning as any,
            inlineToolbar: true,
            config: {
              titlePlaceholder: 'Title',
              messagePlaceholder: 'Message',
            },
          },
          code: {
            class: Code as any,
            shortcut: 'CMD+ALT+C',
            config: {
              placeholder: 'Enter code',
            },
          },
          image: {
            class: SimpleImage as any,
            shortcut: 'CMD+ALT+I',
          },
          embed: {
            class: Embed as any,
            config: {
              services: {
                youtube: true,
                coub: true,
                codepen: {
                  regex: /https?:\/\/codepen\.io\/([^\/\?]+)\/pen\/([^\/\?]+)/,
                  embedUrl: 'https://codepen.io/<%= remote_id %>/embed/preview/',
                  width: 600,
                  height: 300,
                },
                instagram: true,
                twitter: true,
                vimeo: true,
                gfycat: true,
                imgur: true,
                vine: true,
                imgur_old: true,
                pinterest: true,
              },
            },
          },
          table: {
            class: Table as any,
            inlineToolbar: true,
          },
          linkTool: {
            class: LinkTool as any,
            config: {
              endpoint: 'http://localhost:8090/api/linkmetadata',
            },
          },
          marker: {
            class: Marker as any,
          },
          inlineCode: {
            class: InlineCode as any,
          },
          delimiter: {
            class: Delimiter as any,
          },
        },
        inlineToolbar: {
          tools: ['marker', 'inlineCode', 'linkTool'],
          shortcut: 'CMD+SHIFT+T',
        },
        toolbar: {
          tools: ['header', 'list', 'checklist', 'quote', 'code', 'table', 'image', 'embed', 'warning', 'delimiter'],
          shouldNotHighlight: ['link'],
        },
        data: normalizeEditorJsContent(contentRef.current),
        minHeight: 500,
        autofocus: true,
        placeholder: 'Press "/" to see available blocks...',
        onChange: async () => {
          try {
            if (editorInstance.current) {
              const data = await editorInstance.current.save();
              onUpdate(data);
            }
          } catch (error) {
            console.error('Editor save error:', error);
          }
        },
      } as any);
    };

    initializeEditor().catch(error => {
      console.error('Failed to initialize editor:', error);
    });

    return () => {
      if (editorInstance.current) {
        try {
          editorInstance.current.destroy();
          editorInstance.current = null;
        } catch (error) {
          console.warn('Error destroying editor on cleanup:', error);
        }
      }
    };
  }, [editable, onUpdate]);

  return (
    <div className="editorjs-container">
      <ModernEditorUI isEditable={editable} />
      <div ref={editorRef} className="editor-js-wrapper" />
    </div>
  );
}

export default EditorJSWrapper;
