require('dotenv').config();

const fs = require('fs');
const path = require('path');
const mongoose = require('mongoose');
const Account = require('../models/account.model');
const dbConfig = require('../config/db');
const {
  normalizeUploadedFilename,
  normalizeStoredFilePath,
} = require('../utils/filename-encoding');

const dryRun = process.argv.includes('--dry-run');
const accountNumbers = process.argv
  .slice(2)
  .filter(arg => arg !== '--dry-run')
  .map(String);

function findExistingPath(accountNumber, storedFilename) {
  const privatePath = path.join(__dirname, '..', 'private_uploads', 'attachments', accountNumber, storedFilename);
  if (fs.existsSync(privatePath)) return privatePath;

  const publicPath = path.join(__dirname, '..', 'public', 'uploads', 'attachments', accountNumber, storedFilename);
  if (fs.existsSync(publicPath)) return publicPath;

  return privatePath;
}

function renameStoredFile(accountNumber, oldFilename, newFilename) {
  if (oldFilename === newFilename) return true;

  const oldPath = findExistingPath(accountNumber, oldFilename);
  if (!fs.existsSync(oldPath)) return false;

  const newPath = path.join(path.dirname(oldPath), path.basename(newFilename));
  if (fs.existsSync(newPath)) return false;

  if (!dryRun) fs.renameSync(oldPath, newPath);
  return true;
}

function normalizeAttachment(accountNumber, attachment, stats) {
  const next = { ...attachment };

  const oldOriginalName = attachment.originalName || '';
  const newOriginalName = normalizeUploadedFilename(oldOriginalName);
  if (newOriginalName && newOriginalName !== oldOriginalName) {
    next.originalName = newOriginalName;
    stats.displayNames++;
  }

  const oldFilename = attachment.filename || '';
  const newFilename = normalizeStoredFilePath(oldFilename);
  if (newFilename && newFilename !== oldFilename) {
    if (renameStoredFile(accountNumber, oldFilename, newFilename)) {
      next.filename = newFilename;
      stats.filesRenamed++;
    } else {
      stats.fileRenamesSkipped++;
    }
  }

  return next;
}

async function getTargetAccounts() {
  if (accountNumbers.length > 0) return accountNumbers;

  await mongoose.connect(dbConfig.globalDbUri, { useNewUrlParser: true });
  const accounts = await Account.find({}).select('account_number').lean();
  await mongoose.disconnect();

  return accounts.map(acc => String(acc.account_number)).filter(Boolean);
}

async function fixTenant(accountNumber) {
  const conn = await mongoose.createConnection(`${dbConfig.uri}saas_app_rb_${accountNumber}`, {
    useNewUrlParser: true,
  }).asPromise();

  const stats = {
    recordsTouched: 0,
    driveFilesTouched: 0,
    displayNames: 0,
    filesRenamed: 0,
    fileRenamesSkipped: 0,
  };

  const records = conn.collection('records');
  const recordCursor = records.find({ 'attachments.0': { $exists: true } });
  for await (const record of recordCursor) {
    let changed = false;
    const attachments = (record.attachments || []).map(att => {
      const normalized = normalizeAttachment(accountNumber, att, stats);
      if (normalized.filename !== att.filename || normalized.originalName !== att.originalName) changed = true;
      return normalized;
    });

    if (changed) {
      stats.recordsTouched++;
      if (!dryRun) await records.updateOne({ _id: record._id }, { $set: { attachments } });
    }
  }

  const driveFiles = conn.collection('drivefiles');
  const driveCursor = driveFiles.find({});
  for await (const file of driveCursor) {
    const normalized = normalizeAttachment(accountNumber, file, stats);
    const update = {};
    if (normalized.filename !== file.filename) update.filename = normalized.filename;
    if (normalized.originalName !== file.originalName) update.originalName = normalized.originalName;

    if (Object.keys(update).length > 0) {
      stats.driveFilesTouched++;
      if (!dryRun) await driveFiles.updateOne({ _id: file._id }, { $set: update });
    }
  }

  await conn.close();
  return stats;
}

(async () => {
  const targets = await getTargetAccounts();
  if (targets.length === 0) {
    console.log('No tenant accounts found.');
    return;
  }

  for (const accountNumber of targets) {
    try {
      const stats = await fixTenant(accountNumber);
      console.log(`[${dryRun ? 'dry-run ' : ''}${accountNumber}]`, stats);
    } catch (error) {
      console.error(`[${accountNumber}] failed:`, error.message);
    }
  }
})().catch(error => {
  console.error(error);
  process.exit(1);
});
