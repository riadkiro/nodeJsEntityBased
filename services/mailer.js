/**
 * Mailer Service — SMTP (Brevo / Sendinblue)
 * 
 * Usage:
 *   const mailer = require('../services/mailer');
 *   await mailer.sendInvitation({ to, accountName, inviterName, role, inviteUrl });
 */

const nodemailer = require('nodemailer');
const mailConfig = require('../config/mail.config');

// ── Create reusable transporter ──
let transporter = null;

function getTransporter() {
    if (!transporter) {
        if (!mailConfig.smtp.auth.user || !mailConfig.smtp.auth.pass) {
            console.warn('[Mailer] SMTP credentials not configured. Set SMTP_USER and SMTP_PASS env vars.');
            return null;
        }
        transporter = nodemailer.createTransport({
            host: mailConfig.smtp.host,
            port: mailConfig.smtp.port,
            secure: mailConfig.smtp.secure,
            auth: mailConfig.smtp.auth,
        });
    }
    return transporter;
}

// ═══════════════════════════════════════════
// Generic send
// ═══════════════════════════════════════════
async function send({ to, subject, html, text, from, replyTo }) {
    const t = getTransporter();
    if (!t) {
        console.log(`[Mailer] (dry-run) Would send to ${to}: ${subject}`);
        return { dryRun: true };
    }

    const info = await t.sendMail({
        from: from || `"${mailConfig.from.name}" <${mailConfig.from.email}>`,
        to,
        subject,
        html,
        text: text || subject,
        ...(replyTo ? { replyTo } : {}),
    });

    console.log(`[Mailer] Sent to ${to} — messageId: ${info.messageId}`);
    return info;
}

// ═══════════════════════════════════════════
// Team Invitation Email
// ═══════════════════════════════════════════
async function sendInvitation({ to, accountName, inviterName, role, inviteUrl }) {
    const roleLabel = { admin: 'Administrateur', manager: 'Manager', member: 'Membre', viewer: 'Lecteur' }[role] || role;

    const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1">
    </head>
    <body style="margin:0;padding:0;background:#f4f6f9;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;">
      <div style="max-width:520px;margin:40px auto;background:#fff;border-radius:16px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,.08);">
        <!-- Header -->
        <div style="background:linear-gradient(135deg,#4361ee,#7c3aed);padding:32px 30px;text-align:center;">
          <div style="font-size:28px;font-weight:800;color:#fff;letter-spacing:-.5px;">Dexapp</div>
          <div style="font-size:13px;color:rgba(255,255,255,.7);margin-top:4px;">Invitation à rejoindre une équipe</div>
        </div>

        <!-- Body -->
        <div style="padding:32px 30px;">
          <h2 style="font-size:18px;font-weight:700;color:#0e1726;margin:0 0 12px;">Vous êtes invité(e) ! 🎉</h2>
          <p style="font-size:14px;line-height:1.6;color:#64748b;margin:0 0 20px;">
            <strong style="color:#0e1726;">${inviterName}</strong> vous invite à rejoindre l'espace
            <strong style="color:#0e1726;">${accountName}</strong> en tant que <strong style="color:#4361ee;">${roleLabel}</strong>.
          </p>

          <!-- CTA Button -->
          <div style="text-align:center;margin:28px 0;">
            <a href="${inviteUrl}" style="display:inline-block;padding:14px 36px;background:linear-gradient(135deg,#4361ee,#7c3aed);color:#fff;font-size:14px;font-weight:700;text-decoration:none;border-radius:12px;box-shadow:0 4px 16px rgba(67,97,238,.35);">
              Accepter l'invitation
            </a>
          </div>

          <p style="font-size:12px;color:#94a3b8;margin:0;line-height:1.5;">
            Ce lien est valide pendant 7 jours. Si vous n'avez pas demandé cette invitation, ignorez cet email.
          </p>
        </div>

        <!-- Footer -->
        <div style="padding:16px 30px;border-top:1px solid #f1f5f9;text-align:center;">
          <p style="font-size:11px;color:#94a3b8;margin:0;">
            © ${new Date().getFullYear()} Dexapp — Plateforme SaaS
          </p>
        </div>
      </div>
    </body>
    </html>`;

    const text = `${inviterName} vous invite à rejoindre ${accountName} en tant que ${roleLabel}. Acceptez l'invitation ici : ${inviteUrl}`;

    return send({
        to,
        subject: `Invitation à rejoindre ${accountName} — Dexapp`,
        html,
        text,
    });
}

function escapeHtml(value) {
    return String(value || '')
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#39;');
}

