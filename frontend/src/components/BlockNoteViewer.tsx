import { useMemo } from 'react';
import { useCreateBlockNote } from "@blocknote/react";
import { BlockNoteView } from "@blocknote/mantine";
import "@blocknote/mantine/style.css";
import "@blocknote/core/fonts/inter.css";
import './blocknote-custom.css';

interface BlockNoteViewerProps {
  content: any;
}

export function BlockNoteViewer({ content }: BlockNoteViewerProps) {
  // Memoize initial content to prevent unnecessary re-creations
  const initialContent = useMemo(() => {
    try {
      // If content is falsy, return undefined to show empty editor
      if (!content) return undefined;
      
      // Parse if string, otherwise use as is
      const parsed = typeof content === 'string' ? JSON.parse(content) : content;
      
      // Ensure it's an array for BlockNote AND valid (non-empty)
      return (Array.isArray(parsed) && parsed.length > 0) ? parsed : undefined;
    } catch (e) {
      console.error("Failed to parse blocknote content", e);
      return undefined;
    }
  }, [content]);

  // Create read-only editor
  const editor = useCreateBlockNote({
    initialContent: initialContent,
  });

  if (!editor) {
    return null;
  }

  return (
    <div className="blocknote-wrapper-readonly">
      <BlockNoteView
        editor={editor}
        editable={false}
        theme="dark" // or dynamic based on app theme
        slashMenu={false}
        sideMenu={false}
      />
    </div>
  );
}
