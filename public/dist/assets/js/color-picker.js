/**
 * ColorPicker - Vanilla JS reusable color picker component
 * 
 * Features:
 * - Dropdown positioned via getBoundingClientRect()
 * - Click outside / ESC to close
 * - Single open instance (global manager via PickerManager)
 * - Memory safe with .destroy()
 * - Form integration with hidden input
 * - Custom color input
 * - Keyboard friendly
 */

(function () {
    'use strict';

    // Default colors palette
    const DEFAULT_COLORS = [
        '#5B6BFA', // Indigo/Blue
        '#10B981', // Green
        '#F472B6', // Pink
        '#F59E0B', // Amber/Yellow
        '#6B7280', // Gray
        '#8B5CF6', // Purple
        '#3B82F6', // Blue
        '#EF4444', // Red
        '#06B6D4', // Cyan
        '#EC4899', // Hot Pink
        '#14B8A6', // Teal
        '#F97316', // Orange
    ];

    // ============================================
    // COLOR PICKER CLASS
    // ============================================
    class ColorPicker {
        constructor(container, options = {}) {
            this.container = typeof container === 'string' ? document.querySelector(container) : container;
            if (!this.container) {
                console.error('ColorPicker: Container not found');
                return;
            }

            // Options
            this.options = {
                name: options.name || 'color',
                value: options.value || '',
                colors: options.colors || DEFAULT_COLORS,
                allowCustom: options.allowCustom !== false,
                allowClear: options.allowClear !== false,
                onSelect: options.onSelect || null,
                zIndex: options.zIndex || 9999,
                ...options
            };

            // State
            this.isOpen = false;
            this.selectedColor = this.options.value;

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
        }

        _createDOM() {
            // Clear container
            this.container.innerHTML = '';
            this.container.classList.add('picker-container');

            // Hidden input for form integration
            this.hiddenInput = document.createElement('input');
            this.hiddenInput.type = 'hidden';
            this.hiddenInput.name = this.options.name;
            this.hiddenInput.value = this.selectedColor;
            this.container.appendChild(this.hiddenInput);

            // Trigger button
            this.trigger = document.createElement('button');
            this.trigger.type = 'button';
            this.trigger.className = 'picker-trigger picker-trigger--color';
            this.trigger.title = 'Choisir une couleur';
            this._updateTrigger();
            this.container.appendChild(this.trigger);

            // Panel (appended to body)
            this.panel = document.createElement('div');
            this.panel.className = 'picker-panel picker-panel--color';
            this.panel.style.zIndex = this.options.zIndex;
            this.panel.style.display = 'none';

            this.panel.innerHTML = `
        <div class="picker-header">Couleur</div>
        <div class="picker-color-grid"></div>
        <div class="picker-color-actions"></div>
      `;
            document.body.appendChild(this.panel);

            // Cache elements
            this.grid = this.panel.querySelector('.picker-color-grid');
            this.actions = this.panel.querySelector('.picker-color-actions');

            // Render colors
            this._renderColors();
            this._renderActions();
        }

        _updateTrigger() {
            if (this.selectedColor) {
                this.trigger.style.background = this.selectedColor;
                this.trigger.classList.add('picker-trigger--selected');
                this.trigger.innerHTML = '';
            } else {
                // Gradient placeholder
                this.trigger.style.background = 'linear-gradient(135deg, #06b6d4, #8b5cf6, #ec4899)';
                this.trigger.classList.remove('picker-trigger--selected');
                this.trigger.innerHTML = '';
            }
        }

        _renderColors() {
            const fragment = document.createDocumentFragment();

            this.options.colors.forEach(color => {
                const swatch = document.createElement('button');
                swatch.type = 'button';
                swatch.className = 'picker-color-swatch';
                swatch.style.backgroundColor = color;
                swatch.dataset.color = color;
                swatch.title = color;

                if (this.selectedColor === color) {
                    swatch.classList.add('picker-color-swatch--selected');
                    swatch.innerHTML = `<iconify-icon icon="solar:check-circle-bold" width="16" class="picker-color-check"></iconify-icon>`;
                }

                swatch.addEventListener('click', () => {
                    this._selectColor(color);
                });

                fragment.appendChild(swatch);
            });

            this.grid.innerHTML = '';
            this.grid.appendChild(fragment);
        }

        _renderActions() {
            this.actions.innerHTML = '';

            // Custom color picker
            if (this.options.allowCustom) {
                const customWrap = document.createElement('div');
                customWrap.className = 'picker-color-custom';
                customWrap.innerHTML = `
          <iconify-icon icon="solar:pen-new-square-linear" width="14"></iconify-icon>
        `;

                const colorInput = document.createElement('input');
                colorInput.type = 'color';
                colorInput.className = 'picker-color-input';
                colorInput.value = this.selectedColor || '#3B82F6';
                colorInput.addEventListener('input', (e) => {
                    this._selectColor(e.target.value);
                });
                customWrap.appendChild(colorInput);

                this.actions.appendChild(customWrap);
            }

            // Clear button
            if (this.options.allowClear) {
                const clearBtn = document.createElement('button');
                clearBtn.type = 'button';
                clearBtn.className = 'picker-color-clear';
                clearBtn.title = 'Supprimer la couleur';
                clearBtn.innerHTML = `<iconify-icon icon="solar:close-circle-linear" width="14"></iconify-icon>`;
                clearBtn.addEventListener('click', () => {
                    this._selectColor('');
                });
                this.actions.appendChild(clearBtn);
            }
        }

        _selectColor(color) {
            this.selectedColor = color;
            this.hiddenInput.value = color;
            this._updateTrigger();
            this._renderColors(); // Update selection highlight

            if (typeof this.options.onSelect === 'function') {
                this.options.onSelect(color);
            }

            this.close();
        }

        _bindEvents() {
            // Trigger click
            this.trigger.addEventListener('click', (e) => {
                e.stopPropagation();
                this.toggle();
            });

            // Panel click (prevent closing)
            this.panel.addEventListener('click', (e) => {
                e.stopPropagation();
            });
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

            // Register with global manager (shared with IconPicker)
            if (window.PickerManager) {
                window.PickerManager.register(this);
            }

            this.isOpen = true;
            this.panel.style.display = 'block';
            this.panel.classList.add('picker-panel--open');

            // Position panel
            this._updatePosition();

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
            if (window.PickerManager) {
                window.PickerManager.unregister(this);
            }
        }

        toggle() {
            if (this.isOpen) {
                this.close();
            } else {
                this.open();
            }
        }

        getValue() {
            return this.selectedColor;
        }

        setValue(color) {
            this.selectedColor = color;
            this.hiddenInput.value = color;
            this._updateTrigger();
            if (this.isOpen) {
                this._renderColors();
            }
        }

        destroy() {
            // Close if open
            this.close();

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
    window.ColorPicker = ColorPicker;

})();
