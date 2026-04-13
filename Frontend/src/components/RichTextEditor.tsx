import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Bold, ImagePlus, Italic, Link as LinkIcon, List, ListOrdered, Palette, Quote, Redo2, RemoveFormatting, Underline, Undo2 } from 'lucide-react';
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
  placeholder = 'Nhap noi dung...',
}) => {
  const editorRef = useRef<HTMLDivElement | null>(null);
  const imageInputRef = useRef<HTMLInputElement | null>(null);
  const colorInputRef = useRef<HTMLInputElement | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [fontFamily, setFontFamily] = useState('Be Vietnam Pro');
  const [textColor, setTextColor] = useState('#1f2937');

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
    const url = window.prompt('Nhap duong dan muon chen');
    if (!url) return;
    runCommand('createLink', url);
  };

  const applyFontFamily = (nextFontFamily: string) => {
    setFontFamily(nextFontFamily);
    runCommand('styleWithCSS', 'true');
    runCommand('fontName', nextFontFamily);
  };

  const applyTextColor = (nextColor: string) => {
    setTextColor(nextColor);
    runCommand('styleWithCSS', 'true');
    runCommand('foreColor', nextColor);
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
          <select
            className="rich-editor-select"
            value={fontFamily}
            onChange={(e) => applyFontFamily(e.target.value)}
            title="Kieu chu"
          >
            <option value="Be Vietnam Pro">Be Vietnam Pro</option>
            <option value="Montserrat">Montserrat</option>
            <option value="Georgia">Georgia</option>
            <option value="Times New Roman">Times New Roman</option>
            <option value="Courier New">Courier New</option>
          </select>
          <button
            type="button"
            className="btn btn-secondary rich-editor-btn rich-editor-color-btn"
            onClick={() => colorInputRef.current?.click()}
            title="Mau chu"
          >
            <Palette size={16} />
            <span className="rich-editor-color-swatch" style={{ backgroundColor: textColor }} />
          </button>
          <button type="button" className="btn btn-secondary rich-editor-btn" onClick={() => runCommand('bold')} title="In dam">
            <Bold size={16} />
          </button>
          <button type="button" className="btn btn-secondary rich-editor-btn" onClick={() => runCommand('italic')} title="In nghieng">
            <Italic size={16} />
          </button>
          <button type="button" className="btn btn-secondary rich-editor-btn" onClick={() => runCommand('underline')} title="Gach chan">
            <Underline size={16} />
          </button>
          <button type="button" className="btn btn-secondary rich-editor-btn" onClick={() => applyBlock('H2')} title="Tieu de lon">
            H2
          </button>
          <button type="button" className="btn btn-secondary rich-editor-btn" onClick={() => applyBlock('H3')} title="Tieu de vua">
            H3
          </button>
          <button type="button" className="btn btn-secondary rich-editor-btn" onClick={() => applyBlock('P')} title="Doan van">
            P
          </button>
          <button type="button" className="btn btn-secondary rich-editor-btn" onClick={() => runCommand('insertUnorderedList')} title="Danh sach cham">
            <List size={16} />
          </button>
          <button type="button" className="btn btn-secondary rich-editor-btn" onClick={() => runCommand('insertOrderedList')} title="Danh sach so">
            <ListOrdered size={16} />
          </button>
          <button type="button" className="btn btn-secondary rich-editor-btn" onClick={() => applyBlock('BLOCKQUOTE')} title="Trich dan">
            <Quote size={16} />
          </button>
          <button type="button" className="btn btn-secondary rich-editor-btn" onClick={insertLink} title="Chen lien ket">
            <LinkIcon size={16} />
          </button>
          <button type="button" className="btn btn-secondary rich-editor-btn" onClick={() => imageInputRef.current?.click()} title="Chen anh" disabled={isUploading}>
            <ImagePlus size={16} />
          </button>
          <button type="button" className="btn btn-secondary rich-editor-btn" onClick={() => runCommand('removeFormat')} title="Xoa dinh dang">
            <RemoveFormatting size={16} />
          </button>
          <button type="button" className="btn btn-secondary rich-editor-btn" onClick={() => runCommand('undo')} title="Hoan tac">
            <Undo2 size={16} />
          </button>
          <button type="button" className="btn btn-secondary rich-editor-btn" onClick={() => runCommand('redo')} title="Lam lai">
            <Redo2 size={16} />
          </button>
        </div>

        <div
          ref={editorRef}
          className="rich-editor-input"
          contentEditable
          suppressContentEditableWarning
          data-placeholder={isUploading ? 'Dang tai anh...' : placeholder}
          onInput={emitChange}
          onBlur={emitChange}
        />
      </div>

      <input
        ref={colorInputRef}
        type="color"
        value={textColor}
        className="rich-editor-color-input"
        onChange={(e) => applyTextColor(e.target.value)}
        aria-label="Chon mau chu"
      />

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



