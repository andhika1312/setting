// Log penggunaan -> Discord. Set env var DISCORD_WEBHOOK di Netlify (jangan taruh URL di kode).
exports.handler = async (e) => {
  if (e.httpMethod !== 'POST') return { statusCode: 405, body: '' };
  const url = process.env.DISCORD_WEBHOOK;
  if (!url) return { statusCode: 200, body: 'no webhook' };
  let b = {};
  try { b = JSON.parse(e.body || '{}'); } catch {}
  const h = e.headers || {};
  const fields = Object.entries(b).filter(([k]) => k !== 'event').slice(0, 15)
    .map(([k, v]) => ({ name: k, value: String(v).slice(0, 200) || '-', inline: true }));
  fields.push({ name: 'IP', value: h['x-nf-client-connection-ip'] || h['client-ip'] || '-', inline: true });
  fields.push({ name: 'Perangkat', value: String(h['user-agent'] || '-').slice(0, 200) });
  try {
    await fetch(url, { method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ embeds: [{ title: 'NEXORA SETINGS • ' + String(b.event || 'log').slice(0, 60), color: 0x7c5cff, fields, timestamp: new Date().toISOString() }] }) });
  } catch {}
  return { statusCode: 200, body: 'ok' };
};
