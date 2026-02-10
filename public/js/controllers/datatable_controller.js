/**
 * DataTable Stimulus Controller
 * Handles HTMX + Stimulus DataTable for light datasets (<5000 rows)
 * 
 * Features:
 * - Search with debounce (300ms)
 * - Server-side pagination
 * - Column visibility toggle
 * - Density settings
 * - Preference persistence (userId + viewId)
 * - ESC key to close panels
 * - Click outside to close
 */
import { Controller } from "@hotwired/stimulus"

export default class extends Controller {
    static targets = [
        "search",
        "pageInput",
        "sortInput",
        "limitInput",
        "colsInput",
        "densityInput",
        "wrap",
        "settingsPanel",
        "settingsBackdrop",
        "settingsButton",
        "columnCheckbox",
        "densityButton"
    ]

    static values = {
        viewId: String,
        entityId: String,
        accountNumber: String
    }

    // Debounce timeout reference
    searchTimeout = null

    connect() {
        console.log(`[Datatable] Connected: viewId=${this.viewIdValue}`)

        // Bind ESC key to close settings
        this.handleEscBound = this.handleEsc.bind(this)
        document.addEventListener('keydown', this.handleEscBound)

        // Bind click outside
        this.handleClickOutsideBound = this.handleClickOutside.bind(this)
        document.addEventListener('click', this.handleClickOutsideBound)
    }

    disconnect() {
        document.removeEventListener('keydown', this.handleEscBound)
        document.removeEventListener('click', this.handleClickOutsideBound)

        if (this.searchTimeout) {
            clearTimeout(this.searchTimeout)
        }
    }

    // ========================
    // SEARCH WITH DEBOUNCE
    // ========================

    // Reset page to 1 when search input changes
    resetPage() {
        if (this.hasPageInputTarget) {
            this.pageInputTarget.value = '1'
        }
    }

    // Debounced search - triggered on input
    handleSearch(event) {
        // Clear previous timeout
        if (this.searchTimeout) {
            clearTimeout(this.searchTimeout)
        }

        // Reset page to 1
        this.resetPage()

        // Debounce 300ms before HTMX triggers
        this.searchTimeout = setTimeout(() => {
            // HTMX will handle the actual request via hx-trigger
            // This just ensures page reset happens first
        }, 300)
    }

    // ========================
    // SETTINGS PANEL
    // ========================

    // Toggle settings panel (open/close)
    toggleSettings(event) {
        event?.preventDefault()
        event?.stopPropagation()

        if (!this.hasSettingsPanelTarget) return

        const panel = this.settingsPanelTarget
        const currentState = panel.dataset.datatableSettingsValue

        if (currentState === 'closed' || !currentState) {
            this.openSettings()
        } else {
            this.closeSettings()
        }
    }

    // Open settings panel
    openSettings() {
        if (!this.hasSettingsPanelTarget) return

        const panel = this.settingsPanelTarget
        const backdrop = this.hasSettingsBackdropTarget ? this.settingsBackdropTarget : null

        // Show backdrop
        if (backdrop) {
            backdrop.classList.remove('hidden')
        }

        // Show and animate panel
        panel.classList.remove('hidden')
        requestAnimationFrame(() => {
            panel.classList.remove('translate-x-full')
            panel.classList.add('translate-x-0')
        })

        panel.dataset.datatableSettingsValue = 'open'

        // Add active state to button
        if (this.hasSettingsButtonTarget) {
            this.settingsButtonTarget.classList.add('ring-2', 'ring-primary')
        }
    }

    // Close settings panel
    closeSettings(event) {
        event?.preventDefault()
        event?.stopPropagation()

        if (!this.hasSettingsPanelTarget) return

        const panel = this.settingsPanelTarget
        const backdrop = this.hasSettingsBackdropTarget ? this.settingsBackdropTarget : null

        // Hide backdrop
        if (backdrop) {
            backdrop.classList.add('hidden')
        }

        // Animate panel out
        panel.classList.remove('translate-x-0')
        panel.classList.add('translate-x-full')

        // After animation, mark as closed
        setTimeout(() => {
            panel.classList.add('hidden')
            panel.dataset.datatableSettingsValue = 'closed'
        }, 300)

        // Remove active state from button
        if (this.hasSettingsButtonTarget) {
            this.settingsButtonTarget.classList.remove('ring-2', 'ring-primary')
        }
    }

    // Handle ESC key
    handleEsc(event) {
        if (event.key === 'Escape') {
            if (this.hasSettingsPanelTarget) {
                const panel = this.settingsPanelTarget
                if (panel.dataset.datatableSettingsValue === 'open') {
                    this.closeSettings()
                }
            }
        }
    }

    // Handle click outside settings panel
    handleClickOutside(event) {
        if (!this.hasSettingsPanelTarget) return

        const panel = this.settingsPanelTarget
        if (panel.dataset.datatableSettingsValue !== 'open') return

        // Check if click is outside panel and not on settings button
        const isOutsidePanel = !panel.contains(event.target)
        const isNotSettingsButton = !this.hasSettingsButtonTarget ||
            !this.settingsButtonTarget.contains(event.target)

        if (isOutsidePanel && isNotSettingsButton) {
            this.closeSettings()
        }
    }

