// This component is deprecated - use EditorJSWrapper instead
import { EditorJSWrapper } from '../EditorJSWrapper';

interface LifeflowEditorProps {
  content: any;
  onUpdate: (content: any) => void;
  editable?: boolean;
}

// Deprecated: Use EditorJSWrapper instead
export function LifeflowEditor(props: LifeflowEditorProps) {
  return <EditorJSWrapper {...props} />;
}

export default LifeflowEditor;
