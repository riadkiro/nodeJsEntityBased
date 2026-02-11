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