// ═══════════════════════════════════════════
// Data Room Share Email
// ═══════════════════════════════════════════
async function sendDataRoomShare({ to, accountName, inviterName, recordTitle, scopeLabel, role, actionUrl, requiresWorkspaceAccept }) {
    const roleLabel = { viewer: 'Lecteur', reviewer: 'Relecteur', manager: 'Manager' }[role] || 'Lecteur';
    const title = requiresWorkspaceAccept ? 'Invitation à une Data Room' : 'Accès Data Room partagé';
    const cta = requiresWorkspaceAccept ? 'Accepter et accéder' : 'Ouvrir la Data Room';
    const intro = requiresWorkspaceAccept
        ? 'vous invite à rejoindre un espace Dexapp pour accéder à une Data Room sécurisée.'
        : 'vous a donné accès à une Data Room sécurisée.';

    const safe = {
        accountName: escapeHtml(accountName),
        inviterName: escapeHtml(inviterName),
        recordTitle: escapeHtml(recordTitle || 'Document'),
        scopeLabel: escapeHtml(scopeLabel || 'Data Room'),
        roleLabel: escapeHtml(roleLabel),
        actionUrl: escapeHtml(actionUrl)
    };

    const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1">
    </head>
    <body style="margin:0;padding:0;background:#f4f6f9;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;">
      <div style="max-width:540px;margin:40px auto;background:#fff;border-radius:16px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,.08);">
        <div style="background:linear-gradient(135deg,#0f766e,#14b8a6);padding:32px 30px;text-align:center;">
          <div style="font-size:28px;font-weight:800;color:#fff;letter-spacing:-.5px;">Dexapp</div>
          <div style="font-size:13px;color:rgba(255,255,255,.78);margin-top:4px;">${title}</div>
        </div>
        <div style="padding:32px 30px;">
          <h2 style="font-size:18px;font-weight:700;color:#0e1726;margin:0 0 12px;">Un accès vous a été partagé</h2>
          <p style="font-size:14px;line-height:1.6;color:#64748b;margin:0 0 18px;">
            <strong style="color:#0e1726;">${safe.inviterName}</strong> ${intro}
          </p>
          <div style="padding:14px 16px;background:#f8fafc;border:1px solid #e2e8f0;border-radius:12px;margin:0 0 22px;">
            <div style="font-size:12px;color:#94a3b8;font-weight:700;text-transform:uppercase;letter-spacing:.3px;">Espace</div>
            <div style="font-size:14px;color:#0e1726;font-weight:700;margin-top:3px;">${safe.accountName}</div>
            <div style="font-size:12px;color:#94a3b8;font-weight:700;text-transform:uppercase;letter-spacing:.3px;margin-top:12px;">Data Room</div>
            <div style="font-size:14px;color:#0e1726;font-weight:700;margin-top:3px;">${safe.recordTitle}</div>
            <div style="font-size:13px;color:#64748b;margin-top:8px;">Accès: ${safe.scopeLabel} · Rôle: ${safe.roleLabel}</div>
          </div>
          <div style="text-align:center;margin:28px 0;">
            <a href="${safe.actionUrl}" style="display:inline-block;padding:14px 34px;background:linear-gradient(135deg,#0f766e,#14b8a6);color:#fff;font-size:14px;font-weight:700;text-decoration:none;border-radius:12px;box-shadow:0 4px 16px rgba(20,184,166,.30);">
              ${cta}
            </a>
          </div>
          <p style="font-size:12px;color:#94a3b8;margin:0;line-height:1.5;">
            ${requiresWorkspaceAccept ? 'Après acceptation, connectez-vous avec cette adresse email pour consulter la Data Room.' : 'Connectez-vous avec cette adresse email pour consulter les documents partagés.'}
          </p>
        </div>
        <div style="padding:16px 30px;border-top:1px solid #f1f5f9;text-align:center;">
          <p style="font-size:11px;color:#94a3b8;margin:0;">© ${new Date().getFullYear()} Dexapp</p>
        </div>
      </div>
    </body>
    </html>`;

    const text = `${inviterName} vous a partagé ${scopeLabel || 'une Data Room'} dans ${accountName}. Accès: ${actionUrl}`;

    return send({
        to,
        subject: `${title} — ${accountName}`,
        html,
        text,
    });
}

// ═══════════════════════════════════════════
// Password Reset Email
// ═══════════════════════════════════════════
async function sendPasswordReset({ to, name, resetUrl, expiresInMinutes = 60 }) {
    const safe = {
        name: escapeHtml(name || 'Bonjour'),
        resetUrl: escapeHtml(resetUrl),
        expiresInMinutes: escapeHtml(String(expiresInMinutes)),
    };

    const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1">
    </head>
    <body style="margin:0;padding:0;background:#f4f6f9;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;">
      <div style="max-width:540px;margin:40px auto;background:#fff;border-radius:16px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,.08);">
        <div style="background:linear-gradient(135deg,#4361ee,#7c3aed);padding:32px 30px;text-align:center;">
          <div style="font-size:28px;font-weight:800;color:#fff;letter-spacing:-.5px;">Dexapp</div>
          <div style="font-size:13px;color:rgba(255,255,255,.78);margin-top:4px;">Réinitialisation du mot de passe</div>
        </div>
        <div style="padding:32px 30px;">
          <h2 style="font-size:18px;font-weight:700;color:#0e1726;margin:0 0 12px;">${safe.name}</h2>
          <p style="font-size:14px;line-height:1.6;color:#64748b;margin:0 0 18px;">
            Nous avons reçu une demande de réinitialisation de mot de passe pour votre compte Dexapp.
          </p>
          <div style="text-align:center;margin:28px 0;">
            <a href="${safe.resetUrl}" style="display:inline-block;padding:14px 34px;background:linear-gradient(135deg,#4361ee,#7c3aed);color:#fff;font-size:14px;font-weight:700;text-decoration:none;border-radius:12px;box-shadow:0 4px 16px rgba(67,97,238,.30);">
              Créer un nouveau mot de passe
            </a>
          </div>
          <p style="font-size:12px;color:#94a3b8;margin:0;line-height:1.5;">
            Ce lien expire dans ${safe.expiresInMinutes} minutes. Si vous n'avez pas demandé cette opération, ignorez simplement cet email.
          </p>
        </div>
        <div style="padding:16px 30px;border-top:1px solid #f1f5f9;text-align:center;">
          <p style="font-size:11px;color:#94a3b8;margin:0;">© ${new Date().getFullYear()} Dexapp</p>
        </div>
      </div>
    </body>
    </html>`;

    const text = `Réinitialisation Dexapp: ouvrez ce lien pour créer un nouveau mot de passe. Le lien expire dans ${expiresInMinutes} minutes: ${resetUrl}`;

    return send({
        to,
        subject: 'Réinitialisation de votre mot de passe — Dexapp',
        html,
        text,
    });
}

