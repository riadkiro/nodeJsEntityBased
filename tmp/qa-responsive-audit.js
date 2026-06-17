#!/usr/bin/env node

require('dotenv').config();

const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const mongoose = require('mongoose');
const puppeteer = require('puppeteer');

const dbConfig = require('../config/db');
const Account = require('../models/account.model');
const User = require('../models/user.model');
require('../models/entity.model');
require('../models/record.model');

const ACCOUNT_NUMBER = process.env.QA_ACCOUNT_NUMBER || '9069';
const BASE_URL = (process.env.QA_BASE_URL || 'http://127.0.0.1:3000').replace(/\/$/, '');
const TARGET_PROJECT_ID = process.env.QA_PROJECT_RECORD_ID || '6a203b82222dbaaf4486d46e';
const ARTIFACT_DIR = path.join(__dirname, 'responsive-audit');
const RESULT_PATH = path.join(ARTIFACT_DIR, `responsive-audit-${ACCOUNT_NUMBER}.json`);

const VIEWPORTS = [
  { key: 'desktop', width: 1440, height: 900 },
  { key: 'tablet', width: 820, height: 1180 },
  { key: 'mobile', width: 390, height: 844 },
];
const VIEWPORT_FILTER = new Set(String(process.env.QA_VIEWPORTS || '')
  .split(',')
  .map(value => value.trim())
  .filter(Boolean));
const PAGE_FILTER = String(process.env.QA_PAGE_FILTER || '')
  .split(',')
  .map(value => value.trim())
  .filter(Boolean);

const RECORD_MODULES = [
  'overview',
  'fiche',
  'docs',
  'drive',
  'data-room',
  'tasks',
  'agenda',
  'notes',
  'sheet',
  'team',
  'ai',
  'emails',
];

const ACCOUNT_PAGES = [
  ['home', '/home'],
  ['settings', '/settings'],
  ['team', '/team'],
  ['roles', '/roles'],
  ['permissions', '/permissions'],
  ['sharing', '/sharing'],
  ['drive', '/drive'],
  ['agenda', '/agenda'],
  ['tasks', '/tasks'],
  ['notes', '/notes'],
  ['chat', '/chat'],
  ['mailbox-inbox', '/mailbox/inbox'],
  ['app-presets', '/app-presets'],
  ['entity-settings', '/entity/settings'],
];

const ENTITY_SLUGS = ['projet', 'contacts', 'entreprises', 'opportunites', 'produits'];

function ensureArtifacts() {
  fs.mkdirSync(ARTIFACT_DIR, { recursive: true });
}

function safeName(value) {
  return String(value).replace(/[^a-z0-9_.-]+/gi, '_').replace(/^_+|_+$/g, '').slice(0, 130);
}

function matchesFilters(pageDef) {
  if (!PAGE_FILTER.length) return true;
  return PAGE_FILTER.some(filter => pageDef.key.includes(filter) || pageDef.url.includes(filter));
}

function makePassword() {
  return `Qa-${crypto.randomBytes(12).toString('base64url')}-9a!`;
}

async function setupQaUser() {
  await mongoose.connect(dbConfig.globalDbUri, { useNewUrlParser: true });

  const account = await Account.findOne({ account_number: ACCOUNT_NUMBER });
  if (!account) {
    throw new Error(`Workspace ${ACCOUNT_NUMBER} introuvable`);
  }

  const email = `qa-responsive-${Date.now()}-${crypto.randomBytes(4).toString('hex')}@dexio.local`;
  const password = makePassword();

  await Account.updateOne(
    { account_number: ACCOUNT_NUMBER },
    { $pull: { users: { email } } }
  );

  const user = await User.create({
    email,
    password,
    name: 'QA Responsive',
    role: 'user',
    status: 'active',
    authProvider: 'local',
    emailVerified: true,
    accounts: [{
      account_number: account.account_number,
      name: account.name,
      icon: account.icon,
      role: 'admin',
      joinedAt: new Date(),
    }],
  });

  await Account.updateOne(
    { account_number: ACCOUNT_NUMBER },
    {
      $push: {
        users: {
          userId: String(user._id),
          email,
          role: 'admin',
          status: 'active',
          joinedAt: new Date(),
        },
      },
    }
  );

  return { email, password, userId: String(user._id) };
}

async function cleanupQaUser(qaUser) {
  if (!qaUser?.email) return;
  try {
    await Account.updateOne(
      { account_number: ACCOUNT_NUMBER },
      { $pull: { users: { email: qaUser.email } } }
    );
    await User.deleteOne({ email: qaUser.email });
  } catch (error) {
    console.error(`[cleanup] ${error.message}`);
  }
}

