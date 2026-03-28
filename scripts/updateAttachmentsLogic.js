const fs = require('fs');

const ejsPath = 'views/record/record-edit.ejs';
let content = fs.readFileSync(ejsPath, 'utf8');

// 1. UPDATE INITIAL ATTACHMENTS PAYLOAD
const oldScript = `<script>
                        window._initialAttachments_<%= String(record._id) %> = <%- JSON.stringify(
                            JSON.parse(JSON.stringify(_attachmentList)).map(a => ({
                                ...a, 
                                url: \`/account/\${account_number}/uploads/attachments/\${a.filename}\`
                            }))
                        ) %>;
                    </script>`;

const newScript = `<%
                        let _allDocumentsTabAttachments = [];
                        
                        // 1. Current record attachments
                        if (record.attachments && Array.isArray(record.attachments)) {
                            record.attachments.forEach(att => {
                                _allDocumentsTabAttachments.push({
                                    ...att.toObject ? att.toObject() : att,
                                    _sourceEntity: entity.name || 'Dossier',
                                    _sourceTitle: record.title || '',
                                    _sourceType: 'current',
                                    _sourceRecordId: record._id.toString()
                                });
                            });
                        }

                        // 2. Related records attachments
                        if (locals.relatedRecordsData) {
                            for (const [relKey, relRecs] of Object.entries(locals.relatedRecordsData)) {
                                let relEntityName = 'Relation';
                                const relDef = (entity.relations || []).find(r => r.key === relKey);
                                if (relDef && relDef.targetEntity) relEntityName = relDef.targetEntity.name;
                                else {
                                    const invDef = (locals.inverseRelations || []).find(r => r.key === relKey);
                                    if (invDef && invDef.targetEntity) relEntityName = invDef.targetEntity.name;
                                }

                                if (Array.isArray(relRecs)) {
                                    relRecs.forEach(relRec => {
                                        if (relRec.attachments && Array.isArray(relRec.attachments)) {
                                            relRec.attachments.forEach(att => {
                                                _allDocumentsTabAttachments.push({
                                                    ...att.toObject ? att.toObject() : att,
                                                    _sourceEntity: relEntityName,
                                                    _sourceTitle: relRec.title,
                                                    _sourceType: 'relation',
                                                    _sourceRecordId: relRec._id.toString()
                                                });
                                            });
                                        }
                                    });
                                }
                            }
                        }
                    %>
                    <script>
                        window._initialAttachments_<%= String(record._id) %> = <%- JSON.stringify(
                            _allDocumentsTabAttachments.map(a => ({
                                _id: a._id.toString(),
                                filename: a.filename,
                                originalName: a.originalName || a.filename,
                                url: \`/account/\${account_number}/uploads/attachments/\${a.filename}\`,
                                mimeType: a.mimeType,
                                size: a.size,
                                uploadedAt: a.uploadedAt,
                                isGenerated: a.isGenerated,
                                generatedFromName: a.generatedFromName,
                                category: (a.mimeType || '').includes('pdf') ? 'pdf' :
                                          (a.mimeType || '').includes('word') || (a.originalName||'').endsWith('.doc') || (a.originalName||'').endsWith('.docx') ? 'word' :
                                          (a.mimeType || '').includes('image') ? 'image' : 'other',
                                _sourceEntity: a._sourceEntity,
                                _sourceTitle: a._sourceTitle,
                                _sourceType: a._sourceType,
                                _sourceRecordId: a._sourceRecordId
                            }))
                        ) %>;
                    </script>`;

content = content.replace(oldScript, newScript);

// 2. Add Source column to the table header
const oldThead = `<tr>
                                                <th class="px-6 py-3 font-medium">Nom du document</th>
                                                <th class="px-6 py-3 font-medium w-32">Type</th>
                                                <th class="px-6 py-3 font-medium w-40">Date</th>
                                                <th class="px-6 py-3 font-medium w-24 text-right">Actions</th>
                                            </tr>`;
const newThead = `<tr>
                                                <th class="px-6 py-3 font-medium">Nom du document</th>
                                                <th class="px-6 py-3 font-medium w-48">Source</th>
                                                <th class="px-6 py-3 font-medium w-32">Type</th>
                                                <th class="px-6 py-3 font-medium w-40">Date</th>
                                                <th class="px-6 py-3 font-medium w-24 text-right">Actions</th>
                                            </tr>`;
