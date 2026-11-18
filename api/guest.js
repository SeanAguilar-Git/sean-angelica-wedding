// GET /api/guest?code=xxxx  -> { name, seats, rsvp }
const db = require('../lib/db');
module.exports = async (req, res) => {
  try {
    const c = db.code(req.query.code);
    if (c.length < 6) return db.json(res, 400, { error: 'Invalid link' });
    const g = await db.get(c);
    if (!g) return db.json(res, 404, { error: 'Guest not found' });
    db.json(res, 200, { name: g.name, seats: g.seats, rsvp: g.rsvp });
  } catch (e) { db.json(res, 500, { error: 'Something went wrong' }); }
};
