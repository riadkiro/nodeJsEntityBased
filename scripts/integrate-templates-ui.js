const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, '../views/nav/nav-sidebar.ejs');
let content = fs.readFileSync(filePath, 'utf8');

// Match the exact wrapper and step 1 block
const target = `        <!-- Records Wizard Modal -->
        <div x-show="showRecordsWizard" x-cloak
             class="fixed inset-0 z-[1000] flex items-center justify-center bg-black/50 p-4">
             <div class="bg-white dark:bg-[#1b2e4b] w-full max-w-lg rounded-xl shadow-2xl overflow-hidden"
                  @click.outside="showRecordsWizard = false">
                 <div class="p-5 border-b dark:border-gray-800 flex justify-between items-center">
                    <h3 class="text-lg font-bold dark:text-white">Créer des Records</h3>
                    <button @click="showRecordsWizard = false" class="text-gray-400 hover:text-gray-600 transition-colors">
                        <iconify-icon icon="solar:close-circle-bold" width="24"></iconify-icon>
                    </button>
                 </div>
                 <div class="p-6">
                    <!-- Step 1: Choix -->
                    <template x-if="recordsWizardStep === 1">
                       <div class="grid grid-cols-2 gap-4">
                          <div @click="recordsWizardMode = 'existing'; recordsWizardStep = 2"
                               class="cursor-pointer border-2 border-gray-100 dark:border-gray-800 hover:border-primary hover:bg-primary/5 rounded-xl p-6 text-center transition-all group">
                             <iconify-icon icon="solar:database-line-duotone" width="48" class="text-gray-400 group-hover:text-primary mb-3 mx-auto"></iconify-icon>
                             <h4 class="font-bold text-sm">Collection Existante</h4>
                             <p class="text-xs text-gray-500 mt-2">Lier ou segmenter une entité existante</p>
                          </div>
                          <div @click="recordsWizardMode = 'new'; recordsWizardStep = 2"
                               class="cursor-pointer border-2 border-gray-100 dark:border-gray-800 hover:border-success hover:bg-success/5 rounded-xl p-6 text-center transition-all group">
                             <iconify-icon icon="solar:magic-stick-3-line-duotone" width="48" class="text-gray-400 group-hover:text-success mb-3 mx-auto"></iconify-icon>
                             <h4 class="font-bold text-sm">Nouvelle Collection</h4>
                             <p class="text-xs text-gray-500 mt-2">Créer une nouvelle entité de zéro</p>
                          </div>
                       </div>
                    </template>`;

