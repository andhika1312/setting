import { getStore } from '@netlify/blobs';

// ======== GANTI SANDI ADMIN DI SINI ========
const ADMIN_PASSWORD = 'andhika1312';
// ===========================================

export const config = { path: '/api/*' };

const J = (o, s = 200) => new Response(JSON.stringify(o), { status: s, headers: { 'content-type': 'application/json', 'cache-control': 'no-store' } });
const K = ip => String(ip).replace(/[^\w.-]/g, '_');

async function discord(title, f) {
  const url = process.env.DISCORD_WEBHOOK; if (!url) return;
  try {
    await fetch(url, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ embeds: [{ title, color: 0x7c5cff,
      fields: Object.entries(f).slice(0, 20).map(([name, v]) => ({ name, value: String(v).slice(0, 200) || '-', inline: true })), timestamp: new Date().toISOString() }] }) });
  } catch {}
}

export default async (req, context) => {
  const db = getStore('nexora');
  const path = new URL(req.url).pathname.replace(/^\/api\//, '');
  const ip = context.ip || req.headers.get('x-nf-client-connection-ip') || 'unknown';
  const ua = (req.headers.get('user-agent') || '-').slice(0, 160);
  const now = Date.now();
  let body = {};
  if (req.method === 'POST') { try { body = await req.json(); } catch {} }
  const getBlocked = async () => (await db.get('blocked', { type: 'json' })) || [];
  const getMsgs = async () => (await db.get('msgs', { type: 'json' })) || [];

  const touch = async ev => {
    const key = 'users/' + K(ip);
    const u = (await db.get(key, { type: 'json' })) || { ip, first: now, visits: 0, events: 0, recent: [] };
    u.last = now; u.ua = ua;
    if (ev) { u.events++; u.recent.unshift({ e: ev.event, t: now, d: [ev.file, ev.kertas, ev.mode].filter(Boolean).join(' · ') }); u.recent = u.recent.slice(0, 15); }
    else u.visits++;
    await db.setJSON(key, u);
  };

  // ---------- publik ----------
  if (path === 'hello') {
    await touch();
    const b = (await getBlocked()).find(x => x.ip === ip);
    if (b) return J({ blocked: true, reason: b.reason || '' });
    const messages = (await getMsgs()).filter(m => m.to === 'all' || m.to === ip).slice(-20);
    return J({ ip, messages });
  }
  if (path === 'log') {
    { const bl = (await getBlocked()).find(x => x.ip === ip); if (bl) return J({ blocked: true, reason: bl.reason || '' }, 403); }
    await touch(body);
    const { event, ...rest } = body;
    await discord('NEXORA SETINGS • ' + String(event || 'log').slice(0, 60), { ...rest, IP: ip, Perangkat: ua });
    return J({ ok: true });
  }

  // ---------- admin ----------
  if (path.startsWith('admin/')) {
    const fk = 'fails2/' + K(ip);
    const f = (await db.get(fk, { type: 'json' })) || { n: 0, t: 0 };
    const LOCK = 300000, live = now - f.t < LOCK;
    if (live && f.n >= 10) return J({ error: 'Terlalu banyak percobaan salah. Coba lagi ' + Math.ceil((LOCK - (now - f.t)) / 60000) + ' menit lagi.' }, 429);
    if (req.headers.get('x-admin-pass') !== ADMIN_PASSWORD) {
      await db.setJSON(fk, { n: (live ? f.n : 0) + 1, t: now });
      return J({ error: 'Sandi salah' }, 401);
    }
    if (f.n) await db.delete(fk);
    const act = path.slice(6);

    if (act === 'login') { await discord('Admin login', { IP: ip }); return J({ ok: true }); }
    if (act === 'data') {
      const { blobs } = await db.list({ prefix: 'users/' });
      const users = (await Promise.all(blobs.slice(0, 400).map(b => db.get(b.key, { type: 'json' })))).filter(Boolean).sort((a, b) => b.last - a.last);
      return J({ users, blocked: await getBlocked(), msgs: await getMsgs() });
    }
    if (act === 'block') {
      const t = String(body.ip || '').trim().slice(0, 64); if (!t) return J({ error: 'IP kosong' }, 400);
      const l = await getBlocked();
      if (!l.find(x => x.ip === t)) l.push({ ip: t, reason: String(body.reason || '').slice(0, 120), at: now });
      await db.setJSON('blocked', l); await discord('Admin • blokir IP', { IP: t, alasan: body.reason || '-' });
      return J({ ok: true });
    }
    if (act === 'unblock') {
      await db.setJSON('blocked', (await getBlocked()).filter(x => x.ip !== body.ip));
      await discord('Admin • buka blokir', { IP: body.ip }); return J({ ok: true });
    }
    if (act === 'send') {
      const text = String(body.text || '').trim().slice(0, 500); if (!text) return J({ error: 'Pesan kosong' }, 400);
      const m = await getMsgs();
      m.push({ id: now.toString(36) + Math.random().toString(36).slice(2, 6), to: body.to === 'all' ? 'all' : String(body.to), text, at: now });
      await db.setJSON('msgs', m.slice(-100)); await discord('Admin • kirim pesan', { ke: body.to, pesan: text });
      return J({ ok: true });
    }
    if (act === 'delmsg') { await db.setJSON('msgs', (await getMsgs()).filter(x => x.id !== body.id)); return J({ ok: true }); }
    return J({ error: 'Not found' }, 404);
  }
  return J({ error: 'Not found' }, 404);
};
