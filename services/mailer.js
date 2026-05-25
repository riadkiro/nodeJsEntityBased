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
async function send({ to, subject, html, text }) {
    const t = getTransporter();
    if (!t) {
        console.log(`[Mailer] (dry-run) Would send to ${to}: ${subject}`);
        return { dryRun: true };
    }

    const info = await t.sendMail({
        from: `"${mailConfig.from.name}" <${mailConfig.from.email}>`,
        to,
        subject,
        html,
        text: text || subject,
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
    verify,
};
