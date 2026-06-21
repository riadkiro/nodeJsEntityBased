(function (window, document) {
    'use strict';

    if (window.DexRichTextEditor) return;

    const DEFAULT_FEATURES = [
        'heading',
        'bold',
        'italic',
        'underline',
        'unorderedList',
        'orderedList',
        'checklist',
        'link',
        'image',
        'clear'
    ];
    const IMAGE_SIZE_RE = /\bdx-rte-img-size-(25|50|75|100)\b/g;

    function asArray(value) {
        return Array.prototype.slice.call(value || []);
    }

    function uniqueClasses(value) {
        return [...new Set(String(value || '').split(/\s+/).filter(Boolean))].join(' ');
    }

    class DexRichTextEditor {
        static create(root, options = {}) {
            return new DexRichTextEditor(root, options);
        }

        static escapeHtml(value = '') {
            return String(value || '')
                .replace(/&/g, '&amp;')
                .replace(/</g, '&lt;')
                .replace(/>/g, '&gt;')
                .replace(/"/g, '&quot;')
                .replace(/'/g, '&#39;');
        }

        static plainToHtml(value = '') {
            return String(value || '').split(/\r?\n/).map(line => {
                return line.trim() ? `<p>${DexRichTextEditor.escapeHtml(line)}</p>` : '<p><br></p>';
            }).join('');
        }

        static normalizeHtml(value = '') {
            const raw = String(value || '').trim();
            if (!raw) return '';
            if (!/<[a-z][\s\S]*>/i.test(raw)) return DexRichTextEditor.plainToHtml(raw);
            return DexRichTextEditor.sanitizeHtml(raw);
        }

        static isSafeUrl(value = '') {
            const url = String(value || '').trim();
            if (!url) return false;
            return /^(https?:|mailto:|tel:|\/)/i.test(url);
        }

        static isSafeImageSrc(value = '') {
            const src = String(value || '').trim();
            if (DexRichTextEditor.isSafeUrl(src)) return true;
            return /^data:image\/(png|jpe?g|gif|webp);base64,/i.test(src);
        }

        static imageSizeClass(size = '100%') {
            const match = String(size || '').match(/(25|50|75|100)/);
            return `dx-rte-img-size-${match ? match[1] : '100'}`;
        }

        static getImageSize(img) {
            if (!img) return '100%';
            const classMatch = String(img.className || '').match(/\bdx-rte-img-size-(25|50|75|100)\b/);
            if (classMatch) return `${classMatch[1]}%`;
            const styleMatch = String(img.getAttribute('style') || '').match(/width\s*:\s*(25|50|75|100)%/i);
            if (styleMatch) return `${styleMatch[1]}%`;
            return img.style?.width || '100%';
        }

        static applyImageSize(img, size = '100%') {
            if (!img) return;
            const keep = String(img.className || '')
                .replace(IMAGE_SIZE_RE, '')
                .replace(/\bdx-rte-img-selected\b/g, '')
                .trim();
            img.className = uniqueClasses(`${keep} ${DexRichTextEditor.imageSizeClass(size)}`);
            img.style.width = '';
            img.style.maxWidth = '';
        }

        static imageHtml(src, alt = 'image', size = '100%') {
            if (!DexRichTextEditor.isSafeImageSrc(src)) return '';
            return '<div><img src="' + DexRichTextEditor.escapeHtml(src) + '" alt="' + DexRichTextEditor.escapeHtml(alt || 'image') + '" class="' + DexRichTextEditor.imageSizeClass(size) + '"></div><div><br></div>';
        }

        static checklistHtml(label = 'Tache', { variant = 'default' } = {}) {
            if (variant === 'note') {
                return '<div class="note-checklist-item" contenteditable="false">' +
                    '<input type="checkbox" onclick="event.stopPropagation()">' +
                    '<span class="note-checklist-text" contenteditable="true">' + DexRichTextEditor.escapeHtml(label) + '</span>' +
                    '<button class="note-checklist-delete" contenteditable="false" onclick="this.parentElement.remove()" title="Supprimer">x</button>' +
                    '</div><div><br></div>';
            }
            return '<div class="dx-rte-check-item" contenteditable="false">' +
                '<input type="checkbox">' +
                '<span class="dx-rte-check-text" contenteditable="true">' + DexRichTextEditor.escapeHtml(label) + '</span>' +
                '</div><p><br></p>';
        }

        static syncCheckboxAttributes(root) {
            if (!root) return;
            root.querySelectorAll('input[type="checkbox"]').forEach(input => {
                if (input.checked) input.setAttribute('checked', '');
                else input.removeAttribute('checked');
            });
        }

        static sanitizeHtml(html = '') {
            const root = document.createElement('div');
            root.innerHTML = String(html || '');
            root.querySelectorAll('script,style,iframe,object,embed,meta,link,form,textarea,select').forEach(el => el.remove());

            const allowed = new Set([
                'P', 'BR', 'DIV', 'SPAN', 'STRONG', 'B', 'EM', 'I', 'U', 'S', 'STRIKE',
                'H1', 'H2', 'H3', 'UL', 'OL', 'LI', 'BLOCKQUOTE', 'PRE', 'CODE', 'A',
                'IMG', 'INPUT', 'FONT'
            ]);

            const cleanChildren = node => {
                asArray(node.children).forEach(child => {
                    if (!allowed.has(child.tagName)) {
                        child.replaceWith(...asArray(child.childNodes));
                        cleanChildren(node);
                        return;
                    }

                    const initialClass = child.getAttribute('class') || '';
                    const initialStyle = child.getAttribute('style') || '';

                    asArray(child.attributes).forEach(attr => {
                        const name = attr.name.toLowerCase();
                        if (name.startsWith('on') || name === 'style') child.removeAttribute(attr.name);
                    });

                    if (child.tagName === 'A') {
                        const href = child.getAttribute('href') || '';
                        if (DexRichTextEditor.isSafeUrl(href)) {
                            child.setAttribute('target', '_blank');
                            child.setAttribute('rel', 'noopener noreferrer');
                        } else {
                            child.removeAttribute('href');
                        }
                        asArray(child.attributes).forEach(attr => {
                            if (!['href', 'target', 'rel'].includes(attr.name.toLowerCase())) child.removeAttribute(attr.name);
                        });
                    } else if (child.tagName === 'IMG') {
                        const src = child.getAttribute('src') || '';
                        if (!DexRichTextEditor.isSafeImageSrc(src)) {
                            child.remove();
                            return;
                        }
                        const sizeFromClass = String(initialClass).match(/\bdx-rte-img-size-(25|50|75|100)\b/);
                        const sizeFromStyle = String(initialStyle).match(/width\s*:\s*(25|50|75|100)%/i);
                        const sizeClass = DexRichTextEditor.imageSizeClass(sizeFromClass ? sizeFromClass[1] : (sizeFromStyle ? sizeFromStyle[1] : '100'));
                        asArray(child.attributes).forEach(attr => {
                            if (!['src', 'alt', 'title'].includes(attr.name.toLowerCase())) child.removeAttribute(attr.name);
                        });
                        child.setAttribute('class', sizeClass);
                    } else if (child.tagName === 'INPUT') {
                        if ((child.getAttribute('type') || '').toLowerCase() !== 'checkbox') {
                            child.remove();
                            return;
                        }
                        asArray(child.attributes).forEach(attr => {
                            if (!['type', 'checked'].includes(attr.name.toLowerCase())) child.removeAttribute(attr.name);
                        });
                    } else {
                        const classes = String(initialClass || '').split(/\s+/);
                        asArray(child.attributes).forEach(attr => child.removeAttribute(attr.name));

                        if (child.tagName === 'DIV') {
                            if (classes.includes('dx-rte-check-item') || classes.includes('tdm-desc-check-row')) {
                                child.setAttribute('class', 'dx-rte-check-item');
                                child.setAttribute('contenteditable', 'false');
                            } else if (classes.includes('note-checklist-item')) {
                                child.setAttribute('class', 'note-checklist-item');
                                child.setAttribute('contenteditable', 'false');
                            }
                        }

                        if (child.tagName === 'SPAN') {
                            if (classes.includes('dx-rte-check-text')) {
                                child.setAttribute('class', 'dx-rte-check-text');
                                child.setAttribute('contenteditable', 'true');
                            } else if (classes.includes('note-checklist-text')) {
                                child.setAttribute('class', 'note-checklist-text');
                                child.setAttribute('contenteditable', 'true');
                            }
                        }
                    }

                    cleanChildren(child);
                });
            };

            DexRichTextEditor.syncCheckboxAttributes(root);
            cleanChildren(root);
            return root.innerHTML.trim();
        }

        constructor(root, options = {}) {
            this.root = root;
            this.options = options;
            this.editor = options.editor || root?.querySelector?.('[data-dx-rte-editor]') || root?.querySelector?.('[data-rte-editor]') || root;
            this.toolbar = options.toolbar || root?.querySelector?.('[data-dx-rte-toolbar]') || root?.querySelector?.('[data-rte-toolbar]');
            this.imageToolbar = options.imageToolbar || root?.querySelector?.('[data-dx-rte-image-toolbar]') || root?.querySelector?.('[data-rte-image-toolbar]');
            this.features = new Set(options.features || DEFAULT_FEATURES);
            this.listeners = [];
            this.key = options.key || '';
            this.selectedImage = null;
            this.savedSelection = null;
            this.silent = false;

            if (this.root) this.root.classList.add('dx-rte');
            if (this.editor) {
                this.editor.classList.add('dx-rte-content');
                this.editor.setAttribute('contenteditable', 'true');
                if (options.placeholder) this.editor.setAttribute('data-placeholder', options.placeholder);
            }

            if (options.renderToolbar !== false) this.renderToolbar();
            if (options.imageResize !== false) this.renderImageToolbar();
            this.bind();
            if (options.initialHtml !== undefined) this.setHtml(options.initialHtml, { force: true, key: this.key });
        }

        on(target, event, handler, options) {
            if (!target) return;
            target.addEventListener(event, handler, options);
            this.listeners.push(() => target.removeEventListener(event, handler, options));
        }

        destroy() {
            this.listeners.splice(0).forEach(off => off());
            this.clearImageSelection();
            this.root = null;
            this.editor = null;
            this.toolbar = null;
            this.imageToolbar = null;
        }

        renderToolbar() {
            if (!this.toolbar) return;
            const group = [];
            const button = (feature, action, title, html, extra = '') => {
                if (!this.features.has(feature)) return;
                group.push(`<button type="button" class="dx-rte-tool ${extra}" data-rte-action="${action}" title="${DexRichTextEditor.escapeHtml(title)}">${html}</button>`);
            };
            const sep = () => group.push('<span class="dx-rte-sep"></span>');

            button('heading', 'heading', 'Titre', 'T', 'is-text');
            button('bold', 'bold', 'Gras', '<b>B</b>');
            button('italic', 'italic', 'Italique', '<i>I</i>');
            button('underline', 'underline', 'Souligner', '<u>U</u>');
            button('strike', 'strikeThrough', 'Barrer', '<s>S</s>');
            sep();
            button('unorderedList', 'insertUnorderedList', 'Liste', '<iconify-icon icon="solar:list-bold-duotone" width="15"></iconify-icon>');
            button('orderedList', 'insertOrderedList', 'Liste numerotee', '<iconify-icon icon="solar:list-check-bold-duotone" width="15"></iconify-icon>');
            button('quote', 'quote', 'Citation', '<iconify-icon icon="solar:chat-square-like-bold-duotone" width="15"></iconify-icon>');
            button('checklist', 'checklist', 'Checklist', '<iconify-icon icon="solar:checklist-minimalistic-linear" width="15"></iconify-icon>');
            sep();
            button('link', 'link', 'Lien', '<iconify-icon icon="solar:link-round-linear" width="15"></iconify-icon>');
            button('image', 'image', 'Image', '<iconify-icon icon="solar:gallery-add-linear" width="15"></iconify-icon>');
            button('clear', 'clear', 'Nettoyer', '<iconify-icon icon="solar:eraser-linear" width="15"></iconify-icon>');

            this.toolbar.innerHTML = group.join('').replace(/(?:<span class="dx-rte-sep"><\/span>)+$/g, '');
        }

        renderImageToolbar() {
            if (!this.imageToolbar) return;
            this.imageToolbar.classList.add('dx-rte-image-toolbar');
            this.imageToolbar.innerHTML = [
                '<button type="button" data-rte-img-size="25%">25%</button>',
                '<button type="button" data-rte-img-size="50%">50%</button>',
                '<button type="button" data-rte-img-size="75%">75%</button>',
                '<button type="button" data-rte-img-size="100%">100%</button>',
                '<span class="dx-rte-sep"></span>',
                '<button type="button" class="dx-rte-image-delete" data-rte-img-delete="1"><iconify-icon icon="solar:trash-bin-trash-bold" width="14"></iconify-icon></button>'
            ].join('');
            this.imageToolbar.hidden = true;
        }

        bind() {
            if (!this.editor) return;
            this.on(this.toolbar, 'mousedown', event => {
                if (event.target.closest('button')) event.preventDefault();
            });
            this.on(this.toolbar, 'click', event => {
                const button = event.target.closest('[data-rte-action]');
                if (!button) return;
                this.runAction(button.dataset.rteAction);
            });
            this.on(this.editor, 'input', () => this.emitChange('input'));
            this.on(this.editor, 'change', () => this.emitChange('change'), true);
            this.on(this.editor, 'blur', () => {
                this.emitChange('blur');
                if (typeof this.options.onBlur === 'function') this.options.onBlur(this);
            });
            this.on(this.editor, 'paste', event => this.handlePaste(event));
            this.on(this.editor, 'click', event => this.handleEditorClick(event));
            this.on(this.editor, 'keyup', () => this.updateFormats());
            this.on(this.editor, 'mouseup', () => this.updateFormats());
            this.on(this.editor, 'keydown', event => this.handleChecklistKeydown(event));
            this.on(this.imageToolbar, 'click', event => {
                const sizeButton = event.target.closest('[data-rte-img-size]');
                if (sizeButton) {
                    this.resizeSelectedImage(sizeButton.dataset.rteImgSize);
                    return;
                }
                if (event.target.closest('[data-rte-img-delete]')) this.deleteSelectedImage();
            });
            this.on(document, 'selectionchange', () => {
                if (document.activeElement === this.editor || this.editor.contains(document.activeElement)) this.updateFormats();
            });
            this.on(window, 'resize', () => this.positionImageToolbar());
            this.on(this.editor, 'scroll', () => this.positionImageToolbar());
        }

        runAction(action) {
            if (action === 'heading') return this.exec('formatBlock', '<h3>');
            if (action === 'quote') return this.exec('formatBlock', '<blockquote>');
            if (action === 'checklist') return this.insertChecklist();
            if (action === 'link') return this.insertLinkPrompt();
            if (action === 'image') return this.pickImage();
            if (action === 'clear') return this.clearFormatting();
            return this.exec(action);
        }

        focus() {
            if (this.editor) this.editor.focus();
        }

        saveSelection() {
            const sel = window.getSelection?.();
            if (sel && sel.rangeCount > 0) this.savedSelection = sel.getRangeAt(0).cloneRange();
        }

        restoreSelection() {
            if (!this.savedSelection) return;
            const sel = window.getSelection?.();
            if (!sel) return;
            const range = this.savedSelection;
            this.savedSelection = null;
            sel.removeAllRanges();
            sel.addRange(range);
        }

        exec(command, value = null) {
            this.focus();
            document.execCommand(command, false, value);
            this.updateFormats();
            this.emitChange(command);
        }

        insertHtml(html) {
            this.focus();
            this.restoreSelection();
            document.execCommand('insertHTML', false, DexRichTextEditor.sanitizeHtml(html));
            this.updateFormats();
            this.emitChange('insertHTML');
        }

        insertChecklist(label = 'Element a cocher') {
            this.insertHtml(DexRichTextEditor.checklistHtml(label));
        }

        insertLinkPrompt() {
            this.saveSelection();
            const selectedText = String(window.getSelection?.() || '').trim();
            const url = window.prompt('Lien a ajouter');
            if (!url || !DexRichTextEditor.isSafeUrl(url)) return;
            if (selectedText) {
                this.restoreSelection();
                this.exec('createLink', url);
                return;
            }
            this.insertHtml('<a href="' + DexRichTextEditor.escapeHtml(url) + '">' + DexRichTextEditor.escapeHtml(url) + '</a>');
        }

        pickImage() {
            this.saveSelection();
            if (typeof this.options.onPickImage === 'function') {
                this.options.onPickImage(this);
            }
        }

        async handleImageFiles(files) {
            const images = asArray(files).filter(file => file && String(file.type || '').startsWith('image/'));
            if (!images.length) return [];
            if (typeof this.options.uploadImages !== 'function') return [];
            try {
                const uploaded = await this.options.uploadImages(images, this);
                asArray(uploaded).forEach(img => {
                    if (img?.url) this.insertImage(img.url, img.alt || img.name || 'image', img.size || '100%');
                });
                return uploaded || [];
            } catch (error) {
                console.error('[DexRichTextEditor] Image upload failed:', error);
                return [];
            }
        }

        insertImage(src, alt = 'image', size = '100%') {
            const html = DexRichTextEditor.imageHtml(src, alt, size);
            if (html) this.insertHtml(html);
        }

        handlePaste(event) {
            const files = asArray(event.clipboardData?.files).filter(file => String(file.type || '').startsWith('image/'));
            if (files.length) {
                event.preventDefault();
                this.saveSelection();
                this.handleImageFiles(files);
                return;
            }
            const html = event.clipboardData?.getData('text/html');
            const text = event.clipboardData?.getData('text/plain') || '';
            event.preventDefault();
            if (html) {
                this.insertHtml(html);
            } else if (text) {
                this.focus();
                document.execCommand('insertText', false, text);
                this.emitChange('pasteText');
            }
        }

        emitChange(source = 'input') {
            if (this.silent || !this.editor) return;
            DexRichTextEditor.syncCheckboxAttributes(this.editor);
            if (typeof this.options.onChange === 'function') {
                this.options.onChange(this.getHtml(), { source, editor: this.editor, instance: this });
            }
        }

        getHtml() {
            if (!this.editor) return '';
            DexRichTextEditor.syncCheckboxAttributes(this.editor);
            return DexRichTextEditor.sanitizeHtml(this.editor.innerHTML);
        }

        setHtml(html = '', { force = false, key = this.key } = {}) {
            if (!this.editor) return;
            const normalized = DexRichTextEditor.normalizeHtml(html);
            const focused = document.activeElement === this.editor || this.editor.contains(document.activeElement);
            if (!force && focused && String(this.key || '') === String(key || '')) return;
            if (force || String(this.key || '') !== String(key || '') || this.editor.innerHTML !== normalized) {
                this.silent = true;
                this.editor.innerHTML = normalized;
                this.key = key || '';
                this.silent = false;
                this.updateFormats();
            }
        }

        clearFormatting() {
            this.focus();
            document.execCommand('removeFormat', false, null);
            document.execCommand('unlink', false, null);
            this.updateFormats();
            this.emitChange('clear');
        }

        updateFormats() {
            if (!this.toolbar || !this.editor) return;
            const states = {
                bold: this.queryState('bold'),
                italic: this.queryState('italic'),
                underline: this.queryState('underline'),
                strikeThrough: this.queryState('strikeThrough'),
                insertUnorderedList: this.queryState('insertUnorderedList'),
                insertOrderedList: this.queryState('insertOrderedList')
            };
            const block = String(this.queryValue('formatBlock') || '').toLowerCase();
            asArray(this.toolbar.querySelectorAll('[data-rte-action]')).forEach(button => {
                const action = button.dataset.rteAction;
                const active = !!states[action] || (action === 'heading' && /^h[1-3]$/.test(block)) || (action === 'quote' && block === 'blockquote');
                button.classList.toggle('active', active);
            });
        }

        queryState(command) {
            try { return document.queryCommandState(command); } catch (e) { return false; }
        }

        queryValue(command) {
            try { return document.queryCommandValue(command); } catch (e) { return ''; }
        }

        handleEditorClick(event) {
            this.updateFormats();
            if (event.target?.tagName === 'IMG') {
                event.preventDefault();
                this.selectImage(event.target);
                return;
            }
            if (event.target?.tagName === 'A' && (event.ctrlKey || event.metaKey)) {
                event.preventDefault();
                const href = event.target.getAttribute('href');
                if (href) window.open(href, '_blank', 'noopener');
                return;
            }
            if (this.selectedImage) this.clearImageSelection();
        }

        selectImage(img) {
            if (!img) return;
            this.clearImageSelection();
            img.classList.add('dx-rte-img-selected');
            this.selectedImage = img;
            this.positionImageToolbar();
        }

        clearImageSelection() {
            if (this.selectedImage) this.selectedImage.classList.remove('dx-rte-img-selected');
            this.selectedImage = null;
            if (this.imageToolbar) this.imageToolbar.hidden = true;
        }

        positionImageToolbar() {
            if (!this.imageToolbar || !this.selectedImage || !this.root) return;
            const imgRect = this.selectedImage.getBoundingClientRect();
            const rootRect = this.root.getBoundingClientRect();
            const toolbarW = this.imageToolbar.offsetWidth || 230;
            let left = imgRect.left - rootRect.left + (imgRect.width / 2) - (toolbarW / 2);
            let top = imgRect.top - rootRect.top - 40;
            const maxLeft = Math.max(4, this.root.clientWidth - toolbarW - 4);
            if (left < 4) left = 4;
            if (left > maxLeft) left = maxLeft;
            if (top < 4) top = imgRect.bottom - rootRect.top + 8;
            this.imageToolbar.style.left = `${left}px`;
            this.imageToolbar.style.top = `${top}px`;
            this.imageToolbar.hidden = false;
            const current = DexRichTextEditor.getImageSize(this.selectedImage);
            asArray(this.imageToolbar.querySelectorAll('[data-rte-img-size]')).forEach(button => {
                button.classList.toggle('active', button.dataset.rteImgSize === current);
            });
        }

        resizeSelectedImage(size) {
            if (!this.selectedImage) return;
            DexRichTextEditor.applyImageSize(this.selectedImage, size);
            this.emitChange('imageResize');
            this.positionImageToolbar();
        }

        deleteSelectedImage() {
            if (!this.selectedImage) return;
            const parent = this.selectedImage.parentElement;
            this.selectedImage.remove();
            if (parent && parent.tagName === 'DIV' && !parent.textContent.trim() && !parent.querySelector('img')) parent.remove();
            this.selectedImage = null;
            if (this.imageToolbar) this.imageToolbar.hidden = true;
            this.emitChange('imageDelete');
        }

        handleChecklistKeydown(event) {
            if (!['Enter', 'Backspace'].includes(event.key)) return;
            const sel = window.getSelection?.();
            if (!sel || !sel.anchorNode) return;
            const node = sel.anchorNode.nodeType === 3 ? sel.anchorNode.parentElement : sel.anchorNode;
            const item = node?.closest?.('.dx-rte-check-item');
            if (!item || !this.editor.contains(item)) return;
            const textNode = item.querySelector('.dx-rte-check-text');
            const text = String(textNode?.textContent || '').replace(/\u200B/g, '').trim();

            if (event.key === 'Enter') {
                event.preventDefault();
                const wrapper = document.createElement('div');
                wrapper.innerHTML = DexRichTextEditor.checklistHtml(text ? '' : 'Element a cocher');
                const nextItem = wrapper.firstElementChild;
                item.after(nextItem);
                this.focusChecklistText(nextItem);
                this.emitChange('checklistEnter');
            } else if (event.key === 'Backspace' && !text) {
                event.preventDefault();
                const prev = item.previousElementSibling;
                const next = item.nextElementSibling;
                item.remove();
                this.focusChecklistText(prev || next);
                this.emitChange('checklistBackspace');
            }
        }

        focusChecklistText(item) {
            const target = item?.querySelector?.('.dx-rte-check-text') || item;
            if (!target) return;
            const range = document.createRange();
            range.selectNodeContents(target);
            range.collapse(false);
            const sel = window.getSelection?.();
            if (!sel) return;
            sel.removeAllRanges();
            sel.addRange(range);
        }
    }

    window.DexRichTextEditor = DexRichTextEditor;
})(window, document);
