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
    // ICON LIBRARIES
    // ============================================
    const ICON_LIBRARIES = {
        solar: {
            name: 'Solar',
            prefix: 'solar:',
            suffix: '-bold-duotone',
            icons: [
                'box', 'user', 'folder', 'document', 'cart', 'bag', 'ticket', 'tag',
                'calendar', 'clock-circle', 'star', 'heart', 'flag', 'bookmark', 'home', 'buildings',
                'phone', 'letter', 'map', 'globe', 'settings', 'cog', 'bell', 'notification',
                'chat-round', 'chat-dots', 'clipboard', 'file', 'archive', 'trash', 'pen', 'pen-new-square',
                'add-circle', 'minus-circle', 'check-circle', 'close-circle', 'info-circle', 'danger',
                'link', 'link-round', 'upload', 'download', 'cloud', 'database', 'server', 'code',
                'widget', 'layers', 'copy', 'scissors', 'magnet', 'key', 'lock', 'lock-open',
                'eye', 'eye-closed', 'camera', 'gallery', 'image', 'video', 'music', 'microphone',
                'headphones', 'speaker', 'volume', 'play', 'pause', 'stop', 'forward', 'rewind',
                'arrow-up', 'arrow-down', 'arrow-left', 'arrow-right', 'refresh', 'sync', 'search', 'filter',
                'sort', 'grid', 'list', 'menu', 'more', 'dots-horizontal', 'dots-vertical',
                'wallet', 'card', 'dollar', 'money', 'chart', 'graph', 'pie-chart', 'bar-chart',
                'users', 'user-plus', 'user-minus', 'user-check', 'user-cross', 'people', 'group',
                'shield', 'verified', 'crown', 'diamond', 'gift', 'cup', 'medal', 'fire',
                'sun', 'moon', 'cloud-sun', 'rain', 'snow', 'lightning', 'wind', 'thermometer',
                'laptop', 'monitor', 'smartphone', 'tablet', 'watch', 'keyboard', 'mouse', 'printer',
                'wifi', 'bluetooth', 'signal', 'battery', 'power', 'flash', 'plug', 'usb',
                'calculator', 'ruler', 'compass', 'target', 'crosshair', 'aim', 'pin', 'location',
                'car', 'bus', 'train', 'plane', 'ship', 'rocket', 'bicycle', 'walk',
                'food', 'restaurant', 'coffee', 'wine', 'beer', 'cake', 'pizza', 'apple',
                'book', 'book-open', 'book-bookmark', 'notebook', 'notes', 'newspaper', 'magazine',
                'graduation-cap', 'diploma', 'certificate', 'award', 'trophy', 'badge',
                'palette', 'brush', 'paint-bucket', 'scissors', 'needle', 'thread', 'fabric',
                'stethoscope', 'pill', 'syringe', 'dna', 'atom', 'flask', 'microscope',
                'football', 'basketball', 'tennis', 'golf', 'bowling', 'dumbbell', 'swimming'
            ]
        },
        mdi: {
            name: 'Material',
            prefix: 'mdi:',
            suffix: '',
            icons: [
                'account', 'account-circle', 'folder', 'file-document', 'cart', 'basket', 'tag', 'label',
                'calendar', 'clock', 'star', 'heart', 'flag', 'bookmark', 'home', 'office-building',
                'phone', 'email', 'map-marker', 'earth', 'cog', 'bell', 'message', 'chat',
                'clipboard', 'file', 'archive', 'delete', 'pencil', 'plus-circle', 'minus-circle',
                'check-circle', 'close-circle', 'information', 'alert', 'link', 'upload', 'download',
                'cloud', 'database', 'server', 'code-tags', 'widgets', 'layers', 'content-copy',
                'key', 'lock', 'lock-open', 'eye', 'eye-off', 'camera', 'image', 'video',
                'music', 'microphone', 'headphones', 'volume-high', 'play', 'pause', 'stop',
                'arrow-up', 'arrow-down', 'arrow-left', 'arrow-right', 'refresh', 'magnify', 'filter',
                'grid', 'view-list', 'menu', 'dots-horizontal', 'dots-vertical', 'wallet', 'credit-card',
                'currency-usd', 'chart-line', 'chart-pie', 'chart-bar', 'account-group', 'shield',
                'check-decagram', 'crown', 'diamond', 'gift', 'trophy', 'fire', 'white-balance-sunny',
                'weather-night', 'cloud-outline', 'laptop', 'monitor', 'cellphone', 'tablet',
                'keyboard', 'mouse', 'printer', 'wifi', 'bluetooth', 'battery', 'power', 'flash',
                'calculator', 'ruler', 'compass', 'target', 'map-marker', 'car', 'bus', 'train',
                'airplane', 'ship', 'rocket', 'bike', 'walk', 'food', 'coffee', 'glass-wine',
                'book', 'book-open', 'notebook', 'newspaper', 'school', 'certificate', 'palette',
                'brush', 'medical-bag', 'pill', 'dna', 'atom', 'flask', 'soccer', 'basketball',
                'tennis', 'golf', 'dumbbell', 'swim'
            ]
        },
        tabler: {
            name: 'Tabler',
            prefix: 'tabler:',
            suffix: '',
            icons: [
                'user', 'users', 'folder', 'file', 'shopping-cart', 'tag', 'calendar', 'clock',
                'star', 'heart', 'flag', 'bookmark', 'home', 'building', 'phone', 'mail',
                'map-pin', 'world', 'settings', 'bell', 'message', 'clipboard', 'file-text',
                'archive', 'trash', 'pencil', 'plus', 'minus', 'check', 'x', 'info-circle',
                'alert-triangle', 'link', 'upload', 'download', 'cloud', 'database', 'server',
                'code', 'layout', 'layers', 'copy', 'key', 'lock', 'lock-open', 'eye',
                'eye-off', 'camera', 'photo', 'video', 'music', 'microphone', 'headphones',
                'volume', 'player-play', 'player-pause', 'player-stop', 'arrow-up', 'arrow-down',
                'arrow-left', 'arrow-right', 'refresh', 'search', 'filter', 'grid-dots', 'list',
                'menu-2', 'dots', 'wallet', 'credit-card', 'currency-dollar', 'chart-line',
                'chart-pie', 'chart-bar', 'users', 'shield', 'circle-check', 'crown', 'diamond',
                'gift', 'trophy', 'flame', 'sun', 'moon', 'cloud', 'device-laptop', 'device-desktop',
                'device-mobile', 'device-tablet', 'keyboard', 'mouse', 'printer', 'wifi', 'bluetooth',
                'battery', 'power', 'bolt', 'calculator', 'ruler', 'compass', 'target', 'map-pin',
                'car', 'bus', 'train', 'plane', 'ship', 'rocket', 'bike', 'walk', 'meat',
                'coffee', 'glass', 'book', 'book-2', 'notebook', 'news', 'school', 'certificate',
                'palette', 'brush', 'first-aid-kit', 'pill', 'dna', 'atom', 'flask', 'ball-football',
                'ball-basketball', 'ball-tennis', 'golf', 'barbell', 'swimming'
            ]
        }
    };

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

        _init() {
            this._createDOM();
            this._bindEvents();
            this._loadIcons();
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
          <div class="picker-search-wrap">
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
            this.librarySelect.addEventListener('change', () => {
                this.currentLibrary = this.librarySelect.value;
                this.currentPage = 1;
                this._loadIcons();
                this._renderGrid();
            });

            // Search input with debounce
            this.searchInput.addEventListener('input', () => {
                clearTimeout(this.searchTimeout);
                this.searchTimeout = setTimeout(() => {
                    this.searchQuery = this.searchInput.value.trim().toLowerCase();
                    this.currentPage = 1;
                    this._loadIcons();
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

        _loadIcons() {
            const lib = ICON_LIBRARIES[this.currentLibrary];
            if (!lib) return;

            // Filter icons by search query
            if (this.searchQuery) {
                this.filteredIcons = lib.icons.filter(name =>
                    name.toLowerCase().includes(this.searchQuery)
                );
            } else {
                this.filteredIcons = [...lib.icons];
            }
        }

        _getFullIconName(iconName) {
            const lib = ICON_LIBRARIES[this.currentLibrary];
            return `${lib.prefix}${iconName}${lib.suffix}`;
        }

        _renderGrid() {
            const totalIcons = this.filteredIcons.length;
            const displayCount = Math.min(this.currentPage * ICONS_PER_PAGE, totalIcons);
            const iconsToShow = this.filteredIcons.slice(0, displayCount);

            // Use DocumentFragment for performance
            const fragment = document.createDocumentFragment();

            iconsToShow.forEach(iconName => {
                const fullIcon = this._getFullIconName(iconName);
                const item = document.createElement('button');
                item.type = 'button';
                item.className = 'picker-item';
                item.dataset.icon = fullIcon;
                item.title = iconName;

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
            this.countDisplay.textContent = `${displayCount} icônes affichées`;
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
