/**
 * Update seeded template documents with real professional medical content
 * Replaces placeholder "Ce document est un modèle" with proper layouts
 */
const mongoose = require('mongoose');

const DB_NAME = 'saas_app_rb_7846';

// ── Template Content Definitions ──
const templateContents = {
    'Consentement éclairé': {
        content: `<div style="font-family:'Segoe UI',Arial,sans-serif;max-width:100%;margin:0;padding:0;">
  <h1 style="margin:0 0 6px;font-size:20px;color:#22c55e;font-weight:700;text-transform:uppercase;letter-spacing:1px;">Consentement éclairé</h1>
  <div style="width:60px;height:3px;background:#22c55e;margin-bottom:20px;border-radius:2px;"></div>

  <div style="display:flex;justify-content:space-between;margin-bottom:20px;">
    <div>
      <p style="margin:0;font-size:13px;color:#64748b;">Patient : <strong style="color:#1e293b;">{{patients.patients.prenom}} {{patients.patients.nom}}</strong></p>
      <p style="margin:4px 0 0;font-size:13px;color:#64748b;">Date de naissance : <strong style="color:#1e293b;">{{patients.patients.dateNaissance}}</strong></p>
    </div>
    <div style="text-align:right;">
      <p style="margin:0;font-size:13px;color:#64748b;">Date : <strong style="color:#1e293b;">{{today}}</strong></p>
    </div>
  </div>

  <div style="background:#f0fdf4;border:1px solid #bbf7d0;border-radius:8px;padding:16px;margin-bottom:18px;">
    <p style="margin:0;font-size:13px;color:#166534;font-weight:600;">Nature de l'acte proposé :</p>
    <p style="margin:8px 0 0;font-size:13px;color:#1e293b;line-height:1.6;">_______________________________________________</p>
  </div>

  <p style="font-size:13px;line-height:1.7;color:#334155;margin:0 0 12px;">Je soussigné(e}, <strong>{{patients.patients.prenom}} {{patients.patients.nom}}</strong>, déclare avoir été informé(e) de manière claire et complète par le Dr. {{user.name}} sur :</p>

  <ul style="font-size:13px;line-height:1.8;color:#334155;padding-left:20px;margin:0 0 16px;">
    <li>La nature et le déroulement de l'acte envisagé</li>
    <li>Les bénéfices attendus et les alternatives thérapeutiques</li>
    <li>Les risques fréquents et graves normalement prévisibles</li>
    <li>Les conséquences prévisibles en cas de refus</li>
    <li>Les suites habituelles et les précautions à prendre</li>
  </ul>

  <p style="font-size:13px;line-height:1.7;color:#334155;margin:0 0 12px;">J'ai pu poser toutes les questions souhaitées et j'ai reçu des réponses adaptées. J'ai disposé d'un délai de réflexion suffisant.</p>

  <p style="font-size:13px;line-height:1.7;color:#334155;margin:0 0 20px;">En conséquence, je donne mon consentement libre et éclairé pour la réalisation de l'acte mentionné ci-dessus.</p>

  <div style="display:flex;justify-content:space-between;margin-top:30px;">
    <div style="width:45%;">
      <p style="font-size:12px;color:#64748b;margin:0 0 4px;">Fait à : ________________</p>
      <p style="font-size:12px;color:#64748b;margin:0 0 30px;">Le : {{today}}</p>
      <p style="font-size:12px;color:#64748b;margin:0;border-top:1px solid #cbd5e1;padding-top:6px;">Signature du patient</p>
    </div>
    <div style="width:45%;">
      <p style="font-size:12px;color:#64748b;margin:0 0 34px;">&nbsp;</p>
      <p style="font-size:12px;color:#64748b;margin:0;border-top:1px solid #cbd5e1;padding-top:6px;">Signature du praticien</p>
    </div>
  </div>
</div>`
    },

    'Fiche patient résumé': {
        content: `<div style="font-family:'Segoe UI',Arial,sans-serif;max-width:100%;margin:0;padding:0;">
  <div style="display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:16px;">
    <div>
      <h1 style="margin:0 0 4px;font-size:20px;color:#3b82f6;font-weight:700;">Fiche patient résumé</h1>
      <div style="width:50px;height:3px;background:#3b82f6;border-radius:2px;"></div>
    </div>
    <div style="text-align:right;">
      <p style="margin:0;font-size:12px;color:#94a3b8;">Édité le {{today}}</p>
    </div>
  </div>

  <div style="background:#eff6ff;border:1px solid #bfdbfe;border-radius:8px;padding:16px;margin-bottom:16px;">
    <div style="display:flex;gap:40px;">
      <div>
        <p style="margin:0 0 2px;font-size:11px;color:#3b82f6;font-weight:600;text-transform:uppercase;">Identité</p>
        <p style="margin:0;font-size:15px;color:#1e293b;font-weight:600;">{{patients.patients.prenom}} {{patients.patients.nom}}</p>
      </div>
      <div>
        <p style="margin:0 0 2px;font-size:11px;color:#3b82f6;font-weight:600;text-transform:uppercase;">Date de naissance</p>
        <p style="margin:0;font-size:14px;color:#1e293b;">{{patients.patients.dateNaissance}}</p>
      </div>
      <div>
        <p style="margin:0 0 2px;font-size:11px;color:#3b82f6;font-weight:600;text-transform:uppercase;">Téléphone</p>
        <p style="margin:0;font-size:14px;color:#1e293b;">{{patients.patients.telephone}}</p>
      </div>
    </div>
  </div>

  <table style="width:100%;border-collapse:collapse;font-size:13px;margin-bottom:16px;">
    <tr style="background:#f8fafc;">
      <td style="padding:10px 14px;color:#64748b;font-weight:600;width:35%;border-bottom:1px solid #e2e8f0;">Email</td>
      <td style="padding:10px 14px;color:#1e293b;border-bottom:1px solid #e2e8f0;">{{patients.patients.email}}</td>
    </tr>
    <tr>
      <td style="padding:10px 14px;color:#64748b;font-weight:600;border-bottom:1px solid #e2e8f0;">Adresse</td>
      <td style="padding:10px 14px;color:#1e293b;border-bottom:1px solid #e2e8f0;">{{patients.patients.adresse}}</td>
    </tr>
    <tr style="background:#f8fafc;">
      <td style="padding:10px 14px;color:#64748b;font-weight:600;border-bottom:1px solid #e2e8f0;">Groupe sanguin</td>
      <td style="padding:10px 14px;color:#1e293b;border-bottom:1px solid #e2e8f0;">{{patients.patients.groupeSanguin}}</td>
    </tr>
    <tr>
      <td style="padding:10px 14px;color:#64748b;font-weight:600;border-bottom:1px solid #e2e8f0;">Allergies</td>
      <td style="padding:10px 14px;color:#1e293b;border-bottom:1px solid #e2e8f0;">{{patients.patients.allergies}}</td>
    </tr>
    <tr style="background:#f8fafc;">
      <td style="padding:10px 14px;color:#64748b;font-weight:600;border-bottom:1px solid #e2e8f0;">Antécédents</td>
      <td style="padding:10px 14px;color:#1e293b;border-bottom:1px solid #e2e8f0;">{{patients.patients.antecedents}}</td>
    </tr>
  </table>

  <div style="background:#fefce8;border:1px solid #fde68a;border-radius:8px;padding:12px 16px;margin-bottom:12px;">
    <p style="margin:0;font-size:12px;color:#92400e;font-weight:600;">Notes du praticien :</p>
    <p style="margin:6px 0 0;font-size:13px;color:#78350f;line-height:1.6;">{{patients.patients.notes}}</p>
  </div>

  <p style="font-size:11px;color:#94a3b8;margin:20px 0 0;text-align:center;">Document confidentiel — Dr. {{user.name}}</p>
</div>`
    },

    'Attestation de présence': {
        content: `<div style="font-family:'Segoe UI',Arial,sans-serif;max-width:100%;margin:0;padding:0;">
  <h1 style="margin:0 0 6px;font-size:20px;color:#6366f1;font-weight:700;text-transform:uppercase;letter-spacing:1px;">Attestation de présence</h1>
  <div style="width:60px;height:3px;background:#6366f1;margin-bottom:24px;border-radius:2px;"></div>

  <p style="font-size:14px;line-height:1.8;color:#334155;margin:0 0 16px;">
    Je soussigné(e), <strong>Dr. {{user.name}}</strong>, certifie que :
  </p>

  <div style="background:#eef2ff;border-left:4px solid #6366f1;padding:16px 20px;border-radius:0 8px 8px 0;margin:0 0 20px;">
    <p style="margin:0;font-size:15px;color:#1e293b;font-weight:600;">{{patients.patients.prenom}} {{patients.patients.nom}}</p>
    <p style="margin:4px 0 0;font-size:13px;color:#64748b;">Né(e) le : {{patients.patients.dateNaissance}}</p>
  </div>

  <p style="font-size:14px;line-height:1.8;color:#334155;margin:0 0 8px;">
    s'est présenté(e) à mon cabinet le <strong>{{today}}</strong> pour une consultation médicale.
  </p>

  <p style="font-size:14px;line-height:1.8;color:#334155;margin:0 0 8px;">
    La consultation a eu lieu de ____h____ à ____h____ .
  </p>

  <p style="font-size:14px;line-height:1.8;color:#334155;margin:0 0 24px;">
    Cette attestation est délivrée pour servir et valoir ce que de droit.
  </p>

  <div style="margin-top:40px;">
    <p style="font-size:13px;color:#64748b;margin:0;">Fait à : ________________</p>
    <p style="font-size:13px;color:#64748b;margin:4px 0 0;">Le : {{today}}</p>
    <p style="font-size:13px;color:#64748b;margin:30px 0 0;border-top:1px solid #cbd5e1;padding-top:8px;display:inline-block;">Signature et cachet du praticien</p>
  </div>
</div>`
    },

    'Arrêt de travail': {
        content: `<div style="font-family:'Segoe UI',Arial,sans-serif;max-width:100%;margin:0;padding:0;">
  <h1 style="margin:0 0 6px;font-size:20px;color:#ef4444;font-weight:700;text-transform:uppercase;letter-spacing:1px;">Certificat d'arrêt de travail</h1>
  <div style="width:60px;height:3px;background:#ef4444;margin-bottom:24px;border-radius:2px;"></div>

  <div style="display:flex;justify-content:space-between;margin-bottom:20px;">
    <div>
      <p style="margin:0;font-size:12px;color:#64748b;font-weight:600;text-transform:uppercase;">Praticien</p>
      <p style="margin:4px 0 0;font-size:14px;color:#1e293b;">Dr. {{user.name}}</p>
    </div>
    <div style="text-align:right;">
      <p style="margin:0;font-size:12px;color:#64748b;font-weight:600;text-transform:uppercase;">Date</p>
      <p style="margin:4px 0 0;font-size:14px;color:#1e293b;">{{today}}</p>
    </div>
  </div>

  <p style="font-size:14px;line-height:1.8;color:#334155;margin:0 0 8px;">Je soussigné(e), <strong>Dr. {{user.name}}</strong>, certifie avoir examiné ce jour :</p>

  <div style="background:#fef2f2;border:1px solid #fecaca;border-radius:8px;padding:16px;margin:0 0 20px;">
    <p style="margin:0;font-size:15px;color:#1e293b;font-weight:600;">{{patients.patients.prenom}} {{patients.patients.nom}}</p>
    <p style="margin:4px 0 0;font-size:13px;color:#64748b;">Né(e) le : {{patients.patients.dateNaissance}}</p>
  </div>

  <p style="font-size:14px;line-height:1.8;color:#334155;margin:0 0 6px;">
    et certifie que son état de santé nécessite un arrêt de travail :
  </p>

  <div style="background:#fff7ed;border:1px solid #fed7aa;border-radius:8px;padding:16px;margin:0 0 20px;">
    <div style="display:flex;gap:40px;">
      <div>
        <p style="margin:0;font-size:12px;color:#9a3412;font-weight:600;">DU</p>
        <p style="margin:4px 0 0;font-size:16px;color:#1e293b;font-weight:600;">____/____/________</p>
      </div>
      <div>
        <p style="margin:0;font-size:12px;color:#9a3412;font-weight:600;">AU</p>
        <p style="margin:4px 0 0;font-size:16px;color:#1e293b;font-weight:600;">____/____/________</p>
      </div>
      <div>
        <p style="margin:0;font-size:12px;color:#9a3412;font-weight:600;">INCLUS</p>
        <p style="margin:4px 0 0;font-size:14px;color:#1e293b;">Soit _______ jours</p>
      </div>
    </div>
  </div>

  <div style="margin-bottom:16px;">
    <p style="font-size:13px;color:#334155;margin:0 0 8px;font-weight:600;">Sorties autorisées :</p>
    <label style="font-size:13px;color:#334155;margin-right:16px;">☐ Sans restriction</label>
    <label style="font-size:13px;color:#334155;">☐ De 10h à 12h et de 14h à 18h</label>
  </div>

  <p style="font-size:13px;line-height:1.7;color:#64748b;margin:0 0 30px;font-style:italic;">
    Cet arrêt est prescrit à titre initial / de prolongation (rayer la mention inutile).
  </p>

  <div>
    <p style="font-size:13px;color:#64748b;margin:0;">Fait à : ________________ , le {{today}}</p>
    <p style="font-size:13px;color:#64748b;margin:30px 0 0;border-top:1px solid #cbd5e1;padding-top:8px;display:inline-block;">Signature et cachet du praticien</p>
  </div>
</div>`
    },

    "Demande d'examen labo": {
        content: `<div style="font-family:'Segoe UI',Arial,sans-serif;max-width:100%;margin:0;padding:0;">
  <h1 style="margin:0 0 6px;font-size:20px;color:#f97316;font-weight:700;text-transform:uppercase;letter-spacing:1px;">Demande d'examen de laboratoire</h1>
  <div style="width:60px;height:3px;background:#f97316;margin-bottom:20px;border-radius:2px;"></div>

  <div style="display:flex;justify-content:space-between;margin-bottom:16px;">
    <div>
      <p style="margin:0;font-size:12px;color:#64748b;font-weight:600;">PRESCRIPTEUR</p>
      <p style="margin:4px 0 0;font-size:14px;color:#1e293b;font-weight:600;">Dr. {{user.name}}</p>
    </div>
    <div style="text-align:right;">
      <p style="margin:0;font-size:12px;color:#64748b;font-weight:600;">DATE</p>
      <p style="margin:4px 0 0;font-size:14px;color:#1e293b;">{{today}}</p>
    </div>
  </div>

  <div style="background:#fff7ed;border:1px solid #fed7aa;border-radius:8px;padding:14px 16px;margin-bottom:18px;">
    <p style="margin:0;font-size:11px;color:#9a3412;font-weight:600;text-transform:uppercase;">Patient</p>
    <p style="margin:4px 0 0;font-size:15px;color:#1e293b;font-weight:600;">{{patients.patients.prenom}} {{patients.patients.nom}}</p>
    <p style="margin:4px 0 0;font-size:13px;color:#64748b;">Né(e) le : {{patients.patients.dateNaissance}}</p>
  </div>

  <p style="font-size:13px;color:#334155;font-weight:600;margin:0 0 10px;">Examens demandés :</p>

  <table style="width:100%;border-collapse:collapse;font-size:13px;margin-bottom:18px;">
    <thead>
      <tr style="background:#f97316;color:#fff;">
        <th style="padding:8px 14px;text-align:left;font-weight:600;">Examen</th>
        <th style="padding:8px 14px;text-align:left;font-weight:600;">Précisions</th>
      </tr>
    </thead>
    <tbody>
      <tr style="background:#fff7ed;"><td style="padding:8px 14px;border-bottom:1px solid #fed7aa;">☐ NFS (Numération Formule Sanguine)</td><td style="padding:8px 14px;border-bottom:1px solid #fed7aa;"></td></tr>
      <tr><td style="padding:8px 14px;border-bottom:1px solid #f1f5f9;">☐ Glycémie à jeun</td><td style="padding:8px 14px;border-bottom:1px solid #f1f5f9;"></td></tr>
      <tr style="background:#fff7ed;"><td style="padding:8px 14px;border-bottom:1px solid #fed7aa;">☐ HbA1c</td><td style="padding:8px 14px;border-bottom:1px solid #fed7aa;"></td></tr>
      <tr><td style="padding:8px 14px;border-bottom:1px solid #f1f5f9;">☐ Bilan lipidique complet</td><td style="padding:8px 14px;border-bottom:1px solid #f1f5f9;"></td></tr>
      <tr style="background:#fff7ed;"><td style="padding:8px 14px;border-bottom:1px solid #fed7aa;">☐ Créatinine / DFG</td><td style="padding:8px 14px;border-bottom:1px solid #fed7aa;"></td></tr>
      <tr><td style="padding:8px 14px;border-bottom:1px solid #f1f5f9;">☐ TSH</td><td style="padding:8px 14px;border-bottom:1px solid #f1f5f9;"></td></tr>
      <tr style="background:#fff7ed;"><td style="padding:8px 14px;border-bottom:1px solid #fed7aa;">☐ Bilan hépatique (ASAT, ALAT, GGT)</td><td style="padding:8px 14px;border-bottom:1px solid #fed7aa;"></td></tr>
      <tr><td style="padding:8px 14px;border-bottom:1px solid #f1f5f9;">☐ Ferritine / Fer sérique</td><td style="padding:8px 14px;border-bottom:1px solid #f1f5f9;"></td></tr>
      <tr style="background:#fff7ed;"><td style="padding:8px 14px;border-bottom:1px solid #fed7aa;">☐ CRP</td><td style="padding:8px 14px;border-bottom:1px solid #fed7aa;"></td></tr>
      <tr><td style="padding:8px 14px;border-bottom:1px solid #f1f5f9;">☐ Autre : ________________________</td><td style="padding:8px 14px;border-bottom:1px solid #f1f5f9;"></td></tr>
    </tbody>
  </table>

  <div style="background:#f8fafc;border:1px solid #e2e8f0;border-radius:8px;padding:12px 16px;margin-bottom:16px;">
    <p style="margin:0;font-size:12px;color:#64748b;font-weight:600;">Renseignements cliniques :</p>
    <p style="margin:6px 0 0;font-size:13px;color:#334155;line-height:1.6;">________________________________________</p>
  </div>

  <div style="margin-top:24px;">
    <p style="font-size:13px;color:#64748b;margin:0;">☐ Urgent &nbsp;&nbsp; ☐ À jeun obligatoire</p>
    <p style="font-size:13px;color:#64748b;margin:20px 0 0;border-top:1px solid #cbd5e1;padding-top:8px;display:inline-block;">Signature et cachet du prescripteur</p>
  </div>
</div>`
    },

    'Lettre orientation spécialiste': {
        content: `<div style="font-family:'Segoe UI',Arial,sans-serif;max-width:100%;margin:0;padding:0;">
  <div style="display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:20px;">
    <div>
      <p style="margin:0;font-size:14px;color:#1e293b;font-weight:600;">Dr. {{user.name}}</p>
      <p style="margin:2px 0 0;font-size:12px;color:#64748b;">Médecin généraliste</p>
    </div>
    <div style="text-align:right;">
      <p style="margin:0;font-size:13px;color:#64748b;">Le {{today}}</p>
    </div>
  </div>

  <h1 style="margin:0 0 6px;font-size:20px;color:#8b5cf6;font-weight:700;">Lettre d'orientation</h1>
  <div style="width:50px;height:3px;background:#8b5cf6;margin-bottom:20px;border-radius:2px;"></div>

  <div style="background:#f5f3ff;border:1px solid #ddd6fe;border-radius:8px;padding:14px 16px;margin-bottom:18px;">
    <p style="margin:0;font-size:11px;color:#7c3aed;font-weight:600;text-transform:uppercase;">Adressé à</p>
    <p style="margin:6px 0 0;font-size:14px;color:#1e293b;">Dr. / Pr. ____________________________________</p>
    <p style="margin:2px 0 0;font-size:13px;color:#64748b;">Spécialité : ____________________________________</p>
  </div>

  <p style="font-size:14px;line-height:1.6;color:#334155;margin:0 0 6px;">Cher(e) confrère,</p>

  <p style="font-size:14px;line-height:1.7;color:#334155;margin:0 0 12px;">
    Je vous adresse <strong>{{consultations.consultations.patients.prenom}} {{consultations.consultations.patients.nom}}</strong>, né(e) le {{consultations.consultations.patients.dateNaissance}}, pour prise en charge spécialisée.
  </p>

  <div style="margin-bottom:16px;">
    <p style="font-size:13px;color:#1e293b;font-weight:600;margin:0 0 6px;">Motif de la consultation :</p>
    <p style="font-size:13px;line-height:1.7;color:#334155;margin:0;">{{consultations.consultations.motif}}</p>
  </div>

  <div style="margin-bottom:16px;">
    <p style="font-size:13px;color:#1e293b;font-weight:600;margin:0 0 6px;">Examen clinique :</p>
    <p style="font-size:13px;line-height:1.7;color:#334155;margin:0;">{{consultations.consultations.examenClinique}}</p>
  </div>

  <div style="margin-bottom:16px;">
    <p style="font-size:13px;color:#1e293b;font-weight:600;margin:0 0 6px;">Antécédents notables :</p>
    <p style="font-size:13px;line-height:1.7;color:#334155;margin:0;">{{consultations.consultations.patients.antecedents}}</p>
  </div>

  <div style="margin-bottom:16px;">
    <p style="font-size:13px;color:#1e293b;font-weight:600;margin:0 0 6px;">Traitement en cours :</p>
    <p style="font-size:13px;line-height:1.7;color:#334155;margin:0;">{{consultations.consultations.traitementEnCours}}</p>
  </div>

  <p style="font-size:14px;line-height:1.7;color:#334155;margin:0 0 6px;">
    Je vous remercie pour votre avis et reste à votre disposition pour tout renseignement complémentaire.
  </p>

  <p style="font-size:14px;line-height:1.7;color:#334155;margin:0 0 24px;">
    Confraternellement,
  </p>

  <div>
    <p style="font-size:13px;color:#1e293b;font-weight:600;margin:0;">Dr. {{user.name}}</p>
    <p style="font-size:12px;color:#64748b;margin:2px 0 0;">Signature et cachet</p>
  </div>
</div>`
    }
};


async function update() {
    const conn = mongoose.createConnection(`mongodb://127.0.0.1:27017/${DB_NAME}`);
    await new Promise(r => conn.once('open', r));
    console.log(`Connected to ${DB_NAME}`);

    const docsColl = conn.db.collection('documents');

    for (const [name, data] of Object.entries(templateContents)) {
        const doc = await docsColl.findOne({ name, isTemplate: true });
        if (!doc) {
            console.log(`  ✗ Template "${name}" not found`);
            continue;
        }

        const pages = doc.pages || [{}];
        pages[0] = { ...pages[0], content: data.content };

        await docsColl.updateOne({ _id: doc._id }, { $set: { pages } });
        console.log(`  ✓ Updated "${name}" with real content (${data.content.length} chars)`);
    }

    console.log('\nDone');
    await conn.close();
}

update().catch(console.error);