    // ========================
    // SORTING
    // ========================

    // Update sort hidden input when header is clicked
    handleSort(event) {
        const sortValue = event.params?.sort || event.currentTarget.dataset.sortValue
        if (sortValue && this.hasSortInputTarget) {
            this.sortInputTarget.value = sortValue
            // Reset to page 1
            this.resetPage()
        }
    }

    // ========================
    // PAGINATION
    // ========================

    // Update page hidden input when pagination is clicked
    handlePageChange(event) {
        const page = event.params?.page || event.currentTarget.dataset.page
        if (page && this.hasPageInputTarget) {
            this.pageInputTarget.value = page
        }
    }

    // Update limit hidden input when page size changes
    handleLimitChange(event) {
        const limit = event.currentTarget.value || event.params?.limit
        if (limit && this.hasLimitInputTarget) {
            this.limitInputTarget.value = limit
            // Reset to page 1 when changing limit
            this.resetPage()
            // Save preferences
            this.savePreferences()
        }
    }

    // ========================
    // COLUMN VISIBILITY
    // ========================

    // Toggle column visibility
    toggleColumn(event) {
        const columnId = event.params?.columnId || event.currentTarget.dataset.columnId
        const checkbox = event.currentTarget

        // Update hidden input with current column state
        if (this.hasColsInputTarget) {
            try {
                const cols = JSON.parse(this.colsInputTarget.value || '[]')
                const idx = cols.indexOf(columnId)

                if (checkbox.checked && idx === -1) {
                    cols.push(columnId)
                } else if (!checkbox.checked && idx !== -1) {
                    cols.splice(idx, 1)
                }

                this.colsInputTarget.value = JSON.stringify(cols)
            } catch (e) {
                console.error('[Datatable] Error parsing columns:', e)
            }
        }

        // Save preferences
        this.savePreferences()
    }

    // ========================
    // DENSITY
    // ========================

    // Set density
    setDensity(event) {
        const density = event.params?.density || event.currentTarget.dataset.density

        if (this.hasDensityInputTarget) {
            this.densityInputTarget.value = density
        }

        // Update button states
        if (this.hasDensityButtonTarget) {
            this.densityButtonTargets.forEach(btn => {
                const btnDensity = btn.dataset.density
                if (btnDensity === density) {
                    btn.classList.add('border-primary', 'bg-primary/10', 'text-primary')
                    btn.classList.remove('border-gray-200', 'dark:border-gray-800')
                } else {
                    btn.classList.remove('border-primary', 'bg-primary/10', 'text-primary')
                    btn.classList.add('border-gray-200', 'dark:border-gray-800')
                }
            })
        }

        // Apply density to table rows
        this.applyDensity(density)

        // Save preferences
        this.savePreferences()
    }

    // Apply density styling to table
    applyDensity(density) {
        const table = this.element.querySelector('table')
        if (!table) return

        const cells = table.querySelectorAll('td, th')
        const paddingMap = {
            compact: { py: '0.25rem', px: '0.5rem' },
            normal: { py: '0.5rem', px: '0.75rem' },
            comfortable: { py: '0.75rem', px: '1rem' }
        }

        const padding = paddingMap[density] || paddingMap.normal

        cells.forEach(cell => {
            cell.style.paddingTop = padding.py
            cell.style.paddingBottom = padding.py
            cell.style.paddingLeft = padding.px
            cell.style.paddingRight = padding.px
        })
    }

    // ========================
    // PREFERENCES PERSISTENCE
    // ========================

    // Get visible columns
    getVisibleColumns() {
        if (!this.hasColsInputTarget) return []
        try {
            return JSON.parse(this.colsInputTarget.value || '[]')
        } catch (e) {
            return []
        }
    }

    // Get current sort
    getCurrentSort() {
        if (!this.hasSortInputTarget) return { field: 'createdAt', direction: 'desc' }
        const [field, direction] = (this.sortInputTarget.value || 'createdAt:desc').split(':')
        return { field, direction }
    }

    // Get current density
    getCurrentDensity() {
        if (!this.hasDensityInputTarget) return 'normal'
        return this.densityInputTarget.value || 'normal'
    }

    // Get current page size
    getCurrentPageSize() {
        if (!this.hasLimitInputTarget) return 10
        return parseInt(this.limitInputTarget.value || '10')
    }

    // Save preferences to server
    async savePreferences() {
        if (!this.accountNumberValue || !this.viewIdValue) {
            console.warn('[Datatable] Cannot save preferences: missing accountNumber or viewId')
            return
        }

        const prefs = {
            viewId: this.viewIdValue,
            preferences: {
                columns: this.getVisibleColumns().map(id => ({ id, visible: true })),
                sort: this.getCurrentSort(),
                density: this.getCurrentDensity(),
                pageSize: this.getCurrentPageSize()
            }
        }

        try {
            await fetch(`/account/${this.accountNumberValue}/api/user/view-preferences`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include',
                body: JSON.stringify(prefs)
            })
            console.log('[Datatable] Preferences saved')
        } catch (e) {
            console.error('[Datatable] Error saving preferences:', e)
        }
    }
}