async function discoverPages() {
  const tenantConn = await mongoose.createConnection(dbConfig.tenantDbUri(ACCOUNT_NUMBER), {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  }).asPromise();

  try {
    const Entity = tenantConn.model('Entity', mongoose.model('Entity').schema);
    const Record = tenantConn.model('Record', mongoose.model('Record').schema);

    const pages = ACCOUNT_PAGES.map(([key, suffix]) => ({
      key,
      url: `${BASE_URL}/account/${ACCOUNT_NUMBER}${suffix}`,
      type: 'account',
    }));

    const entities = await Entity.find({ slug: { $in: ENTITY_SLUGS } })
      .select('_id slug name')
      .lean();

    const entitiesBySlug = Object.fromEntries(entities.map(entity => [entity.slug, entity]));
    for (const slug of ENTITY_SLUGS) {
      if (!entitiesBySlug[slug]) continue;
      pages.push({
        key: `record-${slug}-list`,
        url: `${BASE_URL}/account/${ACCOUNT_NUMBER}/record/${slug}/list`,
        type: 'record-list',
      });
    }

    if (entitiesBySlug.projet) {
      pages.push({
        key: 'record-projet-add',
        url: `${BASE_URL}/account/${ACCOUNT_NUMBER}/record/projet/add`,
        type: 'record-form',
      });
      pages.push({
        key: 'record-projet-edit',
        url: `${BASE_URL}/account/${ACCOUNT_NUMBER}/record/projet/${TARGET_PROJECT_ID}/edit`,
        type: 'record-form',
      });
    }

    const targetProject = await Record.findById(TARGET_PROJECT_ID).select('_id entityId title').lean();
    const projectEntity = targetProject?.entityId
      ? await Entity.findById(targetProject.entityId).select('slug').lean()
      : null;
    const projectSlug = projectEntity?.slug || 'projet';

    if (targetProject) {
      for (const moduleName of RECORD_MODULES) {
        pages.push({
          key: `record-project-${moduleName}`,
          url: `${BASE_URL}/account/${ACCOUNT_NUMBER}/record/${projectSlug}/${targetProject._id}/${moduleName}`,
          type: 'record-module',
        });
      }
    }

    return pages;
  } finally {
    await tenantConn.close();
  }
}

function shouldIgnoreConsole(text) {
  if (/^Failed to load resource: the server responded with a status of (400|404)/.test(String(text || ''))) {
    return true;
  }
  return [
    'cdn.jsdelivr.net',
    'fonts.googleapis.com',
    'fonts.gstatic.com',
    'Failed to load resource: net::ERR_BLOCKED_BY_CLIENT',
    'favicon.ico',
  ].some(pattern => String(text || '').includes(pattern));
}

function shouldIgnoreRequest(url) {
  return [
    'fonts.googleapis.com',
    'fonts.gstatic.com',
    'cdn.jsdelivr.net',
    'favicon.ico',
  ].some(pattern => String(url || '').includes(pattern));
}

async function login(page, qaUser) {
  await page.goto(`${BASE_URL}/auth/login`, { waitUntil: 'domcontentloaded', timeout: 20000 });
  await page.waitForSelector('#email', { timeout: 10000 });
  await page.type('#email', qaUser.email);
  await page.type('#password', qaUser.password);
  await Promise.all([
    page.click('button[type="submit"]'),
    page.waitForNavigation({ waitUntil: 'networkidle2', timeout: 25000 }).catch(() => null),
  ]);

  if (page.url().includes('/auth/login')) {
    throw new Error('Connexion QA échouée: retour sur /auth/login');
  }
}

async function gotoWithFallback(page, url) {
  let response = null;
  let navigationWarning = '';
  try {
    response = await page.goto(url, { waitUntil: 'networkidle2', timeout: 30000 });
  } catch (error) {
    navigationWarning = error.message;
    try {
      response = await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 15000 });
    } catch (fallbackError) {
      return { response: null, navigationError: fallbackError.message, navigationWarning };
    }
  }
  return { response, navigationError: '', navigationWarning };
}

async function waitForSettledUi(page) {
  await page.waitForFunction(() => {
    const loader = document.querySelector('.screen_loader');
    if (!loader) return true;
    const style = window.getComputedStyle(loader);
    return style.display === 'none' || style.visibility === 'hidden' || Number(style.opacity) === 0;
  }, { timeout: 6000 }).catch(() => null);
  await new Promise(resolve => setTimeout(resolve, 750));
}

