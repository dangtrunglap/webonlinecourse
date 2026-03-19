import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Bold, ImagePlus, Italic, Link as LinkIcon, List, ListOrdered, Quote, Redo2, RemoveFormatting, Underline, Undo2 } from 'lucide-react';
import { sanitizeBlogHtml } from '../utils/blogHtml';

interface RichTextEditorProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  onUploadImage: (file: File) => Promise<string>;
  placeholder?: string;
}

export const RichTextEditor: React.FC<RichTextEditorProps> = ({
  label,
  value,
  onChange,
  onUploadImage,
  placeholder = 'Nhập nội dung...',
}) => {
  const editorRef = useRef<HTMLDivElement | null>(null);
  const imageInputRef = useRef<HTMLInputElement | null>(null);
  const [isUploading, setIsUploading] = useState(false);

  const normalizedValue = useMemo(() => sanitizeBlogHtml(value), [value]);

  useEffect(() => {
    const editor = editorRef.current;
    if (!editor) return;
    if (editor.innerHTML !== normalizedValue) {
      editor.innerHTML = normalizedValue;
    }
  }, [normalizedValue]);

  const emitChange = () => {
    const html = editorRef.current?.innerHTML ?? '';
    onChange(sanitizeBlogHtml(html));
  };

  const runCommand = (command: string, commandValue?: string) => {
    editorRef.current?.focus();
    document.execCommand(command, false, commandValue);
    emitChange();
  };

  const applyBlock = (tag: 'P' | 'H2' | 'H3' | 'BLOCKQUOTE') => {
    runCommand('formatBlock', tag);
  };

  const insertLink = () => {
    const url = window.prompt('Nhập đường dẫn muốn chèn');
    if (!url) return;
    runCommand('createLink', url);
  };

  const handleImagePick = async (file: File | null) => {
    if (!file) return;

    setIsUploading(true);
    try {
      const imageUrl = await onUploadImage(file);
      runCommand('insertImage', imageUrl);
    } finally {
      setIsUploading(false);
      if (imageInputRef.current) {
        imageInputRef.current.value = '';
      }
    }
  };

  return (
    <div className="field rich-editor-field">
      <label>{label}</label>
      <div className="rich-editor-shell">
        <div className="rich-editor-toolbar">
          <button type="button" className="btn btn-secondary rich-editor-btn" onClick={() => runCommand('bold')} title="In đậm">
            <Bold size={16} />
          </button>
          <button type="button" className="btn btn-secondary rich-editor-btn" onClick={() => runCommand('italic')} title="In nghiêng">
            <Italic size={16} />
          </button>
          <button type="button" className="btn btn-secondary rich-editor-btn" onClick={() => runCommand('underline')} title="Gạch chân">
            <Underline size={16} />
          </button>
          <button type="button" className="btn btn-secondary rich-editor-btn" onClick={() => applyBlock('H2')} title="Tiêu đề lớn">
            H2
          </button>
          <button type="button" className="btn btn-secondary rich-editor-btn" onClick={() => applyBlock('H3')} title="Tiêu đề vừa">
            H3
          </button>
          <button type="button" className="btn btn-secondary rich-editor-btn" onClick={() => applyBlock('P')} title="Đoạn văn">
            P
          </button>
          <button type="button" className="btn btn-secondary rich-editor-btn" onClick={() => runCommand('insertUnorderedList')} title="Danh sách chấm">
            <List size={16} />
          </button>
          <button type="button" className="btn btn-secondary rich-editor-btn" onClick={() => runCommand('insertOrderedList')} title="Danh sách số">
            <ListOrdered size={16} />
          </button>
          <button type="button" className="btn btn-secondary rich-editor-btn" onClick={() => applyBlock('BLOCKQUOTE')} title="Trích dẫn">
            <Quote size={16} />
          </button>
          <button type="button" className="btn btn-secondary rich-editor-btn" onClick={insertLink} title="Chèn liên kết">
            <LinkIcon size={16} />
          </button>
          <button type="button" className="btn btn-secondary rich-editor-btn" onClick={() => imageInputRef.current?.click()} title="Chèn ảnh" disabled={isUploading}>
            <ImagePlus size={16} />
          </button>
          <button type="button" className="btn btn-secondary rich-editor-btn" onClick={() => runCommand('removeFormat')} title="Xóa định dạng">
            <RemoveFormatting size={16} />
          </button>
          <button type="button" className="btn btn-secondary rich-editor-btn" onClick={() => runCommand('undo')} title="Hoàn tác">
            <Undo2 size={16} />
          </button>
          <button type="button" className="btn btn-secondary rich-editor-btn" onClick={() => runCommand('redo')} title="Làm lại">
            <Redo2 size={16} />
          </button>
        </div>

        <div
          ref={editorRef}
          className="rich-editor-input"
          contentEditable
          suppressContentEditableWarning
          data-placeholder={isUploading ? 'Đang tải ảnh...' : placeholder}
          onInput={emitChange}
          onBlur={emitChange}
        />
      </div>

      <input
        ref={imageInputRef}
        type="file"
        accept=".jpg,.jpeg,.png,.webp"
        style={{ display: 'none' }}
        onChange={(e) => {
          void handleImagePick(e.target.files?.[0] ?? null);
        }}
      />
    </div>
  );
};
