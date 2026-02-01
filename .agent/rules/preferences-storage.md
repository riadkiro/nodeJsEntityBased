---
trigger: always_on
---

# Preferences Storage Rules

## CRITICAL: Server-Side Storage Only

Les préférences utilisateur (layouts, affichage, configuration des vues) doivent **TOUJOURS** être stockées côté serveur, **JAMAIS** en localStorage.

### Raisons
1. **Multi-appareil** : L'utilisateur doit retrouver ses préférences sur tous ses appareils
2. **Multi-tenant** : Les préférences sont liées à l'entity/workspace, pas au navigateur
3. **Persistance** : localStorage peut être effacé par l'utilisateur
4. **Sécurité** : Les préférences peuvent contenir des informations sensibles

### Ce qui doit être sauvegardé côté serveur
- **Ordre des colonnes** dans les DataTables
- **Colonnes visibles/cachées**
- **Tri par défaut** (colonne + direction)
- **Densité d'affichage** (compact, normal, comfortable)
- **Taille de page** (10, 25, 50, 100)
- **Layouts de page** personnalisés
- **Filtres sauvegardés**

### API Pattern

```javascript
// ✅ BON - Sauvegarde serveur
const savePreferences = async (newPrefs) => {
    await fetch(`/account/${accountNumber}/api/user/view-preferences`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
            viewId,      // ID de la vue (lié à l'entity)
            preferences: newPrefs
        })
    })
}

// ❌ MAUVAIS - localStorage
localStorage.setItem('preferences', JSON.stringify(prefs))
```

### Scope des préférences
- Les préférences sont **par vue/entity**, pas globales
- Chaque entity a ses propres préférences de colonnes, tri, etc.
- L'utilisateur peut avoir des configurations différentes par entity