async function collectResponsiveMetrics(page) {
  return page.evaluate(() => {
    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight;
    const documentElement = document.documentElement;
    const body = document.body;
    const scrollWidth = Math.max(documentElement.scrollWidth, body ? body.scrollWidth : 0);
    const scrollHeight = Math.max(documentElement.scrollHeight, body ? body.scrollHeight : 0);
    const ignoredSelectors = [
      '.overflow-x-auto',
      '.overflow-x-scroll',
      '.table-responsive',
      '.dataTables_scroll',
      '.dataTables_scrollBody',
      '.sheet-grid-viewport',
      '.sheet-grid-scroller',
      '.sheet-grid-body',
      '.sheet-canvas',
      '.record-sheet-grid',
      '.record-sheet-grid-shell',
      '.ql-editor',
      'pre',
      'code',
      'table',
      'canvas',
      'svg',
    ];

    const isVisible = (el) => {
      if (!el || !(el instanceof HTMLElement)) return false;
      if (el.closest('[hidden], [x-cloak], .hidden')) return false;
      const hiddenFixedPanel = el.closest('.sidebar, nav.fixed, aside.fixed, [data-responsive-offcanvas]');
      if (hiddenFixedPanel) {
        const panelRect = hiddenFixedPanel.getBoundingClientRect();
        const panelStyle = window.getComputedStyle(hiddenFixedPanel);
        if (panelStyle.position === 'fixed' && (panelRect.right <= 1 || panelRect.left >= viewportWidth - 1)) {
          return false;
        }
      }
      const style = window.getComputedStyle(el);
      if (
        style.display === 'none' ||
        style.visibility === 'hidden' ||
        Number(style.opacity) === 0 ||
        style.pointerEvents === 'none' && style.position === 'fixed' && style.transform.includes('translate')
      ) {
        return false;
      }
      const rect = el.getBoundingClientRect();
      return rect.width > 1 && rect.height > 1 && rect.bottom > 0 && rect.top < viewportHeight;
    };

    const hasScrollableAncestor = (el) => {
      let current = el;
      while (current && current !== document.body && current !== documentElement) {
        if (ignoredSelectors.some(selector => current.matches?.(selector))) return true;
        const style = window.getComputedStyle(current);
        const overflowX = style.overflowX;
        if ((overflowX === 'auto' || overflowX === 'scroll') && current.scrollWidth > current.clientWidth + 6) {
          return true;
        }
        current = current.parentElement;
      }
      return false;
    };

    const describe = (el) => {
      const rect = el.getBoundingClientRect();
      const classes = String(el.className || '')
        .split(/\s+/)
        .filter(Boolean)
        .slice(0, 4)
        .join('.');
      const text = String(el.innerText || el.value || '')
        .replace(/\s+/g, ' ')
        .trim()
        .slice(0, 90);
      return {
        tag: el.tagName.toLowerCase(),
        id: el.id || '',
        className: classes ? `.${classes}` : '',
        text,
        left: Math.round(rect.left),
        right: Math.round(rect.right),
        width: Math.round(rect.width),
        height: Math.round(rect.height),
      };
    };

    const allElements = Array.from(document.body.querySelectorAll('*')).filter(isVisible);
    const wideElements = [];
    const offscreenElements = [];
    const textOverflow = [];

    for (const el of allElements) {
      const rect = el.getBoundingClientRect();
      if (hasScrollableAncestor(el)) continue;
      if (rect.width > viewportWidth + 8) {
        wideElements.push(describe(el));
      }
      if (rect.left < -8 || rect.right > viewportWidth + 8) {
        offscreenElements.push(describe(el));
      }
      const style = window.getComputedStyle(el);
      const isTextControl = el.matches('button, a, input, select, textarea, .btn, [role="button"], label');
      if (
        isTextControl &&
        style.whiteSpace !== 'normal' &&
        el.scrollWidth > el.clientWidth + 3 &&
        el.clientWidth > 0
      ) {
        textOverflow.push(describe(el));
      }
    }

    const activePageWidthIssues = allElements
      .filter(el => !hasScrollableAncestor(el))
      .map(el => el.getBoundingClientRect())
      .filter(rect => rect.right > viewportWidth + 8 || rect.left < -8)
      .length;

    return {
      title: document.title,
      viewportWidth,
      viewportHeight,
      scrollWidth,
      scrollHeight,
      pageOverflowX: Math.max(0, scrollWidth - viewportWidth),
      activePageWidthIssues,
      wideElements: wideElements.slice(0, 12),
      offscreenElements: offscreenElements.slice(0, 12),
      textOverflow: textOverflow.slice(0, 12),
    };
  });
}

function hasIssue(result) {
  return Boolean(
    result.navigationError ||
    result.redirectedToLogin ||
    result.httpStatus >= 400 ||
    result.metrics?.pageOverflowX > 8 ||
    result.metrics?.activePageWidthIssues > 0 ||
    result.consoleErrors.length ||
    result.pageErrors.length
  );
}