// ═══════════════════════════════════════════
// Email Verification
// ═══════════════════════════════════════════
async function sendEmailVerification({ to, name, verifyUrl, expiresInHours = 24 }) {
    const safe = {
        name: escapeHtml(name || 'Bonjour'),
        verifyUrl: escapeHtml(verifyUrl),
        expiresInHours: escapeHtml(String(expiresInHours)),
    };

    const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1">
    </head>
    <body style="margin:0;padding:0;background:#f4f6f9;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;">
      <div style="max-width:540px;margin:40px auto;background:#fff;border-radius:16px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,.08);">
        <div style="background:linear-gradient(135deg,#22c1dc,#4361ee);padding:32px 30px;text-align:center;">
          <div style="font-size:28px;font-weight:800;color:#fff;letter-spacing:-.5px;">Dexapp</div>
          <div style="font-size:13px;color:rgba(255,255,255,.82);margin-top:4px;">Confirmation de votre compte</div>
        </div>
        <div style="padding:32px 30px;">
          <h2 style="font-size:18px;font-weight:700;color:#0e1726;margin:0 0 12px;">${safe.name}</h2>
          <p style="font-size:14px;line-height:1.6;color:#64748b;margin:0 0 18px;">
            Confirmez votre adresse email pour activer votre compte Dexapp.
          </p>
          <div style="text-align:center;margin:28px 0;">
            <a href="${safe.verifyUrl}" style="display:inline-block;padding:14px 34px;background:linear-gradient(135deg,#22c1dc,#4361ee);color:#fff;font-size:14px;font-weight:700;text-decoration:none;border-radius:12px;box-shadow:0 4px 16px rgba(67,97,238,.30);">
              Confirmer mon compte
            </a>
          </div>
          <p style="font-size:12px;color:#94a3b8;margin:0;line-height:1.5;">
            Ce lien expire dans ${safe.expiresInHours} heures. Si vous n'avez pas créé ce compte, ignorez simplement cet email.
          </p>
        </div>
        <div style="padding:16px 30px;border-top:1px solid #f1f5f9;text-align:center;">
          <p style="font-size:11px;color:#94a3b8;margin:0;">© ${new Date().getFullYear()} Dexapp</p>
        </div>
      </div>
    </body>
    </html>`;

    const text = `Confirmation Dexapp: ouvrez ce lien pour confirmer votre compte. Le lien expire dans ${expiresInHours} heures: ${verifyUrl}`;

    return send({
        to,
        subject: 'Confirmez votre compte — Dexapp',
        html,
        text,
    });
}

// ═══════════════════════════════════════════
// Verify SMTP connection
// ═══════════════════════════════════════════
async function verify() {
    const t = getTransporter();
    if (!t) return { ok: false, reason: 'SMTP not configured' };
    try {
        await t.verify();
        console.log('[Mailer] SMTP connection verified ✓');
        return { ok: true };
    } catch (err) {
        console.error('[Mailer] SMTP verify failed:', err.message);
        return { ok: false, reason: err.message };
    }
}

module.exports = {
    send,
    sendInvitation,
    sendDataRoomShare,
    sendPasswordReset,
    sendEmailVerification,
    verify,
};
