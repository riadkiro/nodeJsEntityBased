const fs = require('fs');

const ejsPath = 'views/record/record-edit.ejs';
let content = fs.readFileSync(ejsPath, 'utf8');

// 1. Add viewMode to Alpine state
content = content.replace(
    `attachments: window['_initialAttachments_<%= String(record._id) %>'] || [],`,
    `attachments: window['_initialAttachments_<%= String(record._id) %>'] || [],
                                viewMode: 'inline',
                                get groupedAttachments() {
                                    const groups = {};
                                    for (const att of this.sortedAttachments) {
                                        const src = att._sourceEntity || 'Dossier';
                                        if (!groups[src]) groups[src] = [];
                                        groups[src].push(att);
                                    }
                                    return groups;
                                },`
);

// 2. Add the UI Switcher next to the Ajouter button
const oldToolbar = `<div>
                                        <label class="cursor-pointer inline-flex items-center gap-1.5 px-3 py-1.5 bg-primary/10 text-primary hover:bg-primary/20 rounded-lg text-xs font-semibold transition-colors">
                                            <iconify-icon icon="tabler:upload" width="14"></iconify-icon> Ajouter
                                            <input type="file" @change="uploadDoc" class="hidden" multiple>
                                        </label>
                                    </div>`;

const newToolbar = `<div class="flex items-center gap-3">
                                        <div class="flex items-center p-0.5 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
                                            <button type="button" @click="viewMode = 'inline'" :class="viewMode === 'inline' ? 'bg-white shadow-sm dark:bg-gray-700 text-primary' : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200'" class="flex items-center gap-1.5 px-2.5 py-1 text-[10px] font-bold uppercase rounded-md transition-all">
                                                <iconify-icon icon="solar:list-bold-duotone" width="14"></iconify-icon> Inline
                                            </button>
                                            <button type="button" @click="viewMode = 'grouped'" :class="viewMode === 'grouped' ? 'bg-white shadow-sm dark:bg-gray-700 text-primary' : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200'" class="flex items-center gap-1.5 px-2.5 py-1 text-[10px] font-bold uppercase rounded-md transition-all">
                                                <iconify-icon icon="solar:folder-with-files-bold-duotone" width="14"></iconify-icon> Par Dossier
                                            </button>
                                        </div>
                                        <label class="cursor-pointer inline-flex items-center gap-1.5 px-3 py-1.5 bg-primary/10 text-primary hover:bg-primary/20 rounded-lg text-xs font-semibold transition-colors">
                                            <iconify-icon icon="tabler:upload" width="14"></iconify-icon> Ajouter
                                            <input type="file" @change="uploadDoc" class="hidden" multiple>
                                        </label>
                                    </div>`;

content = content.replace(oldToolbar, newToolbar);

// 3. Wrap the existing table in a template x-if="viewMode === 'inline'"
const oldTableDivStart = `<div class="overflow-x-auto" x-show="attachments.length > 0">
                                    <table class="w-full text-left text-sm text-gray-600 dark:text-gray-400">`;

const newTableDivStart = `<template x-if="viewMode === 'inline'">
                                    <div class="overflow-x-auto" x-show="attachments.length > 0">
                                        <table class="w-full text-left text-sm text-gray-600 dark:text-gray-400">`;

content = content.replace(oldTableDivStart, newTableDivStart);

const oldTableDivEnd = `                                        </tbody>
                                    </table>
                                </div>
                                
                                <!-- Empty state specific to documents -->`;

