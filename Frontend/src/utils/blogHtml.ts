const allowedTags = new Set([
  'A',
  'B',
  'BLOCKQUOTE',
  'BR',
  'COL',
  'COLGROUP',
  'DIV',
  'EM',
  'H1',
  'H2',
  'H3',
  'H4',
  'HR',
  'I',
  'IMG',
  'LI',
  'OL',
  'P',
  'S',
  'SPAN',
  'STRONG',
  'SUB',
  'SUP',
  'TABLE',
  'TBODY',
  'TD',
  'TFOOT',
  'TH',
  'THEAD',
  'TR',
  'U',
  'UL',
]);

const allowedInlineStyleNames = new Set([
  'background-color',
  'border',
  'border-collapse',
  'border-color',
  'border-style',
  'border-width',
  'color',
  'font-family',
  'font-size',
  'font-weight',
  'height',
  'line-height',
  'margin-left',
  'padding-left',
  'text-align',
  'text-decoration',
  'vertical-align',
  'width',
]);

const tableCellTags = new Set(['TD', 'TH']);
const tableSpanAttributeNames = new Set(['colspan', 'rowspan']);

const hasHtmlTag = (value: string) => /<\/?[a-z][\s\S]*>/i.test(value);

const escapeHtml = (value: string) => value
  .replace(/&/g, '&amp;')
  .replace(/</g, '&lt;')
  .replace(/>/g, '&gt;')
  .replace(/\"/g, '&quot;')
  .replace(/'/g, '&#39;');

const stripHtml = (value: string) => value
  .replace(/<br\s*\/?>/gi, '\n')
  .replace(/<[^>]+>/g, ' ')
  .replace(/\s+\n/g, '\n')
  .replace(/\n\s+/g, '\n')
  .replace(/[ \t]{2,}/g, ' ')
  .trim();

const sanitizeStyleValue = (name: string, value: string): string | null => {
  const trimmed = value.trim();
  if (!trimmed) return null;

  if (/[<>]/.test(trimmed) || /url\s*\(/i.test(trimmed) || /expression\s*\(/i.test(trimmed)) {
    return null;
  }

  if (name === 'color' || name === 'background-color' || name === 'border-color') {
    return /^(#[0-9a-f]{3,8}|rgb(a)?\([\d\s,.%]+\)|hsl(a)?\([\d\s,.%]+\)|[a-zA-Z]{3,20})$/i.test(trimmed)
      ? trimmed
      : null;
  }

  if (name === 'font-family') {
    return /^[a-zA-Z0-9\s,'\"_-]{1,120}$/.test(trimmed) ? trimmed : null;
  }

  if (name === 'font-size') {
    return /^(\d{1,3}(\.\d{1,2})?(px|pt|em|rem|%)|small|medium|large|x-large|xx-large)$/i.test(trimmed)
      ? trimmed
      : null;
  }

  if (name === 'font-weight') {
    return /^(normal|bold|bolder|lighter|[1-9]00)$/i.test(trimmed) ? trimmed : null;
  }

  if (name === 'line-height') {
    return /^(\d{1,2}(\.\d{1,2})?|\d{1,3}(\.\d{1,2})?(px|pt|em|rem|%))$/i.test(trimmed)
      ? trimmed
      : null;
  }

  if (name === 'width') {
    return /^(\d{1,3}(\.\d{1,2})?%|\d{1,4}px|auto)$/i.test(trimmed) ? trimmed : null;
  }

  if (name === 'height') {
    return /^(\d{1,4}px|auto)$/i.test(trimmed) ? trimmed : null;
  }

  if (name === 'margin-left' || name === 'padding-left' || name === 'border-width') {
    return /^(\d{1,4}(\.\d{1,2})?(px|pt|em|rem|%)|0)$/i.test(trimmed) ? trimmed : null;
  }

  if (name === 'text-align') {
    return /^(left|right|center|justify|start|end)$/i.test(trimmed) ? trimmed : null;
  }

  if (name === 'vertical-align') {
    return /^(baseline|sub|super|top|text-top|middle|bottom|text-bottom)$/i.test(trimmed) ? trimmed : null;
  }

  if (name === 'text-decoration') {
    return /^(none|underline|line-through|overline)(\s+(solid|double|dotted|dashed|wavy))?$/i.test(trimmed)
      ? trimmed
      : null;
  }

  if (name === 'border-style') {
    return /^(none|solid|dashed|dotted|double)$/i.test(trimmed) ? trimmed : null;
  }

  if (name === 'border-collapse') {
    return /^(collapse|separate)$/i.test(trimmed) ? trimmed : null;
  }

  if (name === 'border') {
    return /^[\d.\s#a-zA-Z(),%]+$/.test(trimmed) ? trimmed : null;
  }

  return null;
};

const sanitizeInlineStyle = (value: string): string => value
  .split(';')
  .map((item) => item.trim())
  .filter(Boolean)
  .map((item) => {
    const [rawName, ...rawValueParts] = item.split(':');
    const name = rawName?.trim().toLowerCase();
    const rawValue = rawValueParts.join(':');
    if (!name || !allowedInlineStyleNames.has(name)) {
      return null;
    }

    const safeValue = sanitizeStyleValue(name, rawValue);
    return safeValue ? `${name}: ${safeValue}` : null;
  })
  .filter((item): item is string => Boolean(item))
  .join('; ');

export const sanitizeBlogHtml = (value: string | null | undefined): string => {
  if (!value?.trim()) return '';

  if (typeof window === 'undefined') {
    return value;
  }

  if (!hasHtmlTag(value)) {
    return escapeHtml(value).replace(/\r?\n/g, '<br />');
  }

  const parser = new DOMParser();
  const doc = parser.parseFromString(value, 'text/html');

  const walk = (node: Node) => {
    if (node.nodeType === Node.ELEMENT_NODE) {
      const element = node as HTMLElement;

      if (!allowedTags.has(element.tagName)) {
        const parent = element.parentNode;
        while (element.firstChild) {
          parent?.insertBefore(element.firstChild, element);
        }
        parent?.removeChild(element);
        return;
      }

      Array.from(element.attributes).forEach((attr) => {
        const name = attr.name.toLowerCase();
        const attrValue = attr.value.trim();

        if (name.startsWith('on') || name === 'srcset') {
          element.removeAttribute(attr.name);
          return;
        }

        if (name === 'style') {
          const safeStyle = sanitizeInlineStyle(attrValue);
          if (safeStyle) {
            element.setAttribute('style', safeStyle);
          } else {
            element.removeAttribute(attr.name);
          }
          return;
        }

        if (element.tagName === 'A') {
          if (name !== 'href' && name !== 'target' && name !== 'rel') {
            element.removeAttribute(attr.name);
            return;
          }

          if (name === 'href' && !/^(https?:|mailto:|tel:|\/)/i.test(attrValue)) {
            element.removeAttribute(attr.name);
          }
        } else if (element.tagName === 'IMG') {
          if (!['src', 'alt', 'title'].includes(name)) {
            element.removeAttribute(attr.name);
            return;
          }

          if (name === 'src' && !/^(https?:|\/)/i.test(attrValue)) {
            element.removeAttribute(attr.name);
          }
        } else if (tableCellTags.has(element.tagName) && tableSpanAttributeNames.has(name)) {
          if (!/^[1-9]\d?$/.test(attrValue)) {
            element.removeAttribute(attr.name);
          }
        } else if (name !== 'class') {
          element.removeAttribute(attr.name);
        }
      });

      if (element.tagName === 'A') {
        element.setAttribute('target', '_blank');
        element.setAttribute('rel', 'noreferrer');
      }
    }

    Array.from(node.childNodes).forEach(walk);
  };

  Array.from(doc.body.childNodes).forEach(walk);
  return doc.body.innerHTML;
};

export const extractPlainTextFromBlogHtml = (value: string | null | undefined): string => {
  if (!value?.trim()) return '';

  if (typeof window === 'undefined') {
    return stripHtml(value);
  }

  if (!hasHtmlTag(value)) {
    return value.replace(/<br\s*\/?>/gi, '\n');
  }

  const parser = new DOMParser();
  const doc = parser.parseFromString(value, 'text/html');
  return doc.body.textContent?.trim() ?? '';
};



