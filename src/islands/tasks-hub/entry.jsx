/**
 * TasksHub — Multi-View Tasks Manager (React Island)
 * 
 * A unified tasks dashboard that supports multiple view modes:
 * - Table: Classic DataGrid view with sorting, columns, pagination
 * - Kanban: Drag-and-drop board grouped by status
 * - Checklist: Interactive checklist with strikethrough on completion
 * - Calendar: Monthly calendar view showing tasks by due date
 * - Timeline: Horizontal timeline (Gantt-like) visualization
 * 
 * All views share the same data — switching is instant, no page reload.
 * Data is fetched once from /api/datagrid/tasks and passed to each view.
 */
import React from 'react'
import { createRoot } from 'react-dom/client'
import TasksHub from './TasksHub'

/**
 * Mount the TasksHub island on all elements with data-island="tasks-hub"
 * Reads configuration from data-* attributes on the container element.
 */
function mountIslands() {
    document.querySelectorAll('[data-island="tasks-hub"]').forEach(container => {
        // Prevent double-mount
        if (container.dataset.mounted === '1') return
        container.dataset.mounted = '1'

        const props = {
            accountNumber: container.dataset.accountNumber,
            dataUrl: container.dataset.dataUrl,
            title: container.dataset.title || 'Tâches',
            icon: container.dataset.icon || 'solar:checklist-minimalistic-bold-duotone',
            addUrl: container.dataset.addUrl || null,
            addLabel: container.dataset.addLabel || 'Nouvelle tâche',
            initialView: container.dataset.initialView || 'table',
            entitySlug: container.dataset.entitySlug || 'taches',
        }

        console.log('[TasksHub Island] Mounting:', props)

        createRoot(container).render(
            <React.StrictMode>
                <TasksHub {...props} />
            </React.StrictMode>
        )
    })
}

// Mount when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', mountIslands)
} else {
    mountIslands()
}

// Watch for dynamically added islands (HTMX swaps)
const observer = new MutationObserver(mountIslands)
observer.observe(document.body, { childList: true, subtree: true })
