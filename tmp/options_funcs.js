=== getVisibleColumnsForLine ===
getVisibleColumnsForLine(line).filter(c => c.type !== 'relation')" :key="col.key">
                                        <td style="padding:2px 6px;">
                                            <!-- Text -->
                                            <template x-if="col.type === 'text'">
                                                <input type="text" class="lp-input"
                                                    style="height:24px;padding:1px 4px;background:transparent;border:1px solid transparent;font-size:13px;line-height:22px;outline:none;box-shadow:none;border-radius:4px;width:100%;"
                                                    :value="line.values[col.key] || ''"
                                                    @input="line.values[col.key] = $event.target.value; debouncedSave()"
                                                    :placeholder="col.label" />
                                            </template>

                                            <!-- Textarea -->
                                            <template x-if="col.type === 'textarea'">
                                                <input type="text" class="lp-input"
                                                    style="height:24px;padding:1px 4px;background:transparent;border:1px solid transparent;font-size:13px;line-height:22px;outline:none;box-shadow:none;border-radius:4px;width:100%;"
                                                    :value="line.values[col.key] || ''"
                                                    @input="line.values[col.key] = $event.target.value; debouncedSave()"
                                                    :placeholder="col.label" />
                                            </template>

                                            <!-- Number -->
                                            <template x-if="col.type === 'number'">
                                                <input type="number" class="lp-input text-right"
                                                    style="height:24px;padding:1px 4px;background:transparent;border:1px solid transparent;font-size:13px;line-height:22px;outline:none;box-shadow:none;border-radius:4px;width:100%;text-align:right;"
                                                    :value="line.values[col.key] || ''"
                                                    @input="line.values[col.key] = parseFloat($event.target.value) || 0; recomputeLine(line); debouncedSave()"
                                                    step="any" />
                                            </template>

                                            <!-- Money -->
                                            <template x-if="col.type === 'money'">
                                                <input type="number" class="lp-input text-right"
                                                    style="height:24px;padding:1px 4px;background:transparent;border:1px solid transparent;font-size:13px;line-height:22px;outline:none;box-shadow:none;border-radius:4px;width:100%;text-align:right;"
                                                    :value="line.values[col.key] || ''"
                                                    @input="line.values[col.key] = parseFloat($event.target.value) || 0; recomputeLine(line); debouncedSave()"
                                                    step="0.01" />
                                            </template>

                                            <!-- Date -->
                                            <template x-if="col.type === 'date'">
                                                <input type="date" class="lp-input"
                                                    style="height:24px;padding:1px 4px;background:transparent;border:1px solid transparent;font-size:13px;line-height:22px;outline:none;box-shadow:none;border-radius:4px;width:100%;"
                                                    :value="line.values[col.key] || ''"
                                                    @input="line.values[col.key] = $event.target.value; debouncedSave()" />
                                            </template>

                                            <!-- Select (tp-style dropdown matching multiselect) -->
                                            <template x-if="col.type === 'select'">
                                                <div class="tp-wrapper" style="position:relative;">
                                                    <!-- Selected value display (trigger) -->
                                                    <div class="lp-ms-trigger"
                                                         style="min-height:22px;padding:1px 4px;gap:2px;"
                                                         @click.stop="activeSchemaId = schema._id; openSelectDropdown(lineIdx, col.key, $event)">
                                                        <template x-if="!line.values[col.key]">
                                                            <span class="lp-ms-placeholder">Sélectionner...</span>
                                                        </template>
                                                        <template x-if="line.values[col.key]">
                                                            <span class="tp-tag"
                                                                  style="background:#dbeafe; color:#2563eb;"
                                                                  x-text="(col.config?.options || []).find(o => o.value === line.values[col.key])?.label || line.values[col.key]">
                                                            </span>
                                                        </template>
                                                    </div>
                                                    <!-- Dropdown (tp-style) -->
                                                    <template x-if="selDropdown.lineIdx === lineIdx && selDropdown.colKey === col.key && selDropdown.open">
                                                        <div>
                                                            <div style="position: fixed; inset: 0; z-index: 9998;"
                                                                 @click.stop="closeSelectDropdown()"></div>
                                                            <div class="tp-dropdown" style="z-index:9999;" @click.stop>
                                                                <div class="tp-search-wrap">
                                                                    <input type="text" class="tp-search-input"
                                                                           placeholder="Rechercher ou créer..."
                                                                           :value="selDropdown.query"
                                                                           @input="selDropdown.query = $event.target.value"
                                                                           @keydown.enter.prevent="selCreateOption(col)" />
                                                                </div>
                                                                <div class="tp-divider"></div>
                                                                <div class="tp-options">
                                                                    <template x-for="opt in filterSelOptions(col)" :key="opt.value">
                                                                        <div class="tp-option" style="display:flex; align-items:center; justify-content:space-between;"
                                                                             @click.stop="selectSingleValue(line, col.key, opt.value)">
                                                                            <div style="display:flex; align-items:center; gap:8px; flex:1; min-width:0;">
                                                                                <div class="tp-option-icon"
                                                                                     :style="line.values[col.key] === opt.value
                                                                                         ? 'background: #dcfce7; border: 2px solid #00ab55'
                                                                                         : 'background: #fff; border: 2px solid #d1d5db'">
                                                                                    <iconify-icon x-show="line.values[col.key] === opt.value"
                                                                                                  icon="tabler:check" width="12"
                                                                                                  style="color: #00ab55;"></iconify-icon>
                                                                                </div>
                                                                                <span class="tp-option-label" x-text="opt.label"></span>
                                                                            </div>
                                                                            <button type="button" class="tp-option-delete"
                                                                                :class="_pendingDeleteOpt === opt.value ? 'tp-option-delete--confirm' : ''"
                                                                                @click.stop.prevent="removeInlineOption(schema, col, opt.value)"
                                                                                :title="_pendingDeleteOpt === opt.value ? 'Cliquer pour confirmer' : 'Supprimer cette option'">
                                                                                <iconify-icon :icon="_pendingDeleteOpt === opt.value ? 'tabler:check' : 'tabler:trash'" width="12" style="pointer-events:none;"></iconify-icon>
                                                                            </button>
                                                                        </div>
                                                                    </template>
                                                                    <template x-if="filterSelOptions(col).length === 0 && !(selDropdown.query || '').trim()">
                                                                        <div style="padding:12px; text-align:center; color:#9ca3af; font-size:12px;">Aucune option</div>
                                                                    </template>
                                                                </div>
                                                                <!-- + Créer -->
                                                                <template x-if="(selDropdown.query || '').trim() && !(col.config?.options || []).some(o => o.label.toLowerCase() === (selDropdown.query || '').trim().toLowerCase())">
                                                                    <div class="tp-create-option" @click.stop="selCreateOption(schema, col)">
                                                                        <iconify-icon icon="tabler:plus" width="14" style="color:#6b7280;"></iconify-icon>
                                                                        <span class="tp-create-label">Créer</span>
                                                                        <span class="tp-create-tag" x-text="selDropdown.query"></span>
                                                                    </div>
                                                                </template>
                                                            </div>
                                                        </div>
                                                    </template>
                                                </div>
                                            </template>

                                            <!-- Multiselect (tp-style inline tag-picker dropdown) -->
                                            <template x-if="col.type === 'multiselect'">
                                                <div class="tp-wrapper" style="position:relative;">
                                                    <!-- Selected tags display (trigger) -->
                                                    <div class="lp-ms-trigger"
                                                         style="min-height:22px;padding:1px 4px;gap:2px;"
                                                         @click.stop="activeSchemaId = schema._id; openMultiselectDropdown(lineIdx, col.key, $event)">
                                                        <template x-if="(line.values[col.key] || []).length === 0">
                                                            <span class="lp-ms-placeholder">Sélectionner...</span>
                                                        </template>
                                                        <template x-for="selVal in (line.values[col.key] || [])" :key="selVal">
                                                            <span class="tp-tag"
                                                                  :style="'background:' + getMultiselectOptStyle(col, selVal).bg + '; color:' + getMultiselectOptStyle(col, selVal).text"
                                                                  x-text="getMultiselectOptLabel(col, selVal)">
                                                            </span>
                                                        </template>
                                                    </div>
                                                    <!-- Dropdown (tp-style) -->
                                                    <template x-if="msDropdown.lineIdx === lineIdx && msDropdown.colKey === col.key && msDropdown.open">
                                                        <div>
                                                            <div style="position: fixed; inset: 0; z-index: 9998;"
                                                                 @click.stop="closeMultiselectDropdown()"></div>
                                                            <div class="tp-dropdown" style="z-index:9999;" @click.stop>
                                                                <div class="tp-search-wrap">
                                                                    <input type="text" class="tp-search-input"
                                                                           placeholder="Rechercher ou créer..."
                                                                           :value="msDropdown.query"
                                                                           @input="msDropdown.query = $event.target.value"
                                                                           @keydown.enter.prevent="msCreateOption(schemas.find(s => s._id === activeSchemaId), col)" />
                                                                </div>
                                                                <div class="tp-divider"></div>
                                                                <div class="tp-options">
                                                                    <template x-for="opt in filterMsOptions(col)" :key="opt.value">
                                                                        <div class="tp-option" style="display:flex; align-items:center; justify-content:space-between;"
                                                                             @click.stop="toggleMultiselectValue(line, col.key, opt.value)">
                                                                            <div style="display:flex; align-items:center; gap:8px; flex:1; min-width:0;">
                                                                                <div class="tp-option-icon"
                                                                                     :style="isOptSelected(line.values[col.key], opt.value)
                                                                                         ? 'background:' + getMultiselectOptStyle(col, opt.value).bg + '; border: 2px solid ' + getMultiselectOptStyle(col, opt.value).bg
                                                                                         : 'background: #fff; border: 2px solid #d1d5db'">
                                                                                    <template x-if="isOptSelected(line.values[col.key], opt.value)"><iconify-icon
                                                                                                  icon="tabler:check" width="12"
                                                                                                  :style="'color:' + getMultiselectOptStyle(col, opt.value).text"></iconify-icon></template>
                                                                                </div>
                                                                                <span class="tp-option-label" x-text="opt.label"></span>
                                                                            </div>
                                                                            <button type="button" class="tp-option-delete"
                                                                                :class="_pendingDeleteOpt === opt.value ? 'tp-option-delete--confirm' : ''"
                                                                                @click.stop.prevent="removeInlineOption(schema, col, opt.value)"
                                                                                :title="_pendingDeleteOpt === opt.value ? 'Cliquer pour confirmer' : 'Supprimer cette option'">
                                                                                <iconify-icon :icon="_pendingDeleteOpt === opt.value ? 'tabler:check' : 'tabler:trash'" width="12" style="pointer-events:none;"></iconify-icon>
                                                                            </button>
                                                                        </div>
                                                                    </template>
                                                                    <template x-if="filterMsOptions(col).length === 0 && !(msDropdown.query || '').trim()">
                                                                        <div style="padding:12px; text-align:center; color:#9ca3af; font-size:12px;">Aucune option</div>
                                                                    </template>
                                                                </div>
                                                                <!-- + Créer -->
                                                                <template x-if="(msDropdown.query || '').trim() && !(col.config?.options || []).some(o => o.label.toLowerCase() === (msDropdown.query || '').trim().toLowerCase())">
                                                                    <div class="tp-create-option" @click.stop="msCreateOption(col)">
                                                                        <iconify-icon icon="tabler:plus" width="14" style="color:#6b7280;"></iconify-icon>
                                                                        <span class="tp-create-label">Créer</span>
                                                                        <span class="tp-create-tag" x-text="msDropdown.query"></span>
                                                                    </div>
                                                                </template>
                                                            </div>
                                                        </div>
                                                    </template>
                                                </div>
                                            </template>

                                            <!-- Duration -->
                                            <template x-if="col.type === 'duration'">
                                                <div class="flex gap-1 items-center">
                                                    <input type="number" class="lp-input text-right !w-14"
                                                        :value="line.values[col.key]?.value || ''"
                                                        @input="if(!line.values[col.key]) line.values[col.key] = {}

