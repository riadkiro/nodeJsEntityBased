const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');

async function run() {
  const browser = await puppeteer.launch({ headless: true });
  const page = await browser.newPage();
  
  await page.setViewport({ width: 1280, height: 900 });

  await page.goto('http://localhost:3000/auth/login', { waitUntil: 'networkidle2' });
  await page.type('input[name="email"]', 'boukirou6@hotmail.com');
  await page.type('input[name="password"]', 'test');
  await Promise.all([
    page.click('button[type="submit"]'),
    page.waitForNavigation({ waitUntil: 'networkidle2' })
  ]);
  
  await page.goto('http://localhost:3000/account/5096/record/opportunites/6a09be6c0052fd6c37c92ba9/drive', { waitUntil: 'networkidle2' });
  await new Promise(r => setTimeout(r, 2000));

  // Create a test file
  const testFilePath = path.join(__dirname, 'test-secure-upload.pdf');
  // Just write some minimal valid PDF header
  fs.writeFileSync(testFilePath, '%PDF-1.4\n%âãÏÓ\n1 0 obj\n<</Type/Catalog/Pages 2 0 R>>\nendobj\n');

  // Find file input and upload
  const fileInput = await page.$('input[type="file"]');
  if (fileInput) {
    await fileInput.uploadFile(testFilePath);
  } else {
    console.log("Could not find file input");
  }

  await new Promise(r => setTimeout(r, 3000));
  await page.screenshot({ path: path.join(__dirname, 'upload_success.png') });
  
  // Create an invalid file (spoofed PDF)
  const maliciousFilePath = path.join(__dirname, 'malicious.pdf');
  // Write a shell script masquerading as PDF
  fs.writeFileSync(maliciousFilePath, '#!/bin/bash\necho "hacked"');
  
  if (fileInput) {
    await fileInput.uploadFile(maliciousFilePath);
  }

  await new Promise(r => setTimeout(r, 2000));
  await page.screenshot({ path: path.join(__dirname, 'upload_malicious.png') });

  // Cleanup
  fs.unlinkSync(testFilePath);
  fs.unlinkSync(maliciousFilePath);

  console.log("Test upload script complete");
  await browser.close();
}

run().catch(console.error);
