/* ===== CONFIG — edit these ===== */
const C={
  date:'2026-12-21T14:00:00+08:00' // Dec 21, 2026 · 2:00 PM guest arrival (Philippines time)
};
const $=s=>document.querySelector(s),$$=s=>[...document.querySelectorAll(s)];

/* Cover: tap to open */
const cover=$('#cover');
const open=()=>{cover.classList.add('open');document.body.classList.remove('locked');setTimeout(()=>cover.remove(),1600)};
cover.addEventListener('click',open);
cover.addEventListener('keydown',e=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();open()}});

/* Guest + RSVP: personal link is index.html?g=CODE (codes come from couple.html) */
const Q=new URLSearchParams(location.search);
const ls={get:k=>{try{return localStorage.getItem(k)}catch{return null}},set:(k,v)=>{try{localStorage.setItem(k,v)}catch{}}};
const code=(Q.get('g')||ls.get('sa_code')||'').toLowerCase().replace(/[^a-z0-9]/g,'');
if(code)ls.set('sa_code',code);
$$('.rsvp-link').forEach(a=>a.href='rsvp.html'+(code?'?g='+code:''));
function paint(g){
  if(!g||!g.name)return;
  const f=$('#for');f.textContent='For '+g.name;f.hidden=false;
  const r=g.rsvp;$('#rsvp').hidden=!!r;$('#thanks').hidden=!r;
  if(r){$('#tt').textContent=r.attending?`Thank you, ${g.name}!`:`We'll miss you, ${g.name}.`;
    $('#tb').textContent=r.attending?'We are so excited to share our special day with you.':'Thank you for letting us know. You will be in our hearts on our special day.'}
}
try{const c=JSON.parse(ls.get('sa_guest')||'null');if(c&&c.code===code)paint(c)}catch{}
if(code)fetch('/api/guest?code='+code).then(r=>r.ok?r.json():null).then(g=>{if(g){ls.set('sa_guest',JSON.stringify({code,...g}));paint(g)}}).catch(()=>{});
/* Back from the RSVP page: skip the cover and land on "You're Invited" */
if(Q.get('r')){document.body.classList.remove('locked');cover.remove();history.replaceState(null,'','?g='+code+'#invited');$('#invited').scrollIntoView({behavior:'instant'})}

/* Countdown module */
const T=new Date(C.date).getTime(),cd=$$('#cd b');
const tick=()=>{let d=Math.max(0,T-Date.now());const v=[864e5,36e5,6e4,1e3].map(u=>{const x=Math.floor(d/u);d-=x*u;return x});cd.forEach((b,i)=>b.textContent=String(v[i]).padStart(2,'0'))};
tick();setInterval(tick,1000);

/* FAQ accordion module (one open at a time) */
$$('details').forEach(d=>d.addEventListener('toggle',()=>{if(d.open)$$('details[open]').forEach(o=>o!==d&&(o.open=false))}));

/* Fade-in on scroll + light parallax */
const io=new IntersectionObserver(es=>es.forEach(e=>e.isIntersecting&&(e.target.classList.add('in'),io.unobserve(e.target))),{threshold:.15});
$$('.rv').forEach(el=>io.observe(el));
addEventListener('scroll',()=>document.documentElement.style.setProperty('--y',scrollY),{passive:true});

/* Header: transparent over the photo, solid after; mobile menu */
const hd=$('#top'),mb=$('.mb'),mn=$('#menu');
const sync=()=>hd.classList.toggle('solid',scrollY>innerHeight*.6||mn.classList.contains('open'));
addEventListener('scroll',sync,{passive:true});sync();
mb.addEventListener('click',()=>{const o=mn.classList.toggle('open');mb.setAttribute('aria-expanded',o);sync()});
$$('#menu a').forEach(a=>a.addEventListener('click',()=>{mn.classList.remove('open');mb.setAttribute('aria-expanded',false);sync()}));

/* PWA */
if('serviceWorker'in navigator)addEventListener('load',()=>navigator.serviceWorker.register('sw.js'));