async function auditPage(page, pageDef, viewport, eventBucket) {
  await page.setViewport({ width: viewport.width, height: viewport.height, deviceScaleFactor: 1 });
  eventBucket.consoleErrors = [];
  eventBucket.pageErrors = [];
  eventBucket.requestFailures = [];

  const { response, navigationError, navigationWarning } = await gotoWithFallback(page, pageDef.url);
  await waitForSettledUi(page);

  const metrics = navigationError ? null : await collectResponsiveMetrics(page);
  const result = {
    page: pageDef.key,
    type: pageDef.type,
    viewport: viewport.key,
    url: pageDef.url,
    finalUrl: page.url(),
    httpStatus: response?.status?.() || 0,
    navigationError,
    navigationWarning,
    redirectedToLogin: page.url().includes('/auth/login'),
    consoleErrors: [...eventBucket.consoleErrors],
    pageErrors: [...eventBucket.pageErrors],
    requestFailures: [...eventBucket.requestFailures],
    metrics,
    screenshot: '',
  };

  if (hasIssue(result)) {
    const screenshotName = `${safeName(viewport.key)}__${safeName(pageDef.key)}.png`;
    const screenshotPath = path.join(ARTIFACT_DIR, screenshotName);
    await page.screenshot({ path: screenshotPath, fullPage: false }).catch(() => null);
    result.screenshot = screenshotPath;
  }

  return result;
}

async function main() {
  ensureArtifacts();

  let qaUser = null;
  let browser = null;
  const report = {
    account: ACCOUNT_NUMBER,
    baseUrl: BASE_URL,
    generatedAt: new Date().toISOString(),
    viewports: VIEWPORTS,
    pages: [],
    results: [],
    summary: {},
  };

  try {
    qaUser = await setupQaUser();
    const pages = (await discoverPages()).filter(matchesFilters);
    const viewports = VIEWPORT_FILTER.size
      ? VIEWPORTS.filter(viewport => VIEWPORT_FILTER.has(viewport.key))
      : VIEWPORTS;
    report.pages = pages;
    report.viewports = viewports;

    browser = await puppeteer.launch({
      headless: 'new',
      args: ['--no-sandbox', '--disable-setuid-sandbox'],
      defaultViewport: { width: 1440, height: 900 },
    });

    const page = await browser.newPage();
    page.setDefaultTimeout(12000);
    page.setDefaultNavigationTimeout(30000);

    const eventBucket = { consoleErrors: [], pageErrors: [], requestFailures: [] };
    page.on('console', (msg) => {
      const text = msg.text();
      if (msg.type() === 'error' && !shouldIgnoreConsole(text)) {
        eventBucket.consoleErrors.push(text.slice(0, 500));
      }
    });
    page.on('pageerror', (error) => {
      eventBucket.pageErrors.push(error.message.slice(0, 500));
    });
    page.on('requestfailed', (request) => {
      const url = request.url();
      if (shouldIgnoreRequest(url)) return;
      const type = request.resourceType();
      if (!['document', 'script', 'stylesheet', 'xhr', 'fetch'].includes(type)) return;
      eventBucket.requestFailures.push(`${type} ${url} ${request.failure()?.errorText || ''}`.slice(0, 500));
    });

    await login(page, qaUser);

    for (const viewport of viewports) {
      for (const pageDef of pages) {
        const result = await auditPage(page, pageDef, viewport, eventBucket);
        report.results.push(result);
        const status = hasIssue(result) ? 'ISSUE' : 'ok';
        const overflow = result.metrics ? `${result.metrics.pageOverflowX}px` : 'n/a';
        console.log(`[${status}] ${viewport.key.padEnd(7)} ${pageDef.key.padEnd(26)} status=${result.httpStatus} overflow=${overflow}`);
      }
    }

    const issues = report.results.filter(hasIssue);
    report.summary = {
      total: report.results.length,
      passed: report.results.length - issues.length,
      issues: issues.length,
      byViewport: Object.fromEntries(viewports.map(viewport => [
        viewport.key,
        {
          total: report.results.filter(result => result.viewport === viewport.key).length,
          issues: report.results.filter(result => result.viewport === viewport.key && hasIssue(result)).length,
        },
      ])),
      issuePages: issues.map(result => ({
        page: result.page,
        viewport: result.viewport,
        status: result.httpStatus,
        overflow: result.metrics?.pageOverflowX || 0,
        activePageWidthIssues: result.metrics?.activePageWidthIssues || 0,
        consoleErrors: result.consoleErrors.length,
        pageErrors: result.pageErrors.length,
        navigationError: result.navigationError,
        screenshot: result.screenshot,
      })),
    };

    fs.writeFileSync(RESULT_PATH, JSON.stringify(report, null, 2));
    console.log(`\nReport: ${RESULT_PATH}`);
    console.log(`Summary: ${report.summary.passed}/${report.summary.total} ok, ${report.summary.issues} issue(s)`);

    if (issues.length) {
      process.exitCode = 1;
    }
  } finally {
    if (browser) await browser.close().catch(() => null);
    await cleanupQaUser(qaUser);
    await mongoose.disconnect().catch(() => null);
  }
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