content = content.replace(oldThead, newThead);

// 3. Add Source column to the table body
const oldCategoryCol = `<td class="px-6 py-3">
                                                        <span class="px-2 py-1 text-[10px] font-bold uppercase rounded-md bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300" x-text="att.category && att.category !== 'other' ? att.category : 'DOC'"></span>
                                                    </td>`;

const newSourceAndCategoryCols = `<td class="px-6 py-3">
                                                        <div class="flex items-center gap-2">
                                                            <span class="px-2 py-1 text-[10px] font-bold rounded-md" 
                                                                  :class="att._sourceType === 'current' ? 'bg-indigo-50 text-indigo-600 dark:bg-indigo-500/10 dark:text-indigo-400' : 'bg-emerald-50 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-400'">
                                                                <span x-text="att._sourceEntity + ' : ' + att._sourceTitle"></span>
                                                            </span>
                                                        </div>
                                                    </td>
                                                    <td class="px-6 py-3">
                                                        <span class="px-2 py-1 text-[10px] font-bold uppercase rounded-md bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300" x-text="att.category && att.category !== 'other' ? att.category : 'DOC'"></span>
                                                    </td>`;

content = content.replace(oldCategoryCol, newSourceAndCategoryCols);

// 4. Update the delete flow to hit correct record endpoint
// Find deleteDoc
const oldDeleteDoc = `async deleteDoc(id) {
                                    if(window.Swal) {`;
const newDeleteDoc = `async deleteDoc(att) {
                                    if(window.Swal) {`;
content = content.replace(oldDeleteDoc, newDeleteDoc);

const oldFetchCall = `const res = await fetch(\`/account/<%= account_number %>/api/records/<%= record._id %>/attachments/\${id}\`, { method: 'DELETE' });
                                        if(res.ok) {
                                            this.attachments = this.attachments.filter(a => a._id !== id);
                                            try { this.allTabs.find(t => t.key === '__documents__')._count--; } catch(e){}
                                            if (window.notyf) notyf.success('Document supprimé');
                                            window.dispatchEvent(new CustomEvent('smartdoc-attachment-deleted', { detail: { id } }));`;
const newFetchCall = `const res = await fetch(\`/account/<%= account_number %>/api/records/\${att._sourceRecordId}/attachments/\${att._id}\`, { method: 'DELETE' });
                                        if(res.ok) {
                                            this.attachments = this.attachments.filter(a => a._id !== att._id);
                                            try { this.allTabs.find(t => t.key === '__documents__')._count--; } catch(e){}
                                            if (window.notyf) notyf.success('Document supprimé');
                                            window.dispatchEvent(new CustomEvent('smartdoc-attachment-deleted', { detail: { id: att._id } }));`;
content = content.replace(oldFetchCall, newFetchCall);

// 5. Update delete button click
const oldDelBtn = `<button type="button" @click="deleteDoc(att._id)"`;
const newDelBtn = `<button type="button" @click="deleteDoc(att)"`;
content = content.replace(oldDelBtn, newDelBtn);

// 6. Fix attachment push logic so new documents get _source info
const oldAttPush1 = `if (!exists) {
                                                this.attachments.push(e.detail.attachment);`;
const newAttPush1 = `if (!exists) {
                                                const newAtt = { ...e.detail.attachment };
                                                newAtt._sourceEntity = '<%= entity.name || "Dossier" %>';
                                                newAtt._sourceTitle = '<%= record.title || "" %>';
                                                newAtt._sourceType = 'current';
                                                newAtt._sourceRecordId = '<%= record._id %>';
                                                this.attachments.push(newAtt);`;                                               
content = content.replace(oldAttPush1, newAttPush1);

const oldAttPush2 = `if (!exists) {
                                                    this.attachments.push(att);`;
const newAttPush2 = `if (!exists) {
                                                    const newAtt = { ...att };
                                                    newAtt._sourceEntity = '<%= entity.name || "Dossier" %>';
                                                    newAtt._sourceTitle = '<%= record.title || "" %>';
                                                    newAtt._sourceType = 'current';
                                                    newAtt._sourceRecordId = '<%= record._id %>';
                                                    this.attachments.push(newAtt);`;                                                    
content = content.replace(oldAttPush2, newAttPush2);

fs.writeFileSync(ejsPath, content, 'utf8');
console.log('Successfully updated record-edit.ejs logic to include cross-relation attachments.');
