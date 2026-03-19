const allowedTags = new Set([
  'A',
  'B',
  'BLOCKQUOTE',
  'BR',
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
  'STRONG',
  'U',
  'UL',
]);

const hasHtmlTag = (value: string) => /<\/?[a-z][\s\S]*>/i.test(value);

const escapeHtml = (value: string) => value
  .replace(/&/g, '&amp;')
  .replace(/</g, '&lt;')
  .replace(/>/g, '&gt;')
  .replace(/"/g, '&quot;')
  .replace(/'/g, '&#39;');

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

        if (name.startsWith('on') || name === 'style' || name === 'srcset') {
          element.removeAttribute(attr.name);
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

  if (typeof window === 'undefined' || !hasHtmlTag(value)) {
    return value.replace(/<br\s*\/?>/gi, '\n');
  }

  const parser = new DOMParser();
  const doc = parser.parseFromString(value, 'text/html');
  return doc.body.textContent?.trim() ?? '';
};
