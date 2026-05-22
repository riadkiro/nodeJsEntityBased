// Check available browser automation tools
const modules = ['puppeteer', 'playwright', 'playwright-core', 'selenium-webdriver'];
for (const m of modules) {
  try {
    require(m);
    console.log(`✅ ${m} is available`);
  } catch(e) {
    console.log(`❌ ${m} not found`);
  }
}
