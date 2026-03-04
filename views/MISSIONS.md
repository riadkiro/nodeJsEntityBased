
Prémission: ✅ TOUTES TERMINÉES

- ✅ image-48 : Vue compacte des champs + bouton "Ajouter un champ" → modal management terminé
- ✅ image-49 : Padding input 29px !important → terminé
- ✅ image-50 : Pas de RDV en double + groupement `pièces jointes | relations activées | Enregistrer` → terminé
- ✅ image-51/52 : Icons sans style rond, hover expandable pill → terminé


Mission 1 : 

### Objectif principal
Reproduire l'interface de image-42.png : page Consultation avec header, zone focus, tableaux dynamiques, sidebar patient/documents

### Sous-tâches

#### Phase 1 : Seed Data Intelligent ✅
- ✅ Enrichir patients : allergies, antécédents, groupe sanguin, médecin traitant, mutuelle
- ✅ Enrichir consultations : symptômes réalistes et détaillés, poids/taille fixes, examens cliniques
- ✅ Explorer le LineSchema Traitement pour seed de données traitement (prescription_v1 + invoice_v1 intégrés au seed)

#### Phase 2 : Champs de Consultation avec icônes ✅ (déjà actif)
- ✅ Icônes affichées à côté de chaque label via field.ui.icon

#### Phase 5 : Tableaux Dynamiques
- [ ] Tabs multi-tableaux quand l'entité en a plusieurs
- [ ] Barre actions rapides en bas (Ajouter traitement, Ctrl+O Ordonnance, Ctrl+E Examen)

#### Phase 6 : Symptômes en mode tag/chip
- [ ] Entité Symptômes avec records (Fatigue, Toux, Douleur thoracique...)
- [ ] Champ relation Symptômes sur Consultation en mode multi-select tag (comme classification)

### Références
![alt text](image-42.png) 
![alt text](image-46.png)
![alt text](image-47.png)

### Notes
- Tout les champs auront des icons, afficher les icons a coté du champ
- Zone focus = bloc principal consultation (motif, symptômes, diagnostic)
- Sidebar droite = fiche patient + documents
- Pattern réutilisable : header customizable, focus, tableaux dynamiques, sidebar
- Privilégier icons au lieu de labels quand possible
- Champs avec render custom et calculé
- Résultat pixel-perfect image-42.png
