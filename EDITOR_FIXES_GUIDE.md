# Editor Implementation - Quick Fix Guide

## 🔧 Code Fixes & Improvements

### Fix 1: LinkTool Endpoint Configuration
**File:** `frontend/src/components/EditorJSWrapper.tsx`

**Current (Wrong):**
```typescript
linkTool: {
  class: LinkTool as any,
  config: {
    endpoint: '/api/link',  // ❌ WRONG
  },
},
```

**Fixed:**
```typescript
linkTool: {
  class: LinkTool,
  config: {
    endpoint: '/api/linkmetadata',  // Your actual endpoint
  },
},
```

**Backend Expected Response Format:**
```json
{
  "success": 1,
  "meta": {
    "title": "Page Title",
    "description": "Page description",
    "image": {
      "url": "https://example.com/image.jpg"
    }
  }
}
```

---

### Fix 2: List Block Conversion
**File:** `frontend/src/components/TipTapEditor.tsx`

**Current (Wrong):**
```typescript
case 'bullet':
  return {
    type: 'list',
    data: { 
      style: 'unordered', 
      items: [{ content: block.content || '', items: [] }]  // ❌ Wrong structure
    }
  };

case 'numbered':
  return {
    type: 'list',
    data: { 
      style: 'ordered', 
      items: [{ content: block.content || '', items: [] }]  // ❌ Wrong structure
    }
  };
```

**Fixed:**
```typescript
case 'bullet':
  return {
    type: 'list',
    data: {
      style: 'unordered',
      items: Array.isArray(block.items) 
        ? block.items 
        : [block.content || '']  // ✅ Correct: just string array
    }
  };

case 'numbered':
  return {
    type: 'list',
    data: {
      style: 'ordered',
      items: Array.isArray(block.items)
        ? block.items
        : [block.content || '']  // ✅ Correct: just string array
    }
  };
```

**Editor.js List Format:**
```json
{
  "type": "list",
  "data": {
    "style": "unordered",
    "items": ["Item 1", "Item 2", "Item 3"]
  }
}
```

---

### Fix 3: Add Sanitizer Configuration
**File:** `frontend/src/components/EditorJSWrapper.tsx`

**Add Before:** `inlineToolbar` config

```typescript
const editorInstance = new EditorJS({
  holder: editorRef.current!,
  readOnly: !editable,
  tools: { /* ... */ },
  
  // ✅ ADD THIS:
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
    img: { src: true, alt: true },
    h1: true,
    h2: true,
    h3: true,
    h4: true,
    h5: true,
    h6: true,
  },
  
  inlineToolbar: { /* ... */ },
  // ...
});
```

---

### Fix 4: Add Keyboard Shortcuts
**File:** `frontend/src/components/EditorJSWrapper.tsx`

**Add After:** Individual tool shortcuts

```typescript
const tools = {
  header: {
    class: Header as any,
    shortcut: 'CMD+SHIFT+H',
    // ...
  },
  // ... other tools
};

const editorInstance = new EditorJS({
  holder: editorRef.current!,
  readOnly: !editable,
  tools,
  
  // ✅ ADD KEYBOARD BINDINGS:
  keyBindings: {
    'CMD+S': async () => {
      const data = await editorInstance.current?.save();
      onUpdate?.(data);
    },
    'CMD+Z': () => {
      // Implement undo if available
      console.log('Undo requested');
    },
    'CMD+SHIFT+Z': () => {
      // Implement redo if available
      console.log('Redo requested');
    },
  },
  
  inlineToolbar: { /* ... */ },
  // ...
});
```

---

### Fix 5: Improve Type Safety (Remove 'as any')
**File:** `frontend/src/components/EditorJSWrapper.tsx`

**Current:**
```typescript
import Header from '@editorjs/header';
import Paragraph from '@editorjs/paragraph';

// ... later:
header: {
  class: Header as any,  // ❌ Loses type info
  // ...
}
```

**Fixed:**
```typescript
import Header from '@editorjs/header';
import Paragraph from '@editorjs/paragraph';
import type { EditorConfig, BlockToolConstructable } from '@editorjs/editorjs';

// Define tools with proper types
const tools: EditorConfig['tools'] = {
  header: {
    class: Header,  // ✅ Type-safe
    shortcut: 'CMD+SHIFT+H',
    config: {
      placeholder: 'Heading',
      levels: [1, 2, 3, 4, 5, 6],
      defaultLevel: 2,
    },
  },
  paragraph: {
    class: Paragraph,  // ✅ Type-safe
    inlineToolbar: true,
    shortcut: 'CMD+ALT+P',
  },
  // ... other tools similarly
};

const editorInstance = new EditorJS({
  holder: editorRef.current!,
  readOnly: !editable,
  tools,  // Use the typed tools object
  // ...
});
```