const groupedViewHtml = `
                                </div>
                                </template>

                                <!-- GROUPED VIEW -->
                                <template x-if="viewMode === 'grouped' && attachments.length > 0">
                                    <div class="space-y-4 pt-2">
                                        <template x-for="(acts, sourceName) in groupedAttachments" :key="sourceName">
                                            <div class="border border-gray-100 dark:border-gray-800 rounded-xl overflow-hidden bg-white dark:bg-[#1b2e4b]">
                                                <!-- Group Header -->
                                                <div class="px-4 py-2 bg-gray-50/80 dark:bg-gray-800/50 border-b border-gray-100 dark:border-gray-800 flex items-center justify-between">
                                                    <div class="flex items-center gap-2">
                                                        <span class="w-6 h-6 rounded flex items-center justify-center bg-gray-200/50 dark:bg-gray-700 text-gray-500">
                                                            <iconify-icon icon="solar:folder-open-bold-duotone" width="14"></iconify-icon>
                                                        </span>
                                                        <span class="text-xs font-bold text-gray-700 dark:text-gray-200" x-text="sourceName"></span>
                                                    </div>
                                                    <span class="text-[10px] px-2 py-0.5 rounded-full bg-gray-200/50 dark:bg-gray-700 text-gray-500 font-bold" x-text="acts.length + ' document(s)'"></span>
                                                </div>
                                                <!-- Group Table -->
                                                <div class="overflow-x-auto">
                                                    <table class="w-full text-left text-sm text-gray-600 dark:text-gray-400">
                                                        <tbody class="divide-y divide-gray-50 dark:divide-gray-800/50">
                                                            <template x-for="att in acts" :key="att._id">
                                                                <tr class="hover:bg-gray-50 dark:hover:bg-gray-800/20 transition-colors group">
                                                                    <td class="px-4 py-2.5">
                                                                        <div class="flex items-center gap-3">
                                                                            <div class="w-7 h-7 rounded-lg flex items-center justify-center shrink-0"
                                                                                 :style="\`background: \${att.category === 'pdf' ? '#ef4444' : att.category === 'word' ? '#2563eb' : '#f59e0b'}15; color: \${att.category === 'pdf' ? '#ef4444' : att.category === 'word' ? '#2563eb' : '#f59e0b'}\`">
                                                                                <iconify-icon :icon="att.category === 'pdf' ? 'solar:file-text-bold-duotone' : att.category === 'word' ? 'solar:document-text-bold-duotone' : 'solar:gallery-bold-duotone'" width="14"></iconify-icon>
                                                                            </div>
                                                                            <div>
                                                                                <a :href="att.url" target="_blank" class="font-semibold text-gray-700 dark:text-gray-200 group-hover:text-primary transition-colors block text-xs" x-text="att.originalName"></a>
                                                                                <template x-if="att.isGenerated && att.generatedFromName">
                                                                                    <div class="flex items-center gap-1 mt-0.5 text-[9px] text-gray-400">
                                                                                        <iconify-icon icon="solar:magic-stick-3-bold-duotone" width="10" class="text-amber-500"></iconify-icon>
                                                                                        <span x-text="'Généré via : ' + att.generatedFromName"></span>
                                                                                    </div>
                                                                                </template>
                                                                            </div>
                                                                        </div>
                                                                    </td>
                                                                    <td class="px-4 py-2.5 w-24">
                                                                        <span class="px-1.5 py-0.5 text-[9px] font-bold uppercase rounded bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300" x-text="att.category && att.category !== 'other' ? att.category : 'DOC'"></span>
                                                                    </td>
                                                                    <td class="px-4 py-2.5 text-[11px] text-gray-500 w-32">
                                                                        <span x-text="att.uploadedAt ? new Date(att.uploadedAt).toLocaleDateString('fr-FR') : '-'"></span>
                                                                    </td>
                                                                    <td class="px-4 py-2.5 text-right w-20">
                                                                        <div class="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                                                            <a :href="att.url" target="_blank" class="p-1 inline-flex items-center justify-center text-gray-400 hover:text-primary bg-gray-100 hover:bg-primary/10 dark:bg-gray-800 dark:hover:bg-primary/20 rounded transition-all" title="Ouvrir">
                                                                                <iconify-icon icon="solar:eye-bold-duotone" width="14"></iconify-icon>
                                                                            </a>
                                                                            <button type="button" @click="deleteDoc(att)" class="p-1 inline-flex items-center justify-center text-gray-400 hover:text-red-500 bg-gray-100 hover:bg-red-500/10 dark:bg-gray-800 dark:hover:bg-red-500/20 rounded transition-all" title="Supprimer">
                                                                                <iconify-icon icon="solar:trash-bin-trash-bold-duotone" width="14"></iconify-icon>
                                                                            </button>
                                                                        </div>
                                                                    </td>
                                                                </tr>
                                                            </template>
                                                        </tbody>
                                                    </table>
                                                </div>
                                            </div>
                                        </template>
                                    </div>
                                </template>
`;

content = content.replace(oldTableDivEnd, oldTableDivEnd.replace('</div>', groupedViewHtml));

fs.writeFileSync(ejsPath, content, 'utf8');
console.log('UI Grouping added successfully!');
