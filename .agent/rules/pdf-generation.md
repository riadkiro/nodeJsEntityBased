# PDF Generation Architecture — Critical Rules

## Pipeline Overview

There are **3 PDF generation flows**. ALL must be handled correctly:

| Flow | Trigger | Condition | Behavior |
|------|---------|-----------|----------|
| **A** | Draft + Record | `doc.isDraft && record exists` | `finalize-draft` → save as record attachment |
| **B** | Draft, no Record | `doc.isDraft && !recordId` | `finalize-draft` → convert draft to standalone finalized document |
| **C** | Regular document | `!doc.isDraft` | `exportPdf()` → blob download only |

## Critical Guard: handlePdfExport

```jsx
// ✅ CORRECT — ALL drafts go through finalize-draft
if (doc.isDraft) { ... }

// ❌ WRONG — Skips Docs Hub context-free generation
if (doc.isDraft && doc.draftRecordId) { ... }
```

## Backend: finalize-draft Dual Path

The `finalize-draft` endpoint MUST handle two scenarios:

### PATH A: Record exists
1. Generate PDF with Puppeteer
2. Save as `record.attachments[]` with `isGenerated: true`
3. Delete the draft document
4. Shows in "Générés" tab via record attachment aggregation

### PATH B: No record (Docs Hub context-free)
1. Generate PDF with Puppeteer
2. Convert draft → finalized document: `isDraft=false, status='finalized'`
3. Store file metadata in `draftDoc.generatedFile = { filename, downloadUrl, ... }`
4. Shows in "Générés" tab via standalone document query

```js
// ✅ CORRECT — record is optional
let record = null;
if (recordId) {
    record = await Record.findById(recordId);
}
// ... generate PDF ...
if (record) {
    // PATH A: save as attachment
} else {
    // PATH B: convert to finalized document
}

// ❌ WRONG — hard fails on null recordId
const record = await Record.findById(recordId);
if (!record) return res.status(404).json({ error: 'Record introuvable' });
```

## Docs Hub "Générés" Tab — Dual Data Source

The tab must query BOTH sources:
1. `Record.aggregate({ 'attachments.isGenerated': true })` — record-bound PDFs
2. `Document.find({ status: 'finalized', 'generatedFile.filename': { $exists: true } })` — standalone PDFs

## Common Bugs to Watch For

1. **Orphan drafts**: If `finalize-draft` fails, the draft accumulates. Check `Document.find({ isDraft: true })` count.
2. **Stale content**: Always send `pagesContent` from the DOM (contenteditable is uncontrolled). The DB version may be stale.
3. **postMessage bridge** (for iframe flows): Has 5s timeout. If iframe isn't loaded, falls back to DB content.
4. **Missing `draftRecordId`**: Documents created from Docs Hub may have `draftRecordId: null`. This is expected.

## File Locations

- Frontend handler: `src/islands/document-editor/DocumentEditorIsland.jsx` → `handlePdfExport`
- API client: `src/islands/document-editor/services/documentApi.js` → `finalizeDraft()`
- Backend endpoint: `routes/api/api-smartdoc.router.js` → `POST /smartdoc/finalize-draft/:draftDocId`
- Docs Hub query: `routes/document.routes.js` → `generatedDocs` section
- Alpine flows: `views/record/record-module.ejs` and `views/record/partials/record-sidebar.ejs` → `finalizePreview()`
