# Record Data Architecture & Common Pitfalls

## 1. Record Model — Field ID Types

Le modèle `Record` stocke les champs dynamiques dans `customFields`:
```javascript
customFields: [{
    field_id: { type: ObjectId, ref: 'FieldTemplate' },  // ⚠️ DOIT être un ObjectId 24-hex
    value: Mixed
}]
```

### ⚠️ Les relations utilisent des UUID, PAS des ObjectId
Les `entity.relations[].key` sont des UUID v4 (ex: `1ce30e77-8534-4295-9330-353e85cfba3e`).
Le formulaire EntityForm envoie les valeurs relation sous `custom[rel.key]` → UUID comme clé.

**TOUJOURS valider les field IDs avant de les insérer dans `customFields` :**
```javascript
const isValidObjectId = (id) => /^[0-9a-fA-F]{24}$/.test(id);
for (const [fieldId, value] of Object.entries(custom)) {
    if (!isValidObjectId(fieldId)) continue; // Skip relation UUIDs
    customFieldsArray.push({ field_id: fieldId, value });
}
```

## 2. Reference Title (referenceTitle)

Le titre affiché d'un record est **composé** à partir de `entity.referenceTitleTokens`:

```javascript
const tokens = entity.referenceTitleTokens || [];
tokens.forEach(token => {
    if (token.t === 'text') parts.push(token.v || '');
    if (token.t === 'field') {
        // Standard fields: title, slug, date, description
        if (['title', 'slug', 'date', 'description'].includes(token.id)) {
            parts.push(record[token.id] || '');
        }
        // Custom fields: token.id = FieldTemplate ObjectId
        else if (record.customFields) {
            const cf = record.customFields.find(c => {
                const cfId = c.field_id?._id || c.field_id;
                return cfId && cfId.toString() === token.id;
            });
            parts.push(cf?.value || '');
        }
    }
});
const referenceTitle = parts.join('').trim() || record.title || '';
```

### Où le referenceTitle doit être calculé :
| Endpoint / Controller | Fichier | Usage |
|---|---|---|
| API records list (React Island) | `api.routes.js` | `GET /api/entity/:entityId/views/:viewId/records` |
| Server-rendered view | `view.controller.js` → `renderView` | Rendu EJS des vues |
| **Relation field autocomplete** | `record.controller.js` → `searchAjax` | Dropdown du champ relation |

### ⚠️ Le `.lean()` est obligatoire
Mongoose retourne des documents immutables par défaut. Pour ajouter `referenceTitle`:
```javascript
const records = await Record.find(query).populate('customFields.field_id').lean();
// Maintenant on peut faire: record.referenceTitle = ...
```

## 3. Relation Field Autocomplete (`searchAjax`)

L'API `/account/:acc/record/api/search` alimente les dropdowns de type relation.

**Checklist pour le label affiché :**
- ✅ Select `customFields` (pas juste `title slug _id`)
- ✅ Populate `customFields.field_id`
- ✅ Charger l'entity pour les `referenceTitleTokens`
- ✅ Calculer le `referenceTitle` composé comme label
- ✅ Utiliser `.lean()` pour permettre la mutation

## 4. EntityForm Layout — Mapping des IDs

L'EntityForm stocke les champs dans un layout structuré `{ rows: [{ columns: [{ fields: [] }] }] }`.

Chaque `field` dans le layout a :
- `id` : UUID interne du layout (ex: `f_1234567890_abc`) — identifiant unique du champ dans le canvas
- `fieldId` : Référence vers la source réelle :
  - Pour `type: 'standard'` → clé standard (`title`, `slug`, `date`...)
  - Pour `type: 'custom'` → `FieldTemplate._id` (ObjectId)
  - Pour `type: 'relation'` → `entity.relations[].key` (UUID ⚠️)
  - Pour `type: 'classification'` → `Classification._id` (ObjectId)

## 5. Multi-tenant Pattern

Toujours utiliser `tenantCollection` pour les modèles :
```javascript
const Entity = await tenantCollection(req, "Entity");
const Record = await tenantCollection(req, "Record");
const EntityForm = await tenantCollection(req, "EntityForm");
```
