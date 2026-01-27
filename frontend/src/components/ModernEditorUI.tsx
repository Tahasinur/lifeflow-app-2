import { useEffect, useState } from 'react';
import { Plus, X, Copy, Trash2 } from 'lucide-react';

interface ModernEditorUIProps {
  isEditable: boolean;
}

/**
 * Modern Editor UI Enhancement
 * Adds visual feedback and modern interactions for Editor.js
 */
export function ModernEditorUI({ isEditable }: ModernEditorUIProps) {
  const [hoveredBlock, setHoveredBlock] = useState<string | null>(null);

  useEffect(() => {
    // Enhance block hover interactions
    const editor = document.querySelector('.codex-editor');
    if (!editor) return;

    const blocks = editor.querySelectorAll('.ce-block');
    
    blocks.forEach((block: Element, index: number) => {
      const blockId = `block-${index}`;
      (block as HTMLElement).id = blockId;

      (block as HTMLElement).addEventListener('mouseenter', () => {
        if (isEditable) {
          setHoveredBlock(blockId);
          (block as HTMLElement).classList.add('modern-block-hover');
        }
      });

      (block as HTMLElement).addEventListener('mouseleave', () => {
        setHoveredBlock(null);
        (block as HTMLElement).classList.remove('modern-block-hover');
      });
    });

    return () => {
      blocks.forEach((block: Element) => {
        (block as HTMLElement).classList.remove('modern-block-hover');
      });
    };
  }, [isEditable]);

  return (
    <>
      {/* Modern UI Enhancement Styles */}
      <style>{`
        .modern-block-hover {
          background: rgba(59, 130, 246, 0.05) !important;
          border-radius: 6px !important;
        }

        .dark .modern-block-hover {
          background: rgba(96, 165, 250, 0.08) !important;
        }

        /* Enhanced block visual hierarchy */
        .ce-block {
          transition: all 0.15s cubic-bezier(0.4, 0, 0.2, 1) !important;
        }

        /* Smooth toolbar appearance */
        .ce-toolbar__plus {
          animation: slideIn 0.2s ease-out;
        }

        @keyframes slideIn {
          from {
            opacity: 0;
            transform: translateX(-8px);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }

        /* Modern plus button styling */
        .ce-toolbar__plus::before {
          content: '+';
          font-size: 20px;
          font-weight: 600;
          line-height: 1;
        }

        /* Block selection indicator */
        .ce-block.ce-block--selected {
          padding-left: 12px !important;
          border-left: 3px solid #3b82f6;
          border-radius: 0 6px 6px 0;
        }

        .dark .ce-block.ce-block--selected {
          border-left-color: #60a5fa;
        }

        /* Smooth content transitions */
        .ce-paragraph,
        .ce-header,
        .ce-code {
          transition: color 0.15s ease;
        }

        /* Improved list styling */
        .ce-list__item {
          transition: opacity 0.15s ease;
        }

        .ce-list__item:hover {
          opacity: 0.85;
        }

        /* Visual feedback for inline toolbar */
        .ce-inline-toolbar {
          animation: fadeIn 0.15s ease-out;
        }

        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(-4px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        /* Enhanced menu button appearance */
        .ce-toolbar__menu-button {
          position: relative;
        }

        .ce-toolbar__menu-button::after {
          content: '';
          position: absolute;
          width: 100%;
          height: 100%;
          border-radius: 6px;
          background: transparent;
          transition: background 0.15s ease;
          pointer-events: none;
        }

        .ce-toolbar__menu-button:hover::after {
          background: rgba(59, 130, 246, 0.1);
        }

        /* Block typing experience */
        .ce-paragraph:focus,
        .ce-header:focus,
        .ce-code:focus {
          transition: all 0.2s ease;
        }

        /* Paste area styling */
        .ce-paste-target {
          outline: 2px dashed rgba(59, 130, 246, 0.3);
          border-radius: 6px;
          padding: 8px;
          transition: all 0.15s ease;
        }

        /* Modern drag-over effect */
        .ce-block--drop-target {
          position: relative;
        }

        .ce-block--drop-target::before {
          content: '';
          position: absolute;
          top: -2px;
          left: 0;
          right: 0;
          height: 2px;
          background: linear-gradient(to right, #3b82f6, transparent);
          border-radius: 1px;
        }

        /* Improved code block appearance */
        .ce-code {
          position: relative;
          background: linear-gradient(135deg, #1e1e1e 0%, #262626 100%);
        }

        .dark .ce-code {
          background: linear-gradient(135deg, #0d0d0d 0%, #1a1a1a 100%);
        }

        .ce-code::before {
          content: 'CODE';
          position: absolute;
          top: 8px;
          right: 12px;
          font-size: 10px;
          font-weight: 600;
          color: #666;
          letter-spacing: 1px;
          opacity: 0;
          transition: opacity 0.15s ease;
          pointer-events: none;
        }

        .ce-code:hover::before {
          opacity: 1;
        }

        /* Improved image display */
        .ce-image {
          position: relative;
        }

        .ce-image__image-picture {
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        }

        .ce-image:hover .ce-image__image-picture {
          filter: brightness(0.95);
        }

        /* Modern quote styling */
        .ce-quote {
          position: relative;
          padding-left: 20px;
          border-left: 4px solid #3b82f6;
          transition: all 0.15s ease;
        }

        .dark .ce-quote {
          border-left-color: #60a5fa;
        }

        .ce-quote:hover {
          padding-left: 24px;
          border-left-color: #2563eb;
        }

        .dark .ce-quote:hover {
          border-left-color: #3b82f6;
        }

        /* Empty state enhancement */
        .codex-editor__empty-notice {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          min-height: 200px;
          color: #9ca3af;
          font-size: 15px;
        }

        .codex-editor__empty-notice::before {
          content: '📝';
          font-size: 48px;
          margin-bottom: 16px;
          opacity: 0.5;
        }
      `}</style>

      {/* Block action indicators - visible on hover */}
      <style>{`
        .ce-block:hover .ce-toolbar,
        .ce-block:hover .ce-settings {
          animation: slideIn 0.2s ease-out;
        }

        /* Visual polish */
        .codex-editor__redactor {
          position: relative;
        }

        /* Better focus management */
        .ce-block:has(> :focus) {
          background: rgba(59, 130, 246, 0.03) !important;
          border-radius: 6px;
        }

        .dark .ce-block:has(> :focus) {
          background: rgba(96, 165, 250, 0.05) !important;
        }
      `}</style>
    </>
  );
}
