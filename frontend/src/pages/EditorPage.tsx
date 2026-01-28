import { useOutletContext } from 'react-router';
import { BlockNoteEditorWrapper } from '../components/BlockNoteEditorWrapper';
import { HomePage } from './HomePage';
import { Page } from '../types';

interface OutletContext {
  pages: Page[];
  currentPageId: string | null;
  handleUpdatePage: (updatedPage: Page) => void;
}

export function EditorPage() {
  const { pages, currentPageId, handleUpdatePage } = useOutletContext<OutletContext>();
  
  const currentPage = pages.find((p) => p.id === currentPageId);

  if (!currentPage) {
    return (
      <HomePage pages={pages} />
    );
  }

  return (
    <div className="flex-1 overflow-hidden bg-white dark:bg-[#191919]">
      <BlockNoteEditorWrapper page={currentPage} onUpdatePage={handleUpdatePage} />
    </div>
  );
}