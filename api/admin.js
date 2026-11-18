// Couple-only: GET list · POST add guests · DELETE ?code=   (Authorization: Bearer ADMIN_PASSWORD)
const crypto = require('crypto'), db = require('../lib/db');
module.exports = async (req, res) => {
  if (!db.isAdmin(req)) return db.json(res, 401, { error: 'Wrong password' });
  try {
    if (req.method === 'GET') {
      const guests = (await db.all()).sort((a, b) => a.name.localeCompare(b.name));
      return db.json(res, 200, { guests });
    }
    if (req.method === 'POST') {
      const list = Array.isArray(req.body && req.body.guests) ? req.body.guests.slice(0, 200) : [];
      let added = 0;
      for (const x of list) {
        const name = String(x.name || '').trim().slice(0, 80);
        if (!name) continue;
        const code = crypto.randomBytes(5).toString('hex');
        await db.set(code, { code, name, seats: Math.min(10, Math.max(1, parseInt(x.seats) || 1)), rsvp: null });
        added++;
      }
      return db.json(res, 200, { added });
    }
    if (req.method === 'DELETE') {
      const c = db.code(req.query.code);
      if (c) await db.del(c);
      return db.json(res, 200, { ok: true });
    }
    db.json(res, 405, { error: 'Method not allowed' });
  } catch (e) { db.json(res, 500, { error: 'Something went wrong' }); }
};
