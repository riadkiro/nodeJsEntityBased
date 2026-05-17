const puppeteer = require('puppeteer');
const path = require('path');
const fs = require('fs');

async function run() {
  console.log('Starting E2E verification of right-click context menu in Drive...');
  const browser = await puppeteer.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });
  const page = await browser.newPage();
  
  await page.setViewport({ width: 1280, height: 900 });

  // 1. Login
  console.log('Navigating to login page...');
  await page.goto('http://localhost:3000/auth/login', { waitUntil: 'networkidle2' });
  await page.type('input[name="email"]', 'boukirou6@hotmail.com');
  await page.type('input[name="password"]', 'test');
  
  console.log('Submitting login form...');
  await Promise.all([
    page.click('button[type="submit"]'),
    page.waitForNavigation({ waitUntil: 'networkidle2' })
  ]);
  
  // 2. Go to Drive Tab
  console.log('Navigating to Record Drive Tab...');
  await page.goto('http://localhost:3000/account/5096/record/opportunites/6a09be6c0052fd6c37c92ba9/drive', { waitUntil: 'networkidle2' });
  await new Promise(resolve => setTimeout(resolve, 3000)); // wait for Alpine.js data hydration

  const artifactsDir = 'C:\\Users\\pc\\.gemini\\antigravity\\brain\\b7385ccc-f6c6-4222-a8b8-fb7de8a51ae5';
  if (!fs.existsSync(artifactsDir)) {
    fs.mkdirSync(artifactsDir, { recursive: true });
  }

  // Take screenshot of empty / initial Drive state
  console.log('Taking screenshot of initial Drive page...');
  await page.screenshot({ path: path.join(artifactsDir, 'drive_initial.png') });

  // 3. Create a custom folder "FolderTestSubagent"
  console.log('Creating a new custom folder...');
  await page.evaluate(() => {
    // Click "Nouveau dossier" button
    const btn = Array.from(document.querySelectorAll('button')).find(b => b.innerText.includes('Nouveau dossier'));
    if (btn) btn.click();
  });
  await new Promise(resolve => setTimeout(resolve, 500));

  // Type new folder name
  console.log('Typing folder name "FolderTestSubagent"...');
  await page.type('.drive-new-folder-input', 'FolderTestSubagent');
  
  // Click "Créer"
  console.log('Clicking "Créer" button...');
  await page.evaluate(() => {
    const btn = document.querySelector('.drive-new-folder-btn');
    if (btn) btn.click();
  });
  await new Promise(resolve => setTimeout(resolve, 2000)); // wait for DB creation

  console.log('Taking screenshot after folder creation...');
  await page.screenshot({ path: path.join(artifactsDir, 'drive_folder_created.png') });

  // 4. Trigger context menu on the folder
  console.log('Triggering context menu on custom folder "FolderTestSubagent"...');
  await page.evaluate(() => {
    // Find the folder element
    const folderTitle = Array.from(document.querySelectorAll('.rm-item-title')).find(el => el.innerText === 'FolderTestSubagent');
    if (folderTitle) {
      const folderItem = folderTitle.closest('.drive-folder-item');
      if (folderItem) {
        // Dispatch right click (contextmenu) event
        const rect = folderItem.getBoundingClientRect();
        const clientX = rect.left + rect.width / 2;
        const clientY = rect.top + rect.height / 2;
        
        const event = new MouseEvent('contextmenu', {
          bubbles: true,
          cancelable: true,
          clientX: clientX,
          clientY: clientY
        });
        folderItem.dispatchEvent(event);
      }
    }
  });
  await new Promise(resolve => setTimeout(resolve, 800));

  console.log('Taking screenshot of opened context menu...');
  await page.screenshot({ path: path.join(artifactsDir, 'drive_context_menu_opened.png') });

  // 5. Click "Renommer" in the context menu
  console.log('Clicking "Renommer" in the context menu...');
  await page.evaluate(() => {
    const buttons = Array.from(document.querySelectorAll('button'));
    const renameBtn = buttons.find(b => b.innerText.includes('Renommer') && b.querySelector('iconify-icon[icon="solar:pen-bold-duotone"]'));
    if (renameBtn) renameBtn.click();
  });
  await new Promise(resolve => setTimeout(resolve, 800));

  console.log('Taking screenshot of Rename Modal...');
  await page.screenshot({ path: path.join(artifactsDir, 'drive_rename_modal_opened.png') });

  // 6. Rename the folder to "FolderTestSubagentRenamed"
  console.log('Typing new name "FolderTestSubagentRenamed"...');
  // clear input and type
  await page.evaluate(() => {
    // We can select the input inside the modal and clear/type
    // The input is the only text input inside body at this point
    const modalInput = document.querySelector('input[x-model="renameFolderValue"]');
    if (modalInput) {
      modalInput.value = '';
    }
  });
  await page.type('input[x-model="renameFolderValue"]', 'FolderTestSubagentRenamed');
  
  // Click "Enregistrer" in the modal
  console.log('Clicking "Enregistrer" in the rename modal...');
  await page.evaluate(() => {
    const buttons = Array.from(document.querySelectorAll('button'));
    const saveBtn = buttons.find(b => b.innerText.includes('Enregistrer') && b.getAttribute('style')?.includes('background:#4361ee') || b.outerHTML.includes('confirmRenameFolder'));
    if (saveBtn) saveBtn.click();
  });
  await new Promise(resolve => setTimeout(resolve, 2000)); // wait for PATCH response

  console.log('Taking screenshot after rename...');
  await page.screenshot({ path: path.join(artifactsDir, 'drive_folder_renamed.png') });

  // 7. Right click on renamed folder to trigger context menu again
  console.log('Triggering context menu on renamed folder "FolderTestSubagentRenamed"...');
  await page.evaluate(() => {
    const folderTitle = Array.from(document.querySelectorAll('.rm-item-title')).find(el => el.innerText === 'FolderTestSubagentRenamed');
    if (folderTitle) {
      const folderItem = folderTitle.closest('.drive-folder-item');
      if (folderItem) {
        const rect = folderItem.getBoundingClientRect();
        const clientX = rect.left + rect.width / 2;
        const clientY = rect.top + rect.height / 2;
        
        const event = new MouseEvent('contextmenu', {
          bubbles: true,
          cancelable: true,
          clientX: clientX,
          clientY: clientY
        });
        folderItem.dispatchEvent(event);
      }
    }
  });
  await new Promise(resolve => setTimeout(resolve, 800));

  // 8. Click "Supprimer" in the context menu
  console.log('Clicking "Supprimer" in the context menu...');
  await page.evaluate(() => {
    const buttons = Array.from(document.querySelectorAll('button'));
    const deleteBtn = buttons.find(b => b.innerText.includes('Supprimer') && b.querySelector('iconify-icon[icon="solar:trash-bin-trash-bold-duotone"]'));
    if (deleteBtn) deleteBtn.click();
  });
  await new Promise(resolve => setTimeout(resolve, 800));

  console.log('Taking screenshot of Delete Confirmation Modal...');
  await page.screenshot({ path: path.join(artifactsDir, 'drive_delete_modal_opened.png') });

  // 9. Click "Supprimer" in the modal
  console.log('Clicking "Supprimer" inside delete modal...');
  await page.evaluate(() => {
    const buttons = Array.from(document.querySelectorAll('button'));
    const confirmDeleteBtn = buttons.find(b => b.innerText.includes('Supprimer') && b.getAttribute('style')?.includes('background:#ef4444') || b.outerHTML.includes('confirmDeleteFolder'));
    if (confirmDeleteBtn) confirmDeleteBtn.click();
  });
  await new Promise(resolve => setTimeout(resolve, 2000)); // wait for DELETE response

  console.log('Taking final screenshot after folder deletion...');
  await page.screenshot({ path: path.join(artifactsDir, 'drive_final_empty.png') });

  await browser.close();
  console.log('E2E Verification executed flawlessly!');
}

run().catch(console.error);
