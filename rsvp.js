const $ = s => document.querySelector(s), Q = new URLSearchParams(location.search);
const ls = { get: k => { try { return localStorage.getItem(k); } catch { return null; } }, set: (k, v) => { try { localStorage.setItem(k, v); } catch {} } };
const code = (Q.get('g') || ls.get('sa_code') || '').toLowerCase().replace(/[^a-z0-9]/g, '');
const card = $('#card');
const say = t => { const p = document.createElement('p'); p.textContent = t; card.replaceChildren(p); };
if (!code) say('Please open the RSVP from your personal invitation link.');
else fetch('/api/guest?code=' + code).then(r => r.ok ? r.json() : Promise.reject(r.status)).then(form)
  .catch(s => say(s === 404 ? "We couldn't find this invitation. Please check your link." : "We couldn't load your invitation. Please try again."));

function form(g) {
  ls.set('sa_code', code);
  card.innerHTML = `<p class="hi"></p><form id="f"><fieldset><legend>Will you be joining us?</legend>
<label class="opt"><input type="radio" name="a" value="yes" required><span>Joyfully accepts</span></label>
<label class="opt"><input type="radio" name="a" value="no"><span>Regretfully declines</span></label></fieldset>
<label id="cw" hidden>How many will attend?<select name="c"></select></label>
<label>A note for the couple (optional)<textarea name="m" maxlength="300" rows="3"></textarea></label>
<button class="btn" type="submit">Send my answer</button><p class="err" id="er" role="alert"></p></form>`;
  $('.hi').textContent = 'Hello, ' + g.name + '.';
  const f = $('#f'), sel = f.c;
  for (let i = 1; i <= g.seats; i++) sel.add(new Option(i + (i === 1 ? ' guest' : ' guests'), i));
  const sync = () => { $('#cw').hidden = !(g.seats > 1 && f.a.value === 'yes'); };
  f.addEventListener('change', sync);
  if (g.rsvp) { f.a.value = g.rsvp.attending ? 'yes' : 'no'; if (g.rsvp.attending) sel.value = g.rsvp.count; f.m.value = g.rsvp.message || ''; }
  sync();
  f.addEventListener('submit', async e => {
    e.preventDefault();
    const b = f.querySelector('button'); b.disabled = true; $('#er').textContent = '';
    try {
      const res = await fetch('/api/rsvp', { method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code, attending: f.a.value === 'yes', count: +sel.value || 1, message: f.m.value }) });
      const j = await res.json();
      if (!res.ok) throw new Error(j.error);
      ls.set('sa_guest', JSON.stringify({ code, name: g.name, seats: g.seats, rsvp: j.rsvp }));
      location.href = './?g=' + code + '&r=1#invited';
    } catch (x) { $('#er').textContent = x.message || 'Something went wrong. Please try again.'; b.disabled = false; }
  });
}
