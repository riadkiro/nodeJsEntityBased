import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

export default defineConfig({
    plugins: [react()],
    build: {
        outDir: 'public/dist',
        emptyOutDir: true,
        rollupOptions: {
            input: {
                recordsGrid: path.resolve(__dirname, 'src/islands/records-grid/entry.jsx'),
                kanbanBoard: path.resolve(__dirname, 'src/islands/kanban-board/entry.jsx'),
                documentEditor: path.resolve(__dirname, 'src/islands/document-editor/entry.jsx'),
                chatPanel: path.resolve(__dirname, 'src/islands/chat-panel/entry.jsx'),
                dataGrid: path.resolve(__dirname, 'src/islands/data-grid/entry.jsx'),
                iconPicker: path.resolve(__dirname, 'src/islands/icon-picker/entry.jsx'),
                tasksHub: path.resolve(__dirname, 'src/islands/tasks-hub/entry.jsx'),
                timelineWidget: path.resolve(__dirname, 'src/islands/timeline-widget/entry.jsx'),
                widgetLibrary: path.resolve(__dirname, 'src/islands/widget-library/entry.jsx'),
                calendarWidget: path.resolve(__dirname, 'src/islands/calendar-widget/entry.jsx'),
                aiAssistant: path.resolve(__dirname, 'src/islands/ai-assistant/entry.jsx'),
                multiSelect: path.resolve(__dirname, 'src/islands/multi-select/entry.jsx'),
                cardBuilder: path.resolve(__dirname, 'src/islands/card-builder/entry.jsx'),
                cardRendererWidget: path.resolve(__dirname, 'src/islands/card-renderer-widget/entry.jsx'),
                dynamicTable: path.resolve(__dirname, 'src/islands/dynamic-table/entry.jsx'),
                // Future islands:
                // pageBuilder: path.resolve(__dirname, 'src/islands/page-builder/entry.jsx'),
            },
            output: {
                entryFileNames: '[name].js',
                chunkFileNames: 'chunks/[name]-[hash].js',
                assetFileNames: 'assets/[name]-[hash][extname]'
            }
        }
    },
    resolve: {
        alias: {
            '@': path.resolve(__dirname, 'src')
        }
    }
})
