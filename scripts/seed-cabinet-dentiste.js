const fs = require('fs');
const path = require('path');
const mongoose = require('mongoose');
const { install: installMedical } = require('./seed-cabinet-medical');

const PRESET = 'cabinet-dentiste';

function normalizeMojibake(str) {
  if (!str) return '';
  const s = String(str);
  if (!/[ÃÂâð]/.test(s)) return s;
  try {
    return Buffer.from(s, 'latin1').toString('utf8');
  } catch (_) {
    return s;
  }
}

function stripTags(html) {
  return String(html || '')
    .replace(/<[^>]+>/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function decodeEntities(str) {
  return String(str || '')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>');
}

function extractCards(htmlRaw) {
  const html = normalizeMojibake(htmlRaw);
  const articles = html.match(/<article class="card[\s\S]*?<\/article>/g) || [];

  return articles.map((article, idx) => {
    const pick = (re) => {
      const m = article.match(re);
      return m ? decodeEntities(stripTags(m[1])) : '';
    };

    const code = pick(/<div class="card-code">([\s\S]*?)<\/div>/i);
    const tarifRaw = pick(/<div class="card-tarif">([\s\S]*?)<\/div>/i).replace(/Dh/i, '').trim();
    const category = pick(/<div class="card-category">([\s\S]*?)<\/div>/i);
    const title = pick(/<h3 class="card-title">([\s\S]*?)<\/h3>/i);
    const remarks = pick(/<p class="card-remarks">([\s\S]*?)<\/p>/i);
    const cotation = pick(/<div class="card-cotation"><span>([\s\S]*?)<\/span><\/div>/i);

    const priceHt = Number((tarifRaw || '').replace(/[^\d.,]/g, '').replace(',', '.')) || 0;
    const description = remarks || title;

    return {
      _idx: idx,
      code: code || `ACT-${idx + 1}`,
      category: category || 'Acte dentaire',
      title: title || `Acte dentaire ${idx + 1}`,
      description,
      cotation,
      priceHt,
      vatRate: 0
    };
  }).filter(a => a.code && a.title);
}

function registerModels(conn) {
  const s = (def) => new mongoose.Schema(def, { timestamps: true, strict: false });
  const M = (name, schema, coll) => {
    try { return conn.model(name); } catch (_) { return conn.model(name, schema, coll); }
  };

  return {
    Entity: M('Entity', s({}), 'entities'),
    Record: M('Record', s({}), 'records'),
    LineSchema: M('LineSchema', s({}), 'lineschemas'),
    View: M('View', s({}), 'views'),
    GridSchemaTemplate: M('GridSchemaTemplate', s({}), 'gridschematemplates'),
    Space: M('Space', s({}), 'spaces')
  };
}

async function upsertActesEntity(db) {
  const existing = await db.Entity.findOne({ slug: 'actes' });
  if (existing) return existing;

  return db.Entity.create({
    name: 'Actes',
    slug: 'actes',
    description: 'Nomenclature des actes dentaires avec tarifs',
    icon: 'solar:tooth-bold-duotone',
    color: '#0ea5e9',
    order: 40,
    enabledStandardFields: ['title', 'description', 'status'],
    customFields: [],
    meta: { createdByPreset: PRESET, isDemo: true }
  });
}

async function seedActesRecords(db, actesEntityId, acts, schemaIds = {}) {
  const schemaDefaults = [
    schemaIds.billingSchemaId,
    schemaIds.quoteSchemaId,
    schemaIds.invoiceSchemaId
  ].filter(Boolean);

  const ops = acts.map((a, i) => ({
    updateOne: {
      filter: { entityId: actesEntityId, 'meta.code': a.code },
      update: {
        $set: {
          title: `${a.code} - ${a.title}`,
          description: a.description,
          status: 'active',
          date: new Date(),
          customFields: [
            { key: 'code', value: a.code },
            { key: 'categorie', value: a.category },
            { key: 'prix_ht', value: a.priceHt },
            { key: 'tva', value: a.vatRate },
            { key: 'cotation', value: a.cotation }
          ],
          lineDefaults: schemaDefaults.map(schemaId => ({
            schemaId,
            defaults: {
              description: a.title,
              code: a.code,
              qty: 1,
              unitPrice: a.priceHt,
              vatRate: a.vatRate
            }
          })),
          meta: {
            createdByPreset: PRESET,
            isDemo: true,
            code: a.code,
            category: a.category,
            source: 'Data source/Nomenclature.html',
            rowIndex: i
          }
        }
      },
      upsert: true
    }
  }));

  if (ops.length > 0) {
    await db.Record.bulkWrite(ops, { ordered: false });
  }
}

async function configureSingleConsultationTD(db, actesEntity, actsCount) {
  const consultations = await db.Entity.findOne({ slug: 'consultations' });
  if (!consultations) throw new Error('Entity consultations introuvable');

  const treatmentSchema = await db.LineSchema.findOne({ slug: 'consultation_treatment_v1' });
  const billingSchema = await db.LineSchema.findOne({ slug: 'consultation_billing_v1' });
  if (!billingSchema) throw new Error('LineSchema consultation_billing_v1 introuvable');
  let examSchema = await db.LineSchema.findOne({ slug: 'consultation_exams_v1' });
  let invoiceSchema = await db.LineSchema.findOne({ slug: 'invoice_v1' });

  const cols = Array.isArray(billingSchema.columns) ? JSON.parse(JSON.stringify(billingSchema.columns)) : [];
  const normalizedCols = cols.map((c) => {
    if (c.key !== 'prestation') return c;
    return {
      ...c,
      label: 'Acte',
      config: {
        ...(c.config || {}),
        targetEntity: actesEntity._id,
        searchFields: ['title', 'description'],
        displayFields: ['title'],
        displayField: 'title'
      }
    };
  });

  // Keep billing schema as a reusable quote/facture base tied to Actes.
  await db.LineSchema.updateOne(
    { _id: billingSchema._id },
    {
      $set: {
        name: 'Lignes Actes (Base)',
        description: `Base devis/facture sur Actes (${actsCount} actes)`,
        sourceEntityId: actesEntity._id,
        columns: normalizedCols
      }
    }
  );

  // Ensure quote schema exists for dental flow
  let quoteSchema = await db.LineSchema.findOne({ slug: 'quote_v1' });
  if (!quoteSchema && invoiceSchema) {
    quoteSchema = await db.LineSchema.create({
      name: 'Devis',
      slug: 'quote_v1',
      description: 'Lignes de devis dentaires',
      appliesTo: { entityIds: [consultations._id], documentType: 'record' },
      sourceEntityId: actesEntity._id,
      lineTypes: invoiceSchema.lineTypes || ['service', 'note'],
      columns: JSON.parse(JSON.stringify(normalizedCols || [])),
      totals: invoiceSchema.totals || { subtotalKey: 'lineTotal', vatKey: 'lineVat', totalFormula: 'subtotal + vat' },
      defaultLineType: invoiceSchema.defaultLineType || 'service',
      inputMode: invoiceSchema.inputMode || 'catalog',
      dataMode: invoiceSchema.dataMode || 'items',
      meta: { createdByPreset: PRESET, isDemo: true }
    });
  }

  // Force quote schema columns to use relation with Actes
  if (quoteSchema) {
    await db.LineSchema.updateOne(
      { _id: quoteSchema._id },
      {
        $set: {
          sourceEntityId: actesEntity._id,
          columns: JSON.parse(JSON.stringify(normalizedCols || []))
        }
      }
    );
  }

  // Force invoice schema columns to use relation with Actes
  if (invoiceSchema) {
    await db.LineSchema.updateOne(
      { _id: invoiceSchema._id },
      {
        $set: {
          sourceEntityId: actesEntity._id,
          columns: JSON.parse(JSON.stringify(normalizedCols || []))
        }
      }
    );
    invoiceSchema = await db.LineSchema.findById(invoiceSchema._id);
  }

  // Simplify exam TD: Examen + Commentaire only
  if (examSchema) {
    const examRelCol = (examSchema.columns || []).find(c => c.key === 'exam' && c.type === 'relation')
      || {
        key: 'exam',
        label: 'Examen',
        type: 'relation',
        required: true,
        visible: true,
        width: 'L',
        order: 0,
        showWhen: { lineType: ['exam'] },
        config: { searchFields: ['title', 'description'], displayField: 'title' }
      };
    const commentCol = (examSchema.columns || []).find(c => c.key === 'comment')
      || {
        key: 'comment',
        label: 'Commentaire',
        type: 'textarea',
        required: false,
        visible: true,
        width: 'XL',
        order: 1,
        showWhen: { lineType: ['exam', 'note'] },
        config: {}
      };

    await db.LineSchema.updateOne(
      { _id: examSchema._id },
      {
        $set: {
          name: 'Examens à réaliser',
          columns: [
            { ...examRelCol, label: 'Examen', visible: true, order: 0 },
            { ...commentCol, label: 'Commentaire', visible: true, order: 1 }
          ]
        }
      }
    );
    examSchema = await db.LineSchema.findById(examSchema._id);
  }

  // Keep only required tabs on consultation: Traitements, Examin, Devis, Facture
  const gridSchemas = [];
  if (treatmentSchema?._id) gridSchemas.push({ schemaId: treatmentSchema._id, position: 'main', order: 0, label: 'Traitements' });
  if (examSchema?._id) gridSchemas.push({ schemaId: examSchema._id, position: 'main', order: 1, label: 'Examin' });
  if (quoteSchema?._id) gridSchemas.push({ schemaId: quoteSchema._id, position: 'main', order: 2, label: 'Devis' });
  if (invoiceSchema?._id) gridSchemas.push({ schemaId: invoiceSchema._id, position: 'main', order: 3, label: 'Facture' });

  await db.Entity.updateOne(
    { _id: consultations._id },
    {
      $set: {
        gridSchemas,
        // Keep sidebar clean by default; main TD is rendered under consultation fields.
        sidebarWidgets: [],
        classifications: [],
        statusClassification: null,
        enableAttachments: false
      }
    }
  );

  // Remove treatment duplicates from secondary entities for dentist preset
  await db.Entity.updateOne({ slug: 'patients' }, { $set: { gridSchemas: [] } });
  await db.Entity.updateOne({ slug: 'prescriptions' }, { $set: { gridSchemas: [] } });

  const treatmentsEntity = await db.Entity.findOne({ slug: 'traitements' }).select('_id').lean();
  const treatmentViewWithSpace = treatmentsEntity?._id
    ? await db.View.findOne({ entity: treatmentsEntity._id, spaces: { $exists: true, $ne: [] } }).select('spaces').lean()
    : null;
  const preferredSpaces = Array.isArray(treatmentViewWithSpace?.spaces) ? treatmentViewWithSpace.spaces : [];

  const actesViewSlug = 'catalogue-actes-dentaires';
  await db.View.updateOne(
    { slug: actesViewSlug },
    {
      $set: {
        name: 'Catalogue Actes Dentaires',
        slug: actesViewSlug,
        entity: actesEntity._id,
        icon: 'solar:tooth-bold-duotone',
        color: '#0ea5e9',
        viewType: 'list',
        spaces: preferredSpaces,
        order: 8,
        filters: [],
        settings: { layout: 'table', dense: false },
        meta: { createdByPreset: PRESET, isDemo: true }
      }
    },
    { upsert: true }
  );

  // Expose Actes entity in same clinical space for sidebar navigation
  if (preferredSpaces.length > 0) {
    await db.Entity.updateOne(
      { _id: actesEntity._id },
      { $addToSet: { spaces: { $each: preferredSpaces } } }
    );
  }

  return {
    consultationsEntityId: consultations._id.toString(),
    patientRelationKey: 'consultations__patients',
    treatmentSchemaId: treatmentSchema?._id?.toString() || null,
    examSchemaId: examSchema?._id?.toString() || null,
    billingSchemaId: billingSchema._id.toString(),
    quoteSchemaId: quoteSchema?._id?.toString() || null,
    invoiceSchemaId: invoiceSchema?._id?.toString() || null
  };
}

async function configureClinicalViews(db) {
  const clinic = await db.Space.findOne({ slug: 'activite-clinique' }).select('_id').lean();
  if (!clinic?._id) return;

  const [examensEntity, resultatsEntity, actesEntity, traitementsEntity] = await Promise.all([
    db.Entity.findOne({ slug: 'examens' }).select('_id').lean(),
    db.Entity.findOne({ slug: 'resultats-labo' }).select('_id').lean(),
    db.Entity.findOne({ slug: 'actes' }).select('_id').lean(),
    db.Entity.findOne({ slug: 'traitements' }).select('_id').lean()
  ]);

  // Remove "Examens" view tied to resultats-labo from clinical sidebar
  if (resultatsEntity?._id) {
    await db.View.updateMany(
      { entity: resultatsEntity._id, spaces: clinic._id },
      { $pull: { spaces: clinic._id } }
    );
  }

  // Rename "Catalogue examens" -> "Examens"
  if (examensEntity?._id) {
    await db.View.updateMany(
      { entity: examensEntity._id, spaces: clinic._id },
      {
        $set: {
          name: 'Examens',
          icon: 'solar:vial-bold-duotone',
          order: 4
        }
      }
    );
  }

  // Rename "Catalogue Actes Dentaires" -> "Actes"
  if (actesEntity?._id) {
    await db.View.updateMany(
      { entity: actesEntity._id },
      {
        $set: {
          name: 'Actes',
          icon: 'solar:tooth-bold-duotone',
          color: '#0ea5e9',
          order: 8,
          spaces: [clinic._id]
        }
      }
    );
  }

  // Keep treatments just after Actes
  if (traitementsEntity?._id) {
    await db.View.updateMany(
      { entity: traitementsEntity._id, spaces: clinic._id },
      { $set: { order: 9 } }
    );
  }
}

async function seedTreatmentPresets(db, schemaIds, userId) {
  if (!schemaIds?.treatmentSchemaId) return;
  const treatmentSchemaId = new mongoose.Types.ObjectId(schemaIds.treatmentSchemaId);

  const treatmentEntity = await db.Entity.findOne({ slug: 'traitements' }).select('_id').lean();
  if (!treatmentEntity?._id) return;

  const treatments = await db.Record.find({ entityId: treatmentEntity._id }).select('_id title').lean();
  const pick = (rx) => treatments.find(t => rx.test(String(t.title || '')));

  const doliprane = pick(/doliprane/i) || treatments[0];
  const tramadol = pick(/tramadol/i) || treatments[1] || treatments[0];
  const amlodipine = pick(/amlodipine/i) || treatments[2] || treatments[0];

  const mkRow = (record, moment, frequency, duration, instructions, order) => ({
    lineType: 'medication',
    order,
    values: {
      treatment: record?._id || null,
      treatment_label: record?.title || '',
      moment: Array.isArray(moment) ? moment : [moment],
      frequency: Array.isArray(frequency) ? frequency : [frequency],
      duration: Array.isArray(duration) ? duration : [duration],
      instructions
    }
  });

  const presets = [
    {
      slug: 'protocole_grippe_dentiste',
      name: 'Protocole Grippe',
      description: 'Schéma standard grippe / syndrome viral',
      icon: 'solar:mask-happly-bold-duotone',
      color: '#06b6d4',
      presetRows: [
        mkRow(doliprane, ['matin', 'soir'], ['2x_jour'], ['5_jours'], 'Hydratation + repos. Prendre après repas.', 0)
      ]
    },
    {
      slug: 'protocole_angine_dentiste',
      name: 'Protocole Angine',
      description: 'Schéma symptomatique ORL',
      icon: 'solar:stethoscope-bold-duotone',
      color: '#3b82f6',
      presetRows: [
        mkRow(doliprane, ['matin', 'midi', 'soir'], ['3x_jour'], ['7_jours'], 'Antalgique/antipyrétique; surveiller fièvre.', 0),
        mkRow(tramadol, ['soir'], ['1x_jour'], ['3_jours'], 'Si douleur importante uniquement.', 1)
      ]
    },
    {
      slug: 'protocole_sinusite_dentiste',
      name: 'Protocole Sinusite',
      description: 'Schéma court avec suivi',
      icon: 'solar:health-bold-duotone',
      color: '#22c55e',
      presetRows: [
        mkRow(doliprane, ['matin', 'soir'], ['2x_jour'], ['7_jours'], 'Lavage nasal + antalgique.', 0),
        mkRow(amlodipine, ['soir'], ['1x_jour'], ['7_jours'], 'Adapter si comorbidités HTA.', 1)
      ]
    }
  ];

  for (const p of presets) {
    await db.GridSchemaTemplate.findOneAndUpdate(
      { slug: p.slug, schemaId: treatmentSchemaId },
      {
        $set: {
          name: p.name,
          slug: p.slug,
          description: p.description,
          icon: p.icon,
          color: p.color,
          schemaId: treatmentSchemaId,
          scope: 'workspace',
          presetRows: p.presetRows,
          tags: ['dentiste', 'traitements', 'preset'],
          createdBy: userId ? new mongoose.Types.ObjectId(userId) : undefined,
          meta: { createdByPreset: PRESET, isDemo: true }
        }
      },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );
  }
}

async function seedExamPresets(db, schemaIds, userId) {
  if (!schemaIds?.examSchemaId) return;
  const examSchemaId = new mongoose.Types.ObjectId(schemaIds.examSchemaId);

  const examEntity = await db.Entity.findOne({ slug: 'examens' }).select('_id').lean();
  if (!examEntity?._id) return;
  const exams = await db.Record.find({ entityId: examEntity._id }).select('_id title').lean();
  const pick = (rx) => exams.find(e => rx.test(String(e.title || '')));

  const tsh = pick(/tsh/i) || exams[0];
  const hba1c = pick(/hba1c|hba 1c|hemoglobine glyquee/i) || exams[1] || exams[0];
  const ferritine = pick(/ferritine/i) || exams[2] || exams[0];
  const nfs = pick(/\bnfs\b|hemogramme/i) || exams[3] || exams[0];

  const mkExamRow = (record, comment, order) => ({
    lineType: 'exam',
    order,
    values: {
      exam: record?._id || null,
      exam_label: record?.title || '',
      comment
    }
  });

  const presets = [
    {
      slug: 'preset_bilan_general_dentiste',
      name: 'Bilan général',
      description: 'Bilan biologique de base',
      icon: 'solar:test-tube-bold-duotone',
      color: '#6366f1',
      presetRows: [
        mkExamRow(nfs, 'Contrôle de base avant prise en charge.', 0),
        mkExamRow(ferritine, 'Vérifier statut martial.', 1)
      ]
    },
    {
      slug: 'preset_suivi_thyroide_dentiste',
      name: 'Suivi Tyroide',
      description: 'Suivi thyroïdien standard',
      icon: 'solar:health-bold-duotone',
      color: '#06b6d4',
      presetRows: [
        mkExamRow(tsh, 'Suivi thyroïde: dosage de contrôle.', 0)
      ]
    },
    {
      slug: 'preset_suivi_diabete_dentiste',
      name: 'Suivi diabète',
      description: 'Bilan glycémique de suivi',
      icon: 'solar:heart-pulse-bold-duotone',
      color: '#22c55e',
      presetRows: [
        mkExamRow(hba1c, 'Contrôle trimestriel du diabète.', 0)
      ]
    }
  ];

  for (const p of presets) {
    await db.GridSchemaTemplate.findOneAndUpdate(
      { slug: p.slug, schemaId: examSchemaId },
      {
        $set: {
          name: p.name,
          slug: p.slug,
          description: p.description,
          icon: p.icon,
          color: p.color,
          schemaId: examSchemaId,
          scope: 'workspace',
          presetRows: p.presetRows,
          tags: ['dentiste', 'examens', 'preset'],
          createdBy: userId ? new mongoose.Types.ObjectId(userId) : undefined,
          meta: { createdByPreset: PRESET, isDemo: true }
        }
      },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );
  }
}

async function setDefaultSidebarPrefs(conn, userId, schemaIds) {
  if (!userId || !schemaIds?.consultationsEntityId || !schemaIds?.patientRelationKey) return;
  const userObjectId = new mongoose.Types.ObjectId(userId);
  const viewId = `entity_${schemaIds.consultationsEntityId}_sidebar`;

  const sidebarPanels = {
    classifications: false,
    attachments: false,
    lines: false,
    smartdoc: true,
    [`rel_${schemaIds.patientRelationKey}`]: true
  };

  const UserPreferences = conn.db.collection('userpreferences');
  await UserPreferences.updateOne(
    { userId: userObjectId, viewId },
    {
      $set: {
        userId: userObjectId,
        viewId,
        updatedAt: new Date(),
        'preferences.sidebar_panels': sidebarPanels
      }
    },
    { upsert: true }
  );

  // Force sidebar order: patient card first, then documents models
  const panelViewId = `record_panels_${schemaIds.consultationsEntityId}`;
  const UserPanelPreferences = conn.db.collection('userpreferences');
  await UserPanelPreferences.updateOne(
    { userId: userObjectId, viewId: panelViewId },
    {
      $set: {
        userId: userObjectId,
        viewId: panelViewId,
        updatedAt: new Date(),
        'preferences.panelLayout.sidebarInner': [
          `relation-${schemaIds.patientRelationKey}`,
          'smartdoc'
        ]
      }
    },
    { upsert: true }
  );

  // Keep account-level fallback aligned with user-level prefs
  const accountMatch = String(conn.name || '').match(/saas_app_rb_(\d+)/);
  const accountId = accountMatch?.[1] || null;
  if (accountId) {
    const AccountPreferences = conn.db.collection('accountpreferences');
    await AccountPreferences.updateOne(
      { accountId, viewId: panelViewId },
      {
        $set: {
          accountId,
          viewId: panelViewId,
          updatedAt: new Date(),
          'preferences.panelLayout.sidebarInner': [
            `relation-${schemaIds.patientRelationKey}`,
            'smartdoc'
          ]
        },
        $setOnInsert: {
          createdAt: new Date()
        }
      },
      { upsert: true }
    );
  }
}

async function installDentiste(conn, userId) {
  await installMedical(conn, userId, PRESET);

  const db = registerModels(conn);
  const htmlPath = path.join(process.cwd(), 'Data source', 'Nomenclature.html');
  const html = fs.readFileSync(htmlPath, 'utf8');
  const acts = extractCards(html);

  if (acts.length === 0) {
    throw new Error('Aucun acte extrait depuis Data source/Nomenclature.html');
  }

  const actesEntity = await upsertActesEntity(db);
  const schemaIds = await configureSingleConsultationTD(db, actesEntity, acts.length);
  await seedActesRecords(db, actesEntity._id, acts, schemaIds);
  await configureClinicalViews(db);
  await seedTreatmentPresets(db, schemaIds, userId);
  await seedExamPresets(db, schemaIds, userId);
  await setDefaultSidebarPrefs(conn, userId, schemaIds);

  return { actsCount: acts.length, actesEntityId: actesEntity._id.toString() };
}

if (require.main === module) {
  (async () => {
    const tenantConn = mongoose.createConnection('mongodb://127.0.0.1:27017/saas_app_rb_9194');
    await new Promise(r => tenantConn.once('open', r));

    const globalConn = mongoose.createConnection('mongodb://127.0.0.1:27017/saasDemo');
    await new Promise(r => globalConn.once('open', r));
    const User = globalConn.model('User_med', new mongoose.Schema({}, { strict: false }), 'users');
    const user = await User.findOne({ email: 'boukirou6@hotmail.com' });
    await globalConn.close();

    if (!user) throw new Error('Utilisateur boukirou6@hotmail.com introuvable');

    const result = await installDentiste(tenantConn, user._id.toString());
    console.log(`✅ Seed dentiste terminé: ${result.actsCount} actes importés (entityId=${result.actesEntityId})`);

    await tenantConn.close();
    process.exit(0);
  })().catch(async (err) => {
    console.error('❌ Seed dentiste error:', err);
    process.exit(1);
  });
}

async function install(conn, userId, presetSlug) {
  return installDentiste(conn, userId, presetSlug);
}

module.exports = { installDentiste, install, extractCards };
