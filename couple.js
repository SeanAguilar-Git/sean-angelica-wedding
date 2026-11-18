const $ = s => document.querySelector(s);
const el = (t, c, x) => { const e = document.createElement(t); if (c) e.className = c; if (x != null) e.textContent = x; return e; };
let pw = sessionStorage.getItem('sa_admin') || '', guests = [], tab = 'all';
const st = g => !g.rsvp ? 'pending' : g.rsvp.attending ? 'yes' : 'no';
const link = g => location.origin + '/?g=' + g.code;

async function api(m, u, b) {
  const r = await fetch(u, { method: m, headers: { Authorization: 'Bearer ' + pw, 'Content-Type': 'application/json' }, body: b ? JSON.stringify(b) : undefined });
  const j = await r.json().catch(() => ({}));
  if (!r.ok) throw Object.assign(new Error(j.error || 'Error'), { status: r.status });
  return j;
}
async function load() {
  try { guests = (await api('GET', '/api/admin')).guests; $('#login').hidden = true; $('#dash').hidden = false; draw(); }
  catch (e) {
    if (e.status === 401) { sessionStorage.removeItem('sa_admin'); pw = ''; $('#login').hidden = false; $('#dash').hidden = true; $('#lerr').textContent = 'Wrong password.'; }
    else $('#lerr').textContent = e.message;
  }
}
function draw() {
  const n = k => guests.filter(g => st(g) === k).length;
  const heads = guests.reduce((s, g) => s + (st(g) === 'yes' ? g.rsvp.count : 0), 0);
  $('#stats').replaceChildren(...[['Invited', guests.length], ['Not yet answered', n('pending')], ['Attending', n('yes')], ['Guests coming', heads], ['Declined', n('no')]]
    .map(([l, v]) => { const d = el('div', 'stat'); d.append(el('b', '', v), el('small', '', l)); return d; }));
  $('#tabs').replaceChildren(...[['all', 'All', guests.length], ['pending', 'Not yet answered', n('pending')], ['yes', 'Attending', n('yes')], ['no', 'Declined', n('no')]]
    .map(([k, l, c]) => { const b = el('button', k === tab ? 'on' : '', `${l} (${c})`); b.type = 'button'; b.onclick = () => { tab = k; draw(); }; return b; }));
  const order = { pending: 0, yes: 1, no: 2 };
  const rows = guests.filter(g => tab === 'all' || st(g) === tab).sort((a, b) => order[st(a)] - order[st(b)] || a.name.localeCompare(b.name));
  $('#list').replaceChildren(...(rows.length ? rows.map(row) : [el('p', 'empty', 'No guests here yet.')]));
}
function row(g) {
  const s = st(g), d = el('div', 'gr'), left = el('div');
  left.append(el('b', '', g.name)); if (g.rsvp && g.rsvp.message) left.append(el('small', '', '“' + g.rsvp.message + '”'));
  const chip = el('span', 'chip ' + s, s === 'pending' ? 'Not yet answered' : s === 'yes' ? `Attending · ${g.rsvp.count} of ${g.seats}` : 'Declined');
  const acts = el('div', 'acts'), cp = el('button', '', 'Copy link'), rm = el('button', '', 'Remove');
  cp.type = rm.type = 'button';
  cp.onclick = async () => { try { await navigator.clipboard.writeText(link(g)); cp.textContent = 'Copied!'; setTimeout(() => cp.textContent = 'Copy link', 1500); } catch { prompt('Copy this link', link(g)); } };
  rm.onclick = async () => { if (confirm('Remove ' + g.name + ' from the list?')) { await api('DELETE', '/api/admin?code=' + g.code); load(); } };
  acts.append(cp, rm); d.append(left, chip, acts); return d;
}
$('#lf').onsubmit = e => { e.preventDefault(); pw = $('#pw').value; sessionStorage.setItem('sa_admin', pw); $('#lerr').textContent = ''; load(); };
$('#af').onsubmit = async e => {
  e.preventDefault(); $('#aerr').textContent = '';
  const list = $('#bulk').value.split('\n').map(l => l.trim()).filter(Boolean).map(l => { const m = l.match(/^(.*?)(?:\s*,\s*(\d+))?$/); return { name: m[1], seats: +m[2] || 1 }; });
  try { await api('POST', '/api/admin', { guests: list }); $('#bulk').value = ''; load(); } catch (x) { $('#aerr').textContent = x.message; }
};
$('#rf').onclick = load;
$('#lo').onclick = () => { sessionStorage.removeItem('sa_admin'); pw = ''; guests = []; $('#dash').hidden = true; $('#login').hidden = false; $('#pw').value = ''; };
if (pw) load();
setInterval(() => { if (pw && !document.hidden && !$('#dash').hidden) load(); }, 30000);
