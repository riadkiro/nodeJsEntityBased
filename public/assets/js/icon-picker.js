/**
 * IconPicker - Vanilla JS reusable icon picker component
 * 
 * Features:
 * - Dropdown positioned via getBoundingClientRect()
 * - Click outside / ESC to close
 * - Single open instance (global manager)
 * - Memory safe with .destroy()
 * - Form integration with hidden input
 * - Paginated icon loading
 * - Debounced search
 * - Keyboard friendly
 */

(function () {
    'use strict';

    // ============================================
    // GLOBAL MANAGER - Single open instance
    // ============================================
    const PickerManager = {
        activeInstance: null,

        register(instance) {
            if (this.activeInstance && this.activeInstance !== instance) {
                this.activeInstance.close();
            }
            this.activeInstance = instance;
        },

        unregister(instance) {
            if (this.activeInstance === instance) {
                this.activeInstance = null;
            }
        },

        closeAll() {
            if (this.activeInstance) {
                this.activeInstance.close();
            }
        }
    };

    // Make it global for ColorPicker to use
    window.PickerManager = PickerManager;

    // ============================================
    // ICON STYLES (for Solar)
    // ============================================
    const ICON_STYLES = {
        'bold-duotone': { name: 'Bold Duotone', suffix: '-bold-duotone' },
        'linear': { name: 'Linear', suffix: '-linear' },
        'bold': { name: 'Bold', suffix: '-bold' },
        'outline': { name: 'Outline', suffix: '-outline' },
        'broken': { name: 'Broken', suffix: '-broken' },
        'line-duotone': { name: 'Line Duotone', suffix: '-line-duotone' }
    };

    // ============================================
    // ICON LIBRARIES - Loaded dynamically
    // ============================================
    const ICON_LIBRARIES = {
        solar: {
            name: 'Solar',
            prefix: 'solar:',
            jsonUrl: '/data/solar-icons.json',
            hasStyles: true, // Supports style filtering
            icons: [] // Will be loaded dynamically
        },
        mdi: {
            name: 'Material',
            prefix: 'mdi:',
            icons: [
                'mdi:account', 'mdi:account-circle', 'mdi:folder', 'mdi:file-document', 'mdi:cart', 'mdi:basket', 'mdi:tag', 'mdi:label',
                'mdi:calendar', 'mdi:clock', 'mdi:star', 'mdi:heart', 'mdi:flag', 'mdi:bookmark', 'mdi:home', 'mdi:office-building',
                'mdi:phone', 'mdi:email', 'mdi:map-marker', 'mdi:earth', 'mdi:cog', 'mdi:bell', 'mdi:message', 'mdi:chat',
                'mdi:clipboard', 'mdi:file', 'mdi:archive', 'mdi:delete', 'mdi:pencil', 'mdi:plus-circle', 'mdi:minus-circle',
                'mdi:check-circle', 'mdi:close-circle', 'mdi:information', 'mdi:alert', 'mdi:link', 'mdi:upload', 'mdi:download',
                'mdi:cloud', 'mdi:database', 'mdi:server', 'mdi:code-tags', 'mdi:widgets', 'mdi:layers', 'mdi:content-copy',
                'mdi:key', 'mdi:lock', 'mdi:lock-open', 'mdi:eye', 'mdi:eye-off', 'mdi:camera', 'mdi:image', 'mdi:video',
                'mdi:music', 'mdi:microphone', 'mdi:headphones', 'mdi:volume-high', 'mdi:play', 'mdi:pause', 'mdi:stop'
            ]
        },
        tabler: {
            name: 'Tabler',
            prefix: 'tabler:',
            icons: [
                'tabler:user', 'tabler:users', 'tabler:folder', 'tabler:file', 'tabler:shopping-cart', 'tabler:tag', 'tabler:calendar', 'tabler:clock',
                'tabler:star', 'tabler:heart', 'tabler:flag', 'tabler:bookmark', 'tabler:home', 'tabler:building', 'tabler:phone', 'tabler:mail',
                'tabler:map-pin', 'tabler:world', 'tabler:settings', 'tabler:bell', 'tabler:message', 'tabler:clipboard', 'tabler:file-text',
                'tabler:archive', 'tabler:trash', 'tabler:pencil', 'tabler:plus', 'tabler:minus', 'tabler:check', 'tabler:x', 'tabler:info-circle',
                'tabler:alert-triangle', 'tabler:link', 'tabler:upload', 'tabler:download', 'tabler:cloud', 'tabler:database', 'tabler:server',
                'tabler:code', 'tabler:layout', 'tabler:layers', 'tabler:copy', 'tabler:key', 'tabler:lock', 'tabler:lock-open', 'tabler:eye',
                'tabler:eye-off', 'tabler:camera', 'tabler:photo', 'tabler:video', 'tabler:music', 'tabler:microphone', 'tabler:headphones'
            ]
        }
    };

    // Cache for loaded icon libraries (raw JSON)
    const _iconJsonCache = {};

    // Load icons from JSON for a library with optional style filter
    async function loadLibraryIcons(libraryKey, styleKey = null) {
        const lib = ICON_LIBRARIES[libraryKey];
        if (!lib) return [];

        // If static icons (no JSON URL), return directly
        if (!lib.jsonUrl) {
            return lib.icons || [];
        }

        // Load raw JSON if not cached
        if (!_iconJsonCache[libraryKey]) {
            try {
                const response = await fetch(lib.jsonUrl);
                if (response.ok) {
                    _iconJsonCache[libraryKey] = await response.json();
                }
            } catch (e) {
                console.warn(`Failed to load icons for ${libraryKey}:`, e);
                return [];
            }
        }

        const allIcons = _iconJsonCache[libraryKey] || [];

        // Apply style filter if library supports styles
        if (lib.hasStyles && styleKey && ICON_STYLES[styleKey]) {
            const suffix = ICON_STYLES[styleKey].suffix;
            return allIcons.filter(icon => icon.endsWith(suffix));
        }

        return allIcons;
    }

    const ICONS_PER_PAGE = 60;
    const SEARCH_DEBOUNCE_MS = 200;

    // ============================================
    // ICON PICKER CLASS
    // ============================================
    class IconPicker {
        constructor(container, options = {}) {
            this.container = typeof container === 'string' ? document.querySelector(container) : container;
            if (!this.container) {
                console.error('IconPicker: Container not found');
                return;
            }

            // Options
            this.options = {
                name: options.name || 'icon',
                value: options.value || '',
                library: options.library || 'solar',
                placeholder: options.placeholder || 'solar:box-bold-duotone',
                onSelect: options.onSelect || null,
                zIndex: options.zIndex || 9999,
                ...options
            };

            // State
            this.isOpen = false;
            this.selectedIcon = this.options.value;
            this.currentLibrary = this.options.library;
            this.currentStyle = 'bold-duotone'; // Default style for Solar
            this.searchQuery = '';
            this.currentPage = 1;
            this.filteredIcons = [];
            this.searchTimeout = null;
            this.triggerElement = null;

            // Bound handlers for cleanup
            this._boundHandleClickOutside = this._handleClickOutside.bind(this);
            this._boundHandleKeydown = this._handleKeydown.bind(this);
            this._boundHandleScroll = this._handlePositionUpdate.bind(this);
            this._boundHandleResize = this._handlePositionUpdate.bind(this);

            this._init();
        }

        async _init() {
            this._createDOM();
            this._bindEvents();
            await this._loadIcons();
            this._renderGrid();
        }

        _createDOM() {
            // Clear container
            this.container.innerHTML = '';
            this.container.classList.add('picker-container');

            // Hidden input for form integration
            this.hiddenInput = document.createElement('input');
            this.hiddenInput.type = 'hidden';
            this.hiddenInput.name = this.options.name;
            this.hiddenInput.value = this.selectedIcon;
            this.container.appendChild(this.hiddenInput);

            // Trigger button
            this.trigger = document.createElement('button');
            this.trigger.type = 'button';
            this.trigger.className = 'picker-trigger picker-trigger--icon';
            this.trigger.title = 'Choisir une icône';
            this._updateTrigger();
            this.container.appendChild(this.trigger);

            // Panel (appended to body)
            this.panel = document.createElement('div');
            this.panel.className = 'picker-panel picker-panel--icon';
            this.panel.style.zIndex = this.options.zIndex;
            this.panel.style.display = 'none';
            this.panel.innerHTML = `
        <div class="picker-header">Choisir une icône</div>
        <div class="picker-controls">
          <select class="picker-library form-select">
            ${Object.entries(ICON_LIBRARIES).map(([key, lib]) =>
                `<option value="${key}" ${key === this.currentLibrary ? 'selected' : ''}>${lib.name}</option>`
            ).join('')}
          </select>
          <select class="picker-style form-select" ${ICON_LIBRARIES[this.currentLibrary].hasStyles ? '' : 'style="display:none"'}>
            ${Object.entries(ICON_STYLES).map(([key, style]) =>
                `<option value="${key}" ${key === this.currentStyle ? 'selected' : ''}>${style.name}</option>`
            ).join('')}
          </select>
        </div>
        <div class="picker-controls">
          <div class="picker-search-wrap" style="flex:1">
            <iconify-icon icon="solar:magnifer-linear" class="picker-search-icon" width="16"></iconify-icon>
            <input type="text" class="picker-search form-input" placeholder="Rechercher...">
          </div>
        </div>
        <div class="picker-grid"></div>
        <div class="picker-footer">
          <a href="#" class="picker-load-more">Charger plus...</a>
          <span class="picker-count"></span>
        </div>
      `;
            document.body.appendChild(this.panel);

            // Cache elements
            this.librarySelect = this.panel.querySelector('.picker-library');
            this.styleSelect = this.panel.querySelector('.picker-style');
            this.searchInput = this.panel.querySelector('.picker-search');
            this.grid = this.panel.querySelector('.picker-grid');
            this.loadMoreBtn = this.panel.querySelector('.picker-load-more');
            this.countDisplay = this.panel.querySelector('.picker-count');
        }

        _updateTrigger() {
            const icon = this.selectedIcon || this.options.placeholder;
            this.trigger.innerHTML = `<iconify-icon icon="${icon}" width="22"></iconify-icon>`;
            this.trigger.classList.toggle('picker-trigger--selected', !!this.selectedIcon);
        }

        _bindEvents() {
            // Trigger click
            this.trigger.addEventListener('click', (e) => {
                e.stopPropagation();
                this.toggle();
            });

            // Library change
            this.librarySelect.addEventListener('change', async () => {
                this.currentLibrary = this.librarySelect.value;
                this.currentPage = 1;
                // Show/hide style selector based on library
                const lib = ICON_LIBRARIES[this.currentLibrary];
                this.styleSelect.style.display = lib.hasStyles ? '' : 'none';
                await this._loadIcons();
                this._renderGrid();
            });

            // Style change (for Solar icons)
            this.styleSelect.addEventListener('change', async () => {
                this.currentStyle = this.styleSelect.value;
                this.currentPage = 1;
                await this._loadIcons();
                this._renderGrid();
            });

            // Search input with debounce
            this.searchInput.addEventListener('input', () => {
                clearTimeout(this.searchTimeout);
                this.searchTimeout = setTimeout(async () => {
                    this.searchQuery = this.searchInput.value.trim().toLowerCase();
                    this.currentPage = 1;
                    await this._loadIcons();
                    this._renderGrid();
                }, SEARCH_DEBOUNCE_MS);
            });

            // Load more
            this.loadMoreBtn.addEventListener('click', (e) => {
                e.preventDefault();
                this.currentPage++;
                this._renderGrid();
            });

            // Panel click (prevent closing)
            this.panel.addEventListener('click', (e) => {
                e.stopPropagation();
            });
        }

        async _loadIcons() {
            const allIcons = await loadLibraryIcons(this.currentLibrary, this.currentStyle);

            // Filter icons by search query
            if (this.searchQuery) {
                this.filteredIcons = allIcons.filter(name =>
                    name.toLowerCase().includes(this.searchQuery)
                );
            } else {
                this.filteredIcons = [...allIcons];
            }
        }

        _renderGrid() {
            const totalIcons = this.filteredIcons.length;
            const displayCount = Math.min(this.currentPage * ICONS_PER_PAGE, totalIcons);
            const iconsToShow = this.filteredIcons.slice(0, displayCount);

            // Use DocumentFragment for performance
            const fragment = document.createDocumentFragment();

            iconsToShow.forEach(fullIcon => {
                const item = document.createElement('button');
                item.type = 'button';
                item.className = 'picker-item';
                item.dataset.icon = fullIcon;
                // Extract display name from full icon (e.g., "solar:box-bold-duotone" -> "box")
                const displayName = fullIcon.replace(/^[^:]+:/, '').replace(/-bold-duotone$/, '');
                item.title = displayName;

                if (this.selectedIcon === fullIcon) {
                    item.classList.add('picker-item--selected');
                }

                item.innerHTML = `<iconify-icon icon="${fullIcon}" width="22"></iconify-icon>`;

                item.addEventListener('click', () => {
                    this._selectIcon(fullIcon);
                });

                fragment.appendChild(item);
            });

            this.grid.innerHTML = '';
            this.grid.appendChild(fragment);

            // Update count and load more visibility
            this.countDisplay.textContent = `${displayCount} / ${totalIcons} icônes`;
            this.loadMoreBtn.style.display = displayCount < totalIcons ? 'inline' : 'none';
        }

        _selectIcon(icon) {
            this.selectedIcon = icon;
            this.hiddenInput.value = icon;
            this._updateTrigger();
            this._renderGrid(); // Update selection highlight

            if (typeof this.options.onSelect === 'function') {
                this.options.onSelect(icon);
            }

            this.close();
        }

        _updatePosition() {
            if (!this.isOpen) return;

            const rect = this.trigger.getBoundingClientRect();
            const panelRect = this.panel.getBoundingClientRect();
            const viewportWidth = window.innerWidth;
            const viewportHeight = window.innerHeight;

            // Calculate position
            let top = rect.bottom + 8;
            let left = rect.left;

            // Flip up if not enough space below
            if (top + panelRect.height > viewportHeight - 20) {
                top = rect.top - panelRect.height - 8;
            }

            // Adjust horizontal if overflowing right
            if (left + panelRect.width > viewportWidth - 20) {
                left = viewportWidth - panelRect.width - 20;
            }

            // Ensure not off-screen left
            if (left < 20) {
                left = 20;
            }

            this.panel.style.top = `${top}px`;
            this.panel.style.left = `${left}px`;
        }

        _handlePositionUpdate() {
            if (this.isOpen) {
                requestAnimationFrame(() => this._updatePosition());
            }
        }

        _handleClickOutside(e) {
            if (!this.panel.contains(e.target) && !this.trigger.contains(e.target)) {
                this.close();
            }
        }

        _handleKeydown(e) {
            if (e.key === 'Escape') {
                this.close();
            }
        }

        open() {
            if (this.isOpen) return;

            // Register with global manager
            PickerManager.register(this);

            this.isOpen = true;
            this.panel.style.display = 'block';
            this.panel.classList.add('picker-panel--open');

            // Position panel
            this._updatePosition();

            // Focus search
            setTimeout(() => {
                this.searchInput.focus();
            }, 50);

            // Add global listeners
            document.addEventListener('click', this._boundHandleClickOutside, true);
            document.addEventListener('keydown', this._boundHandleKeydown);
            window.addEventListener('scroll', this._boundHandleScroll, true);
            window.addEventListener('resize', this._boundHandleResize);
        }

        close() {
            if (!this.isOpen) return;

            this.isOpen = false;
            this.panel.classList.remove('picker-panel--open');
            this.panel.style.display = 'none';

            // Remove global listeners
            document.removeEventListener('click', this._boundHandleClickOutside, true);
            document.removeEventListener('keydown', this._boundHandleKeydown);
            window.removeEventListener('scroll', this._boundHandleScroll, true);
            window.removeEventListener('resize', this._boundHandleResize);

            // Restore focus
            this.trigger.focus();

            // Unregister
            PickerManager.unregister(this);
        }

        toggle() {
            if (this.isOpen) {
                this.close();
            } else {
                this.open();
            }
        }

        getValue() {
            return this.selectedIcon;
        }

        setValue(icon) {
            this.selectedIcon = icon;
            this.hiddenInput.value = icon;
            this._updateTrigger();
            if (this.isOpen) {
                this._renderGrid();
            }
        }

        destroy() {
            // Close if open
            this.close();

            // Clear timeout
            clearTimeout(this.searchTimeout);

            // Remove panel from body
            if (this.panel && this.panel.parentNode) {
                this.panel.parentNode.removeChild(this.panel);
            }

            // Clear container
            this.container.innerHTML = '';

            // Nullify references
            this.container = null;
            this.trigger = null;
            this.panel = null;
            this.hiddenInput = null;
        }
    }

    // Export to global
    window.IconPicker = IconPicker;

})();