=== filterMsOptions ===
filterMsOptions(col)" :key="opt.value">
                                                                        <div class="tp-option" style="display:flex; align-items:center; justify-content:space-between;"
                                                                             @click.stop="toggleMultiselectValue(line, col.key, opt.value)">
                                                                            <div style="display:flex; align-items:center; gap:8px; flex:1; min-width:0;">
                                                                                <div class="tp-option-icon"
                                                                                     :style="isOptSelected(line.values[col.key], opt.value)
                                                                                         ? 'background:' + getMultiselectOptStyle(col, opt.value).bg + '; border: 2px solid ' + getMultiselectOptStyle(col, opt.value).bg
                                                                                         : 'background: #fff; border: 2px solid #d1d5db'">
                                                                                    <template x-if="isOptSelected(line.values[col.key], opt.value)"><iconify-icon
                                                                                                  icon="tabler:check" width="12"
                                                                                                  :style="'color:' + getMultiselectOptStyle(col, opt.value).text"></iconify-icon></template>
                                                                                </div>
                                                                                <span class="tp-option-label" x-text="opt.label"></span>
                                                                            </div>
                                                                            <button type="button" class="tp-option-delete"
                                                                                :class="_pendingDeleteOpt === opt.value ? 'tp-option-delete--confirm' : ''"
                                                                                @click.stop.prevent="removeInlineOption(schema, col, opt.value)"
                                                                                :title="_pendingDeleteOpt === opt.value ? 'Cliquer pour confirmer' : 'Supprimer cette option'">
                                                                                <iconify-icon :icon="_pendingDeleteOpt === opt.value ? 'tabler:check' : 'tabler:trash'" width="12" style="pointer-events:none;"></iconify-icon>
                                                                            </button>
                                                                        </div>
                                                                    </template>
                                                                    <template x-if="filterMsOptions(col).length === 0 && !(msDropdown.query || '').trim()">
                                                                        <div style="padding:12px; text-align:center; color:#9ca3af; font-size:12px;">Aucune option</div>
                                                                    </template>
                                                                </div>
                                                                <!-- + Créer -->
                                                                <template x-if="(msDropdown.query || '').trim() && !(col.config?.options || []).some(o => o.label.toLowerCase() === (msDropdown.query || '').trim().toLowerCase())">
                                                                    <div class="tp-create-option" @click.stop="msCreateOption(col)">
                                                                        <iconify-icon icon="tabler:plus" width="14" style="color:#6b7280;"></iconify-icon>
                                                                        <span class="tp-create-label">Créer</span>
                                                                        <span class="tp-create-tag" x-text="msDropdown.query"></span>
                                                                    </div>
                                                                </template>
                                                            </div>
                                                        </div>
                                                    </template>
                                                </div>
                                            </template>

                                            <!-- Duration -->
                                            <template x-if="col.type === 'duration'">
                                                <div class="flex gap-1 items-center">
                                                    <input type="number" class="lp-input text-right !w-14"
                                                        :value="line.values[col.key]?.value || ''"
                                                        @input="if(!line.values[col.key]) line.values[col.key] = {}

