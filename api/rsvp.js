// POST /api/rsvp  { code, attending, count, message }
const db = require('../lib/db');
module.exports = async (req, res) => {
  if (req.method !== 'POST') return db.json(res, 405, { error: 'Method not allowed' });
  try {
    const b = req.body || {}, c = db.code(b.code);
    const g = c.length >= 6 && (await db.get(c));
    if (!g) return db.json(res, 404, { error: 'We could not find your invitation.' });
    const attending = b.attending === true;
    g.rsvp = {
      attending,
      count: attending ? Math.min(g.seats, Math.max(1, parseInt(b.count) || 1)) : 0,
      message: String(b.message || '').trim().slice(0, 300),
      at: new Date().toISOString()
    };
    await db.set(c, g);
    db.json(res, 200, { name: g.name, rsvp: g.rsvp });
  } catch (e) { db.json(res, 500, { error: 'Something went wrong. Please try again.' }); }
};