---

### Fix 6: Add Content Validation
**File:** `frontend/src/components/EditorJSWrapper.tsx` or create new utility

**Create:** `frontend/src/utils/editorValidation.ts`

```typescript
/**
 * Validates Editor.js block format
 */
export interface EditorJsBlock {
  type: string;
  data: Record<string, any>;
  tunes?: Record<string, any>;
}

export interface EditorJsContent {
  blocks: EditorJsBlock[];
  version: string;
  time: number;
}

/**
 * Type guard for EditorJsBlock
 */
export function isValidEditorJsBlock(block: any): block is EditorJsBlock {
  if (!block || typeof block !== 'object') {
    return false;
  }
  
  if (typeof block.type !== 'string') {
    console.warn('Block missing type:', block);
    return false;
  }
  
  if (!block.data || typeof block.data !== 'object') {
    console.warn('Block missing data object:', block);
    return false;
  }
  
  return true;
}

/**
 * Validates and cleans Editor.js content
 */
export function validateEditorJsContent(content: any): EditorJsContent {
  const defaultContent: EditorJsContent = {
    blocks: [],
    version: '2.31.1',
    time: Date.now()
  };
  
  if (!content || typeof content !== 'object') {
    console.warn('Invalid content format:', content);
    return defaultContent;
  }
  
  // Handle TipTap format
  if (content.type === 'doc') {
    console.warn('TipTap format detected, converting to Editor.js');
    return defaultContent;
  }
  
  // Validate blocks
  if (!Array.isArray(content.blocks)) {
    console.warn('Content blocks is not an array:', content.blocks);
    return defaultContent;
  }
  
  // Filter valid blocks
  const validBlocks = content.blocks
    .filter((block: any) => {
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

/**
 * Get block type statistics
 */
export function getContentStats(content: EditorJsContent) {
  const stats: Record<string, number> = {};
  
  content.blocks.forEach(block => {
    stats[block.type] = (stats[block.type] || 0) + 1;
  });
  
  return stats;
}
```

**Usage in EditorJSWrapper.tsx:**
```typescript
import { validateEditorJsContent } from '../utils/editorValidation';

// Replace normalizeEditorJsContent
const editorInstance = new EditorJS({
  holder: editorRef.current!,
  readOnly: !editable,
  tools: { /* ... */ },
  data: validateEditorJsContent(contentRef.current),  // ✅ With validation
  // ...
});
```

---

### Fix 7: Add Error Boundary
**File:** Create `frontend/src/components/EditorErrorBoundary.tsx`

```typescript
import React, { ReactNode } from 'react';

interface EditorErrorBoundaryProps {
  children: ReactNode;
  fallback?: ReactNode;
}

interface EditorErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

export class EditorErrorBoundary extends React.Component<
  EditorErrorBoundaryProps,
  EditorErrorBoundaryState
> {
  constructor(props: EditorErrorBoundaryProps) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
    };
  }

  static getDerivedStateFromError(error: Error) {
    return {
      hasError: true,
      error,
    };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('Editor error:', error);
    console.error('Error info:', errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        this.props.fallback || (
          <div className="flex flex-col items-center justify-center h-full bg-red-50 dark:bg-red-900/20 rounded-lg p-4">
            <p className="text-red-600 dark:text-red-400 font-semibold">
              Editor encountered an error
            </p>
            <p className="text-sm text-red-500 dark:text-red-300 mt-2">
              {this.state.error?.message}
            </p>
            <button
              onClick={() => {
                this.setState({ hasError: false, error: null });
                window.location.reload();
              }}
              className="mt-4 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
            >
              Reload Editor
            </button>
          </div>
        )
      );
    }

    return this.props.children;
  }
}
```

**Usage in TipTapEditor.tsx:**
```tsx
import { EditorErrorBoundary } from './EditorErrorBoundary';

export function TipTapEditor({ page, onUpdatePage }: TipTapEditorProps) {
  // ... existing code

  return (
    <div className="h-full flex flex-col">
      {/* ... cover and title sections ... */}
      <div className="flex-1 overflow-hidden">
        <EditorErrorBoundary>
          <EditorJSWrapper
            content={editorContent}
            onUpdate={handleEditorUpdate}
            editable={true}
          />
        </EditorErrorBoundary>
      </div>
    </div>
  );
}
```