=== filterSelOptions ===
filterSelOptions(col)" :key="opt.value">
                                                                        <div class="tp-option" style="display:flex; align-items:center; justify-content:space-between;"
                                                                             @click.stop="selectSingleValue(line, col.key, opt.value)">
                                                                            <div style="display:flex; align-items:center; gap:8px; flex:1; min-width:0;">
                                                                                <div class="tp-option-icon"
                                                                                     :style="line.values[col.key] === opt.value
                                                                                         ? 'background: #dcfce7; border: 2px solid #00ab55'
                                                                                         : 'background: #fff; border: 2px solid #d1d5db'">
                                                                                    <iconify-icon x-show="line.values[col.key] === opt.value"
                                                                                                  icon="tabler:check" width="12"
                                                                                                  style="color: #00ab55;"></iconify-icon>
                                                                                </div>
                                                                                <span class="tp-option-label" x-text="opt.label"></span>
                                                                            </div>
                                                                            <button type="button" class="tp-option-delete"
                                                                                :class="_pendingDeleteOpt === opt.value ? 'tp-option-delete--confirm' : ''"
                                                                                @click.stop.prevent="removeInlineOption(schema, col, opt.value)"
                                                                                :title="_pendingDeleteOpt === opt.value ? 'Cliquer pour confirmer' : 'Supprimer cette option'">
                                                                                <iconify-icon :icon="_pendingDeleteOpt === opt.value ? 'tabler:check' : 'tabler:trash'" width="12" style="pointer-events:none;"></iconify-icon>
                                                                            </button>
                                                                        </div>
                                                                    </template>
                                                                    <template x-if="filterSelOptions(col).length === 0 && !(selDropdown.query || '').trim()">
                                                                        <div style="padding:12px; text-align:center; color:#9ca3af; font-size:12px;">Aucune option</div>
                                                                    </template>
                                                                </div>
                                                                <!-- + Créer -->
                                                                <template x-if="(selDropdown.query || '').trim() && !(col.config?.options || []).some(o => o.label.toLowerCase() === (selDropdown.query || '').trim().toLowerCase())">
                                                                    <div class="tp-create-option" @click.stop="selCreateOption(schema, col)">
                                                                        <iconify-icon icon="tabler:plus" width="14" style="color:#6b7280;"></iconify-icon>
                                                                        <span class="tp-create-label">Créer</span>
                                                                        <span class="tp-create-tag" x-text="selDropdown.query"></span>
                                                                    </div>
                                                                </template>
                                                            </div>
                                                        </div>
                                                    </template>
                                                </div>
                                            </template>

                                            <!-- Multiselect (tp-style inline tag-picker dropdown) -->
                                            <template x-if="col.type === 'multiselect'">
                                                <div class="tp-wrapper" style="position:relative;">
                                                    <!-- Selected tags display (trigger) -->
                                                    <div class="lp-ms-trigger"
                                                         style="min-height:22px;padding:1px 4px;gap:2px;"
                                                         @click.stop="activeSchemaId = schema._id; openMultiselectDropdown(lineIdx, col.key, $event)">
                                                        <template x-if="(line.values[col.key] || []).length === 0">
                                                            <span class="lp-ms-placeholder">Sélectionner...</span>
                                                        </template>
                                                        <template x-for="selVal in (line.values[col.key] || [])" :key="selVal">
                                                            <span class="tp-tag"
                                                                  :style="'background:' + getMultiselectOptStyle(col, selVal).bg + '; color:' + getMultiselectOptStyle(col, selVal).text"
                                                                  x-text="getMultiselectOptLabel(col, selVal)">
                                                            </span>
                                                        </template>
                                                    </div>
                                                    <!-- Dropdown (tp-style) -->
                                                    <template x-if="msDropdown.lineIdx === lineIdx && msDropdown.colKey === col.key && msDropdown.open">
                                                        <div>
                                                            <div style="position: fixed; inset: 0; z-index: 9998;"
                                                                 @click.stop="closeMultiselectDropdown()"></div>
                                                            <div class="tp-dropdown" style="z-index:9999;" @click.stop>
                                                                <div class="tp-search-wrap">
                                                                    <input type="text" class="tp-search-input"
                                                                           placeholder="Rechercher ou créer..."
                                                                           :value="msDropdown.query"
                                                                           @input="msDropdown.query = $event.target.value"
                                                                           @keydown.enter.prevent="msCreateOption(schemas.find(s => s._id === activeSchemaId), col)" />
                                                                </div>
                                                                <div class="tp-divider"></div>
                                                                <div class="tp-options">
                                                                    <template x-for="opt in filterMsOptions(col)" :key="opt.value">
                                                                        <div class="tp-option" style="display:flex; align-items:center; justify-content:space-between;"
                                                                             @click.stop="toggleMultiselectValue(line, col.key, opt.value)">
                                                                            <div style="display:flex; align-items:center; gap:8px; flex:1; min-width:0;">
                                                                                <div class="tp-option-icon"
                                                                                     :style="isOptSelected(line.values[col.key], opt.value)
                                                                                         ? 'background:' + getMultiselectOptStyle(col, opt.value).bg + '; border: 2px solid ' + getMultiselectOptStyle(col, opt.value).bg
                                                                                         : 'background: #fff; border: 2px solid #d1d5db'">
                                                                                    <template x-if="isOptSelected(line.values[col.key], opt.value)"><iconify-icon
                                                                                                  icon="tabler:check" width="12"
                                                                                                  :style="'color:' + getMultiselectOptStyle(col, opt.value).text"></iconify-icon></template>
                                                                                </div>
                                                                                <span class="tp-option-label" x-text="opt.label"></span>
                                                                            </div>
                                                                            <button type="button" class="tp-option-delete"
                                                                                :class="_pendingDeleteOpt === opt.value ? 'tp-option-delete--confirm' : ''"
                                                                                @click.stop.prevent="removeInlineOption(schema, col, opt.value)"
                                                                                :title="_pendingDeleteOpt === opt.value ? 'Cliquer pour confirmer' : 'Supprimer cette option'">
                                                                                <iconify-icon :icon="_pendingDeleteOpt === opt.value ? 'tabler:check' : 'tabler:trash'" width="12" style="pointer-events:none;"></iconify-icon>
                                                                            </button>
                                                                        </div>
                                                                    </template>
                                                                    <template x-if="filterMsOptions(col).length === 0 && !(msDropdown.query || '').trim()">
                                                                        <div style="padding:12px; text-align:center; color:#9ca3af; font-size:12px;">Aucune option</div>
                                                                    </template>
                                                                </div>
                                                                <!-- + Créer -->
                                                                <template x-if="(msDropdown.query || '').trim() && !(col.config?.options || []).some(o => o.label.toLowerCase() === (msDropdown.query || '').trim().toLowerCase())">
                                                                    <div class="tp-create-option" @click.stop="msCreateOption(col)">
                                                                        <iconify-icon icon="tabler:plus" width="14" style="color:#6b7280;"></iconify-icon>
                                                                        <span class="tp-create-label">Créer</span>
                                                                        <span class="tp-create-tag" x-text="msDropdown.query"></span>
                                                                    </div>
                                                                </template>
                                                            </div>
                                                        </div>
                                                    </template>
                                                </div>
                                            </template>

                                            <!-- Duration -->
                                            <template x-if="col.type === 'duration'">
                                                <div class="flex gap-1 items-center">
                                                    <input type="number" class="lp-input text-right !w-14"
                                                        :value="line.values[col.key]?.value || ''"
                                                        @input="if(!line.values[col.key]) line.values[col.key] = {}