const replacement = `        <!-- Records Wizard Modal -->
        <div x-show="showRecordsWizard" x-cloak
             class="fixed inset-0 z-[1000] flex items-center justify-center bg-black/50 p-4">
             <div class="bg-white dark:bg-[#1b2e4b] w-full max-w-xl rounded-xl shadow-2xl overflow-hidden"
                  @click.outside="showRecordsWizard = false">
                 <div class="p-5 border-b dark:border-gray-800 flex justify-between items-center">
                    <h3 class="text-lg font-bold dark:text-white">Créer des Records</h3>
                    <button @click="showRecordsWizard = false" class="text-gray-400 hover:text-gray-600 transition-colors">
                        <iconify-icon icon="solar:close-circle-bold" width="24"></iconify-icon>
                    </button>
                 </div>
                 <div class="p-6">
                    <!-- Step 1: Choix -->
                    <template x-if="recordsWizardStep === 1">
                       <div class="grid grid-cols-3 gap-3">
                          <div @click="recordsWizardMode = 'existing'; recordsWizardStep = 2"
                               class="cursor-pointer border-2 border-gray-100 dark:border-gray-800 hover:border-primary hover:bg-primary/5 rounded-xl p-4 text-center transition-all group flex flex-col justify-between">
                             <div>
                                <iconify-icon icon="solar:database-line-duotone" width="40" class="text-gray-400 group-hover:text-primary mb-3 mx-auto"></iconify-icon>
                                <h4 class="font-bold text-xs dark:text-white">Collection Existante</h4>
                                <p class="text-[10px] text-gray-500 dark:text-gray-400 mt-1">Lier/segmenter une collection active</p>
                             </div>
                          </div>
                          <div @click="recordsWizardStep = 'library'"
                               class="cursor-pointer border-2 border-gray-100 dark:border-gray-800 hover:border-warning hover:bg-warning/5 rounded-xl p-4 text-center transition-all group flex flex-col justify-between">
                             <div>
                                <iconify-icon icon="solar:star-ring-bold-duotone" width="40" style="color: #e2a03f" class="group-hover:scale-110 mb-3 mx-auto transition-transform"></iconify-icon>
                                <h4 class="font-bold text-xs dark:text-white">Modèles Prêts</h4>
                                <p class="text-[10px] text-gray-500 dark:text-gray-400 mt-1">Projets, Voitures, Personnes préconfigurés</p>
                             </div>
                          </div>
                          <div @click="recordsWizardMode = 'new'; recordsWizardStep = 2"
                               class="cursor-pointer border-2 border-gray-100 dark:border-gray-800 hover:border-success hover:bg-success/5 rounded-xl p-4 text-center transition-all group flex flex-col justify-between">
                             <div>
                                <iconify-icon icon="solar:magic-stick-3-line-duotone" width="40" class="text-gray-400 group-hover:text-success mb-3 mx-auto"></iconify-icon>
                                <h4 class="font-bold text-xs dark:text-white">Nouvelle de Zéro</h4>
                                <p class="text-[10px] text-gray-500 dark:text-gray-400 mt-1">Créer une nouvelle entité personnalisée</p>
                             </div>
                          </div>
                       </div>
                    </template>

                    <!-- Step 1.5: Bibliothèque de Modèles -->
                    <template x-if="recordsWizardStep === 'library'">
                       <div class="space-y-4">
                          <div class="flex justify-between items-center mb-2">
                             <p class="text-xs text-gray-500 dark:text-gray-400">Sélectionnez un modèle d'entité prêt à l'emploi :</p>
                             <button @click="recordsWizardStep = 1" class="text-xs text-primary hover:underline flex items-center gap-1 font-semibold">
                                <iconify-icon icon="solar:alt-arrow-left-line-duotone"></iconify-icon> Retour
                             </button>
                          </div>
                          
                          <div class="grid grid-cols-2 gap-3 max-h-[360px] overflow-y-auto pr-1 custom-scrollbar">
                             <template x-for="tpl in templatesList" :key="tpl.nameSingular">
                                <div @click="selectTemplate(tpl)"
                                     class="cursor-pointer border border-gray-100 dark:border-gray-800 hover:border-primary bg-gray-50/50 dark:bg-gray-800/40 hover:bg-white dark:hover:bg-[#1b2e4b] rounded-xl p-4 transition-all group relative flex flex-col justify-between shadow-sm hover:shadow">
                                   <div>
                                      <div class="flex items-center gap-3 mb-2">
                                         <div class="w-8 h-8 rounded-lg flex items-center justify-center shrink-0" :style="'background-color:' + tpl.color + '20; color:' + tpl.color">
                                            <iconify-icon :icon="tpl.icon" width="20" height="20"></iconify-icon>
                                         </div>
                                         <h4 class="font-bold text-sm text-gray-800 dark:text-gray-100" x-text="tpl.namePlural"></h4>
                                      </div>
                                      <p class="text-[11px] text-gray-500 dark:text-gray-400 leading-normal" x-text="tpl.description"></p>
                                   </div>
                                   <div class="mt-3 flex flex-wrap gap-1">
                                      <template x-for="f in tpl.fields" :key="f.name">
                                         <span class="text-[9px] bg-gray-100 dark:bg-gray-800 px-1.5 py-0.5 rounded text-gray-600 dark:text-gray-300" x-text="f.name"></span>
                                      </template>
                                   </div>
                                </div>
                              </template>
                          </div>
                       </div>
                    </template>`;

// We will do a line-ending normalization before comparing
const normalize = s => s.replace(/\r\n/g, '\n').trim();

if (normalize(content).includes(normalize(target))) {
    // Perform simple replace using raw strings but with normalized line endings for safer match
    const parts = content.split(/\r?\n/);
    const targetLines = target.split('\n');
    let startIdx = -1;
    for (let i = 0; i <= parts.length - targetLines.length; i++) {
        let match = true;
        for (let j = 0; j < targetLines.length; j++) {
            if (parts[i+j].trim() !== targetLines[j].trim()) {
                match = false;
                break;
            }
        }
        if (match) {
            startIdx = i;
            break;
        }
    }
    
    if (startIdx !== -1) {
        parts.splice(startIdx, targetLines.length, replacement);
        fs.writeFileSync(filePath, parts.join('\n'), 'utf8');
        console.log('SUCCESS: Injected templates wizard Step 1 card grid and Step 1.5 templates library view.');
    } else {
        console.error('ERROR: Could not locate target line indices programmatically.');
    }
} else {
    console.error('ERROR: Target HTML code block not found in file.');
}
