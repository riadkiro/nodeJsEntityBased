---
description: Shared rich text editor rules for notes, task descriptions, and future text editors
---

# Rich Text Editor Rules

Use the shared rich text editor assets before adding a new contenteditable editor:

- Logic: `public/js/rich-text-editor.js`
- Styles: `public/css/app/rich-text-editor.css`
- Global: `window.DexRichTextEditor`

## Do Not Rebuild Editor Logic In A View

Do not duplicate these behaviors in EJS partials or Alpine stores:

- `document.execCommand` wrappers
- HTML sanitizing / plain text to HTML normalization
- paste handling
- checklist insertion
- link insertion
- image insertion
- image resize toolbar
- image size persistence

Create or configure a `DexRichTextEditor` instance instead:

```js
window.DexRichTextEditor.create(root, {
  features: ['heading', 'bold', 'italic', 'underline', 'unorderedList', 'orderedList', 'checklist', 'link', 'image', 'clear'],
  initialHtml: existingHtml,
  placeholder: 'Ajouter une description...',
  onChange: (html) => saveDraft(html),
  onBlur: () => flushSave(),
  onPickImage: (editor) => editor.root.querySelector('[type="file"]')?.click(),
  uploadImages: async (files) => [{ url: '/uploads/image.png', alt: 'image' }]
});
```

## Feature Flags

Enable only the tools needed for the current surface through `features`.

Examples:

- Task description: compact tools, image upload through task attachments.
- Record notes: broader toolbar, note color/protection/autosave stays in the notes module.
- Future editors: reuse the same insertion, paste, checklist, sanitize, and image resize helpers.

## Image Resize

Persist image sizes with shared classes, not inline styles:

- `dx-rte-img-size-25`
- `dx-rte-img-size-50`
- `dx-rte-img-size-75`
- `dx-rte-img-size-100`

Use:

```js
window.DexRichTextEditor.applyImageSize(img, '50%');
window.DexRichTextEditor.getImageSize(img);
window.DexRichTextEditor.imageHtml(url, alt, '100%');
```

## Sanitizing

Client-side rich HTML should pass through:

```js
window.DexRichTextEditor.sanitizeHtml(html);
window.DexRichTextEditor.normalizeHtml(value);
```

Server routes that persist rich text must still sanitize dangerous tags and event/style attributes.

## Current Integration Points

- Task detail modal description uses `DexRichTextEditor.create`.
- Record notes reuse shared helpers for image insertion, checklist HTML, and image resize.

When touching the Notes editor next, progressively move more of its toolbar command logic to `DexRichTextEditor` instead of adding more local methods.
