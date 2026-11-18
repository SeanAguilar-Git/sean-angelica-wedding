// Tiny Upstash/Vercel Redis client over REST (no npm packages needed).
const U = process.env.KV_REST_API_URL || process.env.UPSTASH_REDIS_REST_URL;
const T = process.env.KV_REST_API_TOKEN || process.env.UPSTASH_REDIS_REST_TOKEN;
const K = 'wedding:guests';
async function cmd(...a) {
  if (!U || !T) throw new Error('Database not configured');
  const r = await fetch(U, { method: 'POST', headers: { Authorization: 'Bearer ' + T }, body: JSON.stringify(a) });
  const j = await r.json();
  if (j.error) throw new Error(j.error);
  return j.result;
}
exports.get = async c => { const v = await cmd('HGET', K, c); return v ? JSON.parse(v) : null; };
exports.set = (c, g) => cmd('HSET', K, c, JSON.stringify(g));
exports.del = c => cmd('HDEL', K, c);
exports.all = async () => {
  const r = (await cmd('HGETALL', K)) || [];
  if (!Array.isArray(r)) return Object.values(r).map(v => JSON.parse(v));
  const o = []; for (let i = 1; i < r.length; i += 2) o.push(JSON.parse(r[i])); return o;
};
exports.isAdmin = req => {
  const p = process.env.ADMIN_PASSWORD || '';
  const h = (req.headers.authorization || '').replace(/^Bearer /, '');
  const a = Buffer.from(h), b = Buffer.from(p);
  return p.length > 0 && a.length === b.length && require('crypto').timingSafeEqual(a, b);
};
exports.json = (res, s, o) => { res.setHeader('Cache-Control', 'no-store'); res.status(s).json(o); };
exports.code = c => String(c || '').toLowerCase().replace(/[^a-z0-9]/g, '').slice(0, 12);
