

# Browser Verification Rule (CRITICAL)

## OBLIGATOIRE : Toujours vérifier via le navigateur

Avant de dire que quelque chose est "terminé" ou "fonctionne" :

1. **TOUJOURS** ouvrir la page dans le navigateur avec `/browser`
2. **TOUJOURS** prendre un screenshot pour vérifier visuellement
3. **TOUJOURS** vérifier la console du navigateur pour les erreurs JS
4. **JAMAIS** se fier uniquement à un script Node.js ou grep pour valider du frontend

## Mode pilotage automatique

Par défaut, fonctionne en mode autonome :
- Ne pas demander confirmation pour les étapes intermédiaires
- Debugger et corriger automatiquement si un bug est trouvé
- Boucler test → fix → re-test jusqu'à ce que ça marche visuellement
- Ne s'arrêter que quand le screenshot confirme que tout est OK