---

### Fix 8: Add ReadOnly Validation
**File:** `frontend/src/components/EditorJSWrapper.tsx`

**Current:**
```typescript
export function EditorJSWrapper({ content, onUpdate, editable = true }: EditorJSWrapperProps) {
  const [isReady, setIsReady] = useState(false);
  
  useEffect(() => {
    const initializeEditor = async () => {
      editorInstance.current = new EditorJS({
        readOnly: !editable,  // ⚠️ No validation
        // ...
      });
    };
  }, [editable, onUpdate]);
}
```

**Fixed:**
```typescript
export function EditorJSWrapper({ content, onUpdate, editable = true }: EditorJSWrapperProps) {
  const [isReady, setIsReady] = useState(false);
  const [readOnlyError, setReadOnlyError] = useState<string | null>(null);
  
  useEffect(() => {
    const initializeEditor = async () => {
      try {
        // Validate readOnly state
        const shouldBeReadOnly = !editable;
        
        if (shouldBeReadOnly && editorInstance.current && isReady) {
          console.warn('Switching editor to read-only mode');
        }

        editorInstance.current = new EditorJS({
          readOnly: shouldBeReadOnly,
          onReady: () => {
            setIsReady(true);
            setReadOnlyError(null);
            
            // Set caret position if not read-only
            if (!shouldBeReadOnly && editorInstance.current?.caret) {
              editorInstance.current.caret.setToBlock(0, 0);
            }
          },
          tools: { /* ... */ },
          data: normalizeEditorJsContent(contentRef.current),
          minHeight: 500,
          autofocus: !shouldBeReadOnly,
          placeholder: 'Press "/" to see available blocks...',
          onChange: async () => {
            if (editable) {
              try {
                if (editorInstance.current) {
                  const data = await editorInstance.current.save();
                  onUpdate(data);
                }
              } catch (error) {
                console.error('Editor save error:', error);
                setReadOnlyError('Failed to save changes');
              }
            }
          },
        } as any);
      } catch (error) {
        console.error('Failed to initialize editor:', error);
        setReadOnlyError('Failed to initialize editor');
      }
    };

    initializeEditor().catch(error => {
      console.error('Initialization error:', error);
      setReadOnlyError('Initialization error');
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

  if (readOnlyError) {
    return (
      <div className="flex items-center justify-center h-full bg-yellow-50 dark:bg-yellow-900/20">
        <p className="text-yellow-600 dark:text-yellow-400">{readOnlyError}</p>
      </div>
    );
  }

  return (
    <div className="editorjs-container">
      <div ref={editorRef} className="editor-js-wrapper" />
    </div>
  );
}
```

---

## 🧪 Testing Checklist

```bash
# Test LinkTool
- [ ] Click on link tool
- [ ] Enter a URL
- [ ] Verify metadata is fetched
- [ ] Check response format

# Test List Conversion
- [ ] Create bullet list in old format
- [ ] Convert and save
- [ ] Verify items are arrays, not objects

# Test Read-Only
- [ ] Set editable={false}
- [ ] Verify editor is read-only
- [ ] Set editable={true}
- [ ] Verify editor is editable

# Test Content Validation
- [ ] Load empty content
- [ ] Load malformed content
- [ ] Load TipTap format content
- [ ] Verify no errors occur

# Test Keyboard Shortcuts
- [ ] CMD+SHIFT+H for heading
- [ ] CMD+SHIFT+L for list
- [ ] CMD+S for save (if implemented)

# Test Error Boundary
- [ ] Trigger invalid content
- [ ] Verify error displayed
- [ ] Click reload button
- [ ] Verify recovery
```

---

## 📋 Implementation Priority

**Phase 1 (Critical - Do First):**
1. ✅ Fix LinkTool endpoint
2. ✅ Fix list conversion
3. ✅ Add sanitizer
4. ✅ Add validation

**Phase 2 (Important):**
1. ✅ Remove 'as any' casts
2. ✅ Add error boundary
3. ✅ Add readOnly validation
4. ✅ Add keyboard shortcuts

**Phase 3 (Nice to Have):**
1. ✅ Add i18n support
2. ✅ Add block tunes
3. ✅ Add autosave
4. ✅ Add advanced event handling

