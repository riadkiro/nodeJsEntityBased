import { Controller } from "@hotwired/stimulus"
import Sortable from 'sortablejs'

export default class extends Controller {
    static targets = ["list", "checkbox", "saveButton"]

    static values = {
        viewId: String,
        entityId: String
    }

    connect() {
        console.log(`[Columns] Connected: viewId=${this.viewIdValue}`)
        this.initSortable()
        this.columnsState = this.getCurrentState()
    }

    // Initialize SortableJS for drag & drop
    initSortable() {
        if (!this.hasListTarget) return

        this.sortable = Sortable.create(this.listTarget, {
            animation: 150,
            handle: 'label', // Entire label is draggable
            ghostClass: 'opacity-50',
            dragClass: 'shadow-lg',
            onEnd: () => {
                this.handleReorder()
            }
        })
    }

    // Get current state of columns
    getCurrentState() {
        const columns = []
        const labels = this.listTarget.querySelectorAll('[data-column-id]')

        labels.forEach((label, index) => {
            const checkbox = label.querySelector('input[type="checkbox"]')
            columns.push({
                id: label.dataset.columnId,
                visible: checkbox.checked,
                order: index
            })
        })

        return columns
    }

    // Toggle column visibility
    toggleColumn(event) {
        const checkbox = event.currentTarget
        const index = checkbox.dataset.columnIndex

        console.log(`[Columns] Toggle column ${index}: ${checkbox.checked}`)

        // Update state
        this.columnsState = this.getCurrentState()

        // Enable save button
        this.enableSaveButton()
    }

    // Handle reorder after drag & drop
    handleReorder() {
        console.log('[Columns] Reordered')

        // Update state
        this.columnsState = this.getCurrentState()

        // Enable save button
        this.enableSaveButton()
    }

    // Change row density
    changeDensity(event) {
        const density = event.currentTarget.value
        console.log(`[Columns] Change density: ${density}`)

        this.density = density
        this.enableSaveButton()
    }

    // Change sort field
    changeSort(event) {
        const sortField = event.currentTarget.value
        console.log(`[Columns] Change sort field: ${sortField}`)

        this.sortField = sortField
        this.enableSaveButton()
    }

    // Set sort direction
    setSortDirection(event) {
        const direction = event.currentTarget.dataset.direction
        console.log(`[Columns] Change sort direction: ${direction}`)

        this.sortDirection = direction
        this.enableSaveButton()

        // Update button styles
        event.currentTarget.parentElement.querySelectorAll('button').forEach(btn => {
            btn.classList.remove('bg-primary', 'text-white', 'border-primary')
            btn.classList.add('border-gray-300', 'dark:border-gray-600', 'text-gray-700', 'dark:text-gray-300')
        })
        event.currentTarget.classList.add('bg-primary', 'text-white', 'border-primary')
        event.currentTarget.classList.remove('border-gray-300', 'dark:border-gray-600', 'text-gray-700', 'dark:text-gray-300')
    }

    // Enable save button
    enableSaveButton() {
        if (this.hasSaveButtonTarget) {
            this.saveButtonTarget.disabled = false
            this.saveButtonTarget.classList.remove('opacity-50', 'cursor-not-allowed')
        }
    }

    // Save preferences to backend
    async savePreferences(event) {
        event.preventDefault()

        const accountNumber = window.location.pathname.split('/')[2] // Extract from URL
        const url = `/account/${accountNumber}/entity/${this.entityIdValue}/views/${this.viewIdValue}/preferences`

        // Get current sort from UI
        const sortSelect = this.element.querySelector('select[data-action*="changeSort"]')
        const sortField = this.sortField || sortSelect?.value || 'createdAt'
        const sortDirection = this.sortDirection || 'desc'

        // Get density from radio buttons
        const densityRadio = this.element.querySelector('input[name^="density-"]:checked')
        const density = this.density || densityRadio?.value || 'normal'

        const preferences = {
            columns: this.columnsState,
            sort: {
                field: sortField,
                direction: sortDirection
            },
            density: density,
            pageSize: parseInt(document.querySelector('[data-datatable-target="limitInput"]')?.value || 10)
        }

        console.log('[Columns] Saving preferences:', preferences)

        try {
            const response = await fetch(url, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(preferences)
            })

            if (response.ok) {
                console.log('[Columns] Preferences saved successfully')

                // Show success feedback
                this.showSaveSuccess()

                // Trigger HTMX refresh to apply preferences
                setTimeout(() => {
                    const searchInput = document.querySelector('[data-datatable-target="search"]')
                    if (searchInput) {
                        searchInput.dispatchEvent(new Event('search'))
                    }
                }, 500)
            } else {
                console.error('[Columns] Failed to save preferences:', response.statusText)
            }
        } catch (error) {
            console.error('[Columns] Error saving preferences:', error)
        }
    }

    // Show save success feedback
    showSaveSuccess() {
        if (!this.hasSaveButtonTarget) return

        const originalText = this.saveButtonTarget.textContent
        this.saveButtonTarget.textContent = '✓ Enregistré'
        this.saveButtonTarget.classList.add('bg-green-600')
        this.saveButtonTarget.classList.remove('bg-primary')

        setTimeout(() => {
            this.saveButtonTarget.textContent = originalText
            this.saveButtonTarget.classList.remove('bg-green-600')
            this.saveButtonTarget.classList.add('bg-primary')
            this.saveButtonTarget.disabled = true
            this.saveButtonTarget.classList.add('opacity-50', 'cursor-not-allowed')
        }, 2000)
    }

    // Reset preferences to default
    async resetPreferences(event) {
        event.preventDefault()

        if (!confirm('Voulez-vous vraiment réinitialiser les préférences par défaut ?')) {
            return
        }

        const accountNumber = window.location.pathname.split('/')[2]
        const url = `/account/${accountNumber}/entity/${this.entityIdValue}/views/${this.viewIdValue}/preferences/reset`

        try {
            const response = await fetch(url, {
                method: 'POST'
            })

            if (response.ok) {
                console.log('[Columns] Preferences reset successfully')

                // Reload the page to apply default preferences
                window.location.reload()
            }
        } catch (error) {
            console.error('[Columns] Error resetting preferences:', error)
        }
    }
}
