// api/register.js — Vercel Serverless Function
// Handles: Supabase insert + Brevo email dispatch
// Keys are stored in Vercel Environment Variables — never exposed to the browser

const { createClient } = require('@supabase/supabase-js');

module.exports = async (req, res) => {
  // Only allow POST
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  // CORS — allow your Vercel domain (and localhost for dev)
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();

  // ── Parse body ──────────────────────────────────────────────
  const { name, college, email, phone, event } = req.body;

  // ── Basic server-side validation ────────────────────────────
  if (!name || !college || !email || !phone || !event) {
    return res.status(400).json({ error: 'All fields are required.' });
  }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return res.status(400).json({ error: 'Invalid email address.' });
  }
  if (!/^\d{10}$/.test(phone)) {
    return res.status(400).json({ error: 'Phone must be 10 digits.' });
  }

  // ── Supabase client (server-side uses SERVICE ROLE key) ─────
  const supabase = createClient(
    process.env.SUPABASE_URL,
    process.env.SUPABASE_SERVICE_KEY  // service role — bypasses RLS safely server-side
  );

  // ── Duplicate check ──────────────────────────────────────────
  const { data: existing } = await supabase
    .from('registrations')
    .select('id')
    .eq('email', email.toLowerCase().trim())
    .eq('event', event)
    .maybeSingle();

  if (existing) {
    return res.status(409).json({
      error: 'AGENT ALREADY REGISTERED FOR THIS EVENT.'
    });
  }

  // ── Insert into Supabase ─────────────────────────────────────
  const { error: insertError } = await supabase
    .from('registrations')
    .insert([{
      name:          name.trim(),
      college:       college.trim(),
      email:         email.toLowerCase().trim(),
      phone:         phone.trim(),
      event:         event,
      registered_at: new Date().toISOString()
    }]);

  if (insertError) {
    console.error('Supabase insert error:', insertError);
    return res.status(500).json({ error: 'DATABASE_ERROR: ' + insertError.message });
  }

  // ── Send confirmation email via Brevo ────────────────────────
  try {
    const brevoRes = await fetch('https://api.brevo.com/v3/smtp/email', {
      method: 'POST',
      headers: {
        'accept':        'application/json',
        'api-key':       process.env.BREVO_API_KEY,
        'content-type':  'application/json'
      },
      body: JSON.stringify({
        sender: {
          name:  'INCOGNITO HQ',
          email: process.env.SENDER_EMAIL   // must be verified in Brevo
        },
        to: [{ email: email.trim(), name: name.trim() }],
        subject: `[CLASSIFIED] MISSION BRIEF — ${name.toUpperCase()}`,
        htmlContent: `
<div style="background:#0a0a08;color:#f0e6cc;font-family:monospace;
            padding:36px;border:2px solid #c0392b;max-width:520px;margin:auto;">

  <div style="border-bottom:1px solid #2a1010;padding-bottom:20px;margin-bottom:24px;">
    <h1 style="color:#c0392b;letter-spacing:6px;font-size:2.2rem;margin:0;">
      INCOGNITO<span style="color:#d4af37;font-size:1.2rem;"> 2026</span>
    </h1>
    <p style="color:#6b6050;font-size:0.7rem;letter-spacing:3px;margin:6px 0 0;">
      — CLASSIFIED AGENT DOSSIER —
    </p>
  </div>

  <table style="width:100%;border-collapse:collapse;font-size:0.88rem;line-height:2;">
    <tr>
      <td style="color:#6b6050;letter-spacing:1.5px;width:110px;">AGENT</td>
      <td style="color:#f0e6cc;font-weight:bold;">${name.trim()}</td>
    </tr>
    <tr>
      <td style="color:#6b6050;letter-spacing:1.5px;">COLLEGE</td>
      <td style="color:#f0e6cc;">${college.trim()}</td>
    </tr>
    <tr>
      <td style="color:#6b6050;letter-spacing:1.5px;">CONTACT</td>
      <td style="color:#f0e6cc;">+91 ${phone.trim()}</td>
    </tr>
    <tr>
      <td style="color:#6b6050;letter-spacing:1.5px;">MISSION</td>
      <td style="color:#c0392b;font-weight:bold;letter-spacing:1px;">${event}</td>
    </tr>
    <tr>
      <td style="color:#6b6050;letter-spacing:1.5px;">DATE</td>
      <td style="color:#d4af37;">MARCH 25, 2026</td>
    </tr>
    <tr>
      <td style="color:#6b6050;letter-spacing:1.5px;">VENUE</td>
      <td style="color:#f0e6cc;">Seshadripuram College, Bengaluru</td>
    </tr>
    <tr>
      <td style="color:#6b6050;letter-spacing:1.5px;">REPORT BY</td>
      <td style="color:#d4af37;">09:00 AM</td>
    </tr>
  </table>

  <div style="border-top:1px solid #2a1010;margin-top:24px;padding-top:16px;">
    <p style="color:#6b6050;font-size:0.72rem;letter-spacing:1px;margin:0 0 8px;">
      Bring your college ID card. Registration is non-transferable.
    </p>
    <p style="color:#6b6050;font-size:0.72rem;letter-spacing:1px;margin:0;">
      Contact HQ: sdcincognito@gmail.com
    </p>
  </div>

  <p style="color:#2a1010;font-size:0.6rem;letter-spacing:2px;margin-top:28px;text-align:center;">
    INCOGNITO 2026 // SESHADRIPURAM COLLEGE // PRAGNYA SCIENCE FORUM
  </p>
</div>`
      })
    });

    if (!brevoRes.ok) {
      const brevoErr = await brevoRes.json();
      console.error('Brevo error:', brevoErr);
      // DB already saved — don't fail the whole request, just log
      return res.status(200).json({
        success: true,
        warning: 'Registration saved but confirmation email failed to send.'
      });
    }
  } catch (emailErr) {
    console.error('Email send exception:', emailErr);
    return res.status(200).json({
      success: true,
      warning: 'Registration saved but email service is unreachable.'
    });
  }

  return res.status(200).json({ success: true });
};