import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  AlignCenter,
  AlignLeft,
  AlignRight,
  Bold,
  ImagePlus,
  Italic,
  Link as LinkIcon,
  List,
  ListOrdered,
  Palette,
  Quote,
  Redo2,
  RemoveFormatting,
  Underline,
  Undo2,
} from 'lucide-react';
import { sanitizeBlogHtml } from '../utils/blogHtml';

interface RichTextEditorProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  onUploadImage: (file: File) => Promise<string>;
  placeholder?: string;
}

type BlockStyle = 'P' | 'H2' | 'H3' | 'BLOCKQUOTE';
type ResizeCorner = 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right';

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
  const selectionRef = useRef<Range | null>(null);
  const selectedImageRef = useRef<HTMLImageElement | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [fontFamily, setFontFamily] = useState('Be Vietnam Pro');
  const [textColor, setTextColor] = useState('#1f2937');
  const [blockStyle, setBlockStyle] = useState<BlockStyle>('P');
  const [hasSelectedImage, setHasSelectedImage] = useState(false);
  const [selectedImageWidth, setSelectedImageWidth] = useState(100);
  const [selectedImageWidthInput, setSelectedImageWidthInput] = useState('100');
  const [resizeOverlay, setResizeOverlay] = useState({ top: 0, left: 0, width: 0, height: 0 });

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

  const saveSelection = () => {
    const editor = editorRef.current;
    const selection = window.getSelection();
    if (!editor || !selection || selection.rangeCount === 0) return;

    const range = selection.getRangeAt(0);
    if (editor.contains(range.commonAncestorContainer)) {
      selectionRef.current = range.cloneRange();
    }
  };

  const clearSelectedImage = () => {
    selectedImageRef.current = null;
    setHasSelectedImage(false);
  };

  const updateResizeOverlay = () => {
    const image = selectedImageRef.current;
    const canvas = image?.closest('.rich-editor-canvas');
    if (!image || !(canvas instanceof HTMLElement)) return;

    const imageRect = image.getBoundingClientRect();
    const canvasRect = canvas.getBoundingClientRect();
    setResizeOverlay({
      top: imageRect.top - canvasRect.top + canvas.scrollTop,
      left: imageRect.left - canvasRect.left + canvas.scrollLeft,
      width: imageRect.width,
      height: imageRect.height,
    });
  };

  const selectImage = (image: HTMLImageElement) => {
    clearSelectedImage();
    selectedImageRef.current = image;
    setHasSelectedImage(true);

    const currentWidth = image.style.width;
    const percentWidth = currentWidth.endsWith('%')
      ? Number.parseFloat(currentWidth)
      : Math.round((image.getBoundingClientRect().width / (editorRef.current?.clientWidth || image.getBoundingClientRect().width)) * 100);

    const roundedWidth = Number.isFinite(percentWidth) ? Math.round(Math.min(100, Math.max(1, percentWidth))) : 100;
    setSelectedImageWidth(roundedWidth);
    setSelectedImageWidthInput(String(roundedWidth));
    window.setTimeout(updateResizeOverlay, 0);
  };

  const reselectImageBySource = (imageSrc: string) => {
    window.setTimeout(() => {
      const editor = editorRef.current;
      if (!editor) return;

      const image = Array.from(editor.querySelectorAll('img')).find((item) => item.getAttribute('src') === imageSrc);
      if (image instanceof HTMLImageElement) {
        selectImage(image);
      }
    }, 0);
  };

  const restoreSelection = () => {
    const editor = editorRef.current;
    const selection = window.getSelection();
    if (!editor || !selection || !selectionRef.current) return;

    editor.focus();
    selection.removeAllRanges();
    selection.addRange(selectionRef.current);
  };

  const runCommand = (command: string, commandValue?: string) => {
    restoreSelection();
    editorRef.current?.focus();
    document.execCommand(command, false, commandValue);
    saveSelection();
    emitChange();
  };

  const applyBlock = (tag: BlockStyle) => {
    setBlockStyle(tag);
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

  const uploadAndInsertImages = async (files: File[]) => {
    if (files.length === 0) return;

    saveSelection();
    setIsUploading(true);
    try {
      for (const file of files) {
        const imageUrl = await onUploadImage(file);
        runCommand('insertImage', imageUrl);
        const insertedImage = editorRef.current?.querySelector(`img[src="${CSS.escape(imageUrl)}"]`);
        if (insertedImage instanceof HTMLImageElement) {
          insertedImage.style.width = '100%';
          insertedImage.style.height = 'auto';
          emitChange();
        }
      }
    } catch (error: any) {
      window.alert(error?.message || 'Khong the chen anh vao noi dung.');
    } finally {
      setIsUploading(false);
      if (imageInputRef.current) {
        imageInputRef.current.value = '';
      }
    }
  };

  const handleImagePickMany = async (files: FileList | null) => {
    if (!files || files.length === 0) return;
    await uploadAndInsertImages(Array.from(files));
  };

  const handlePaste = (event: React.ClipboardEvent<HTMLDivElement>) => {
    const hasRichHtml = Boolean(event.clipboardData.getData('text/html'));
    const imageFiles = Array.from(event.clipboardData.items)
      .filter((item) => item.type.startsWith('image/'))
      .map((item, index) => {
        const file = item.getAsFile();
        if (!file) return null;
        const extension = file.type.split('/')[1] || 'png';
        return new File([file], file.name || `pasted-image-${Date.now()}-${index}.${extension}`, { type: file.type });
      })
      .filter((file): file is File => Boolean(file));

    if (imageFiles.length === 0) return;
    if (hasRichHtml) return;

    event.preventDefault();
    void uploadAndInsertImages(imageFiles);
  };

  const handleDrop = (event: React.DragEvent<HTMLDivElement>) => {
    const imageFiles = Array.from(event.dataTransfer.files).filter((file) => file.type.startsWith('image/'));
    if (imageFiles.length === 0) return;

    event.preventDefault();
    void uploadAndInsertImages(imageFiles);
  };

  const resizeSelectedImage = (nextWidth: number, shouldEmitChange = true) => {
    const image = selectedImageRef.current;
    if (!image) return;

    const imageSrc = image.getAttribute('src') ?? '';
    const clampedWidth = Math.round(Math.min(100, Math.max(1, nextWidth)));
    setSelectedImageWidth(clampedWidth);
    setSelectedImageWidthInput(String(clampedWidth));
    image.style.width = `${clampedWidth}%`;
    image.style.height = 'auto';
    if (shouldEmitChange) {
      emitChange();
      if (imageSrc) {
        reselectImageBySource(imageSrc);
      }
    }
    window.setTimeout(updateResizeOverlay, 0);
  };

  const startImageResize = (event: React.PointerEvent<HTMLButtonElement>, corner: ResizeCorner) => {
    const image = selectedImageRef.current;
    const editor = editorRef.current;
    if (!image || !editor) return;

    event.preventDefault();
    event.stopPropagation();
    event.currentTarget.setPointerCapture(event.pointerId);

    const startX = event.clientX;
    const startWidth = image.getBoundingClientRect().width;
    const editorWidth = editor.clientWidth || startWidth;
    const direction = corner.endsWith('left') ? -1 : 1;

    const handlePointerMove = (moveEvent: PointerEvent) => {
      const delta = (moveEvent.clientX - startX) * direction;
      const nextPixelWidth = startWidth + delta;
      const nextPercentWidth = (nextPixelWidth / editorWidth) * 100;
      resizeSelectedImage(nextPercentWidth, false);
    };

    const handlePointerUp = () => {
      const imageSrc = selectedImageRef.current?.getAttribute('src') ?? '';
      window.removeEventListener('pointermove', handlePointerMove);
      window.removeEventListener('pointerup', handlePointerUp);
      emitChange();
      if (imageSrc) {
        reselectImageBySource(imageSrc);
      }
      updateResizeOverlay();
    };

    window.addEventListener('pointermove', handlePointerMove);
    window.addEventListener('pointerup', handlePointerUp);
  };

  const commitImageWidthInput = () => {
    const parsedWidth = Number.parseInt(selectedImageWidthInput, 10);
    const nextWidth = Number.isFinite(parsedWidth) ? parsedWidth : selectedImageWidth;
    resizeSelectedImage(nextWidth);
  };

  return (
    <div className="field rich-editor-field">
      <label>{label}</label>
      <div className="rich-editor-shell">
        <div className="rich-editor-toolbar" aria-label={`${label} toolbar`}>
          <select
            className="rich-editor-select rich-editor-block-select"
            value={blockStyle}
            onChange={(e) => applyBlock(e.target.value as BlockStyle)}
            title="Kieu doan"
          >
            <option value="P">Van ban thuong</option>
            <option value="H2">Tieu de lon</option>
            <option value="H3">Tieu de phu</option>
            <option value="BLOCKQUOTE">Trich dan</option>
          </select>

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

          <span className="rich-editor-divider" />

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

          <span className="rich-editor-divider" />

          <button type="button" className="btn btn-secondary rich-editor-btn" onClick={() => runCommand('insertUnorderedList')} title="Danh sach cham">
            <List size={16} />
          </button>
          <button type="button" className="btn btn-secondary rich-editor-btn" onClick={() => runCommand('insertOrderedList')} title="Danh sach so">
            <ListOrdered size={16} />
          </button>
          <button type="button" className="btn btn-secondary rich-editor-btn" onClick={() => applyBlock('BLOCKQUOTE')} title="Trich dan">
            <Quote size={16} />
          </button>

          <span className="rich-editor-divider" />

          <button type="button" className="btn btn-secondary rich-editor-btn" onClick={() => runCommand('justifyLeft')} title="Can trai">
            <AlignLeft size={16} />
          </button>
          <button type="button" className="btn btn-secondary rich-editor-btn" onClick={() => runCommand('justifyCenter')} title="Can giua">
            <AlignCenter size={16} />
          </button>
          <button type="button" className="btn btn-secondary rich-editor-btn" onClick={() => runCommand('justifyRight')} title="Can phai">
            <AlignRight size={16} />
          </button>

          <span className="rich-editor-divider" />

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

          {hasSelectedImage ? (
            <div className="rich-editor-image-resizer">
              <span>Co anh</span>
              <input
                type="number"
                min="1"
                max="100"
                step="1"
                value={selectedImageWidthInput}
                onChange={(e) => {
                  const nextValue = e.target.value.replace(/[^\d]/g, '').slice(0, 3);
                  setSelectedImageWidthInput(nextValue);
                }}
                onBlur={commitImageWidthInput}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    commitImageWidthInput();
                  }
                }}
              />
              <strong>%</strong>
            </div>
          ) : null}

          {isUploading ? <span className="rich-editor-status">Dang tai anh...</span> : null}
        </div>

        <div className="rich-editor-canvas" onScroll={updateResizeOverlay}>
          <div
            ref={editorRef}
            className="rich-editor-input"
            contentEditable
            suppressContentEditableWarning
            data-placeholder={isUploading ? 'Dang tai anh...' : placeholder}
            onInput={() => {
              saveSelection();
              emitChange();
            }}
            onBlur={() => {
              const imageSrc = selectedImageRef.current?.getAttribute('src') ?? '';
              saveSelection();
              emitChange();
              if (imageSrc) {
                reselectImageBySource(imageSrc);
              }
            }}
            onFocus={saveSelection}
            onKeyUp={saveSelection}
            onMouseUp={saveSelection}
            onClick={(event) => {
              const target = event.target;
              if (target instanceof HTMLImageElement) {
                selectImage(target);
              } else {
                clearSelectedImage();
              }
            }}
            onPaste={handlePaste}
            onDragOver={(event) => event.preventDefault()}
            onDrop={handleDrop}
          />
          {hasSelectedImage ? (
            <div
              className="rich-editor-image-overlay"
              style={{
                top: `${resizeOverlay.top}px`,
                left: `${resizeOverlay.left}px`,
                width: `${resizeOverlay.width}px`,
                height: `${resizeOverlay.height}px`,
              }}
              aria-hidden
            >
              {(['top-left', 'top-right', 'bottom-left', 'bottom-right'] as ResizeCorner[]).map((corner) => (
                <button
                  key={corner}
                  type="button"
                  className={`rich-editor-image-handle rich-editor-image-handle-${corner}`}
                  onPointerDown={(event) => startImageResize(event, corner)}
                  tabIndex={-1}
                />
              ))}
            </div>
          ) : null}
        </div>
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
        multiple
        style={{ display: 'none' }}
        onChange={(e) => {
          void handleImagePickMany(e.target.files);
        }}
      />
    </div>
  );
};
