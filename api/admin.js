// Exam cell API. Every action needs the X-Admin-Password header.
const { getDb } = require("../lib/db");
const { isDate, isTime, isSession, startAt, releaseAt, isAdmin, clean } = require("../lib/common");

module.exports = async (req, res) => {
  res.setHeader("Cache-Control", "no-store");
  if (req.method !== "POST") return res.status(405).json({ message: "Method not allowed" });
  if (!isAdmin(req)) {
    await new Promise((r) => setTimeout(r, 600)); // slow down password guessing
    return res.status(401).json({ message: "Wrong password." });
  }
  try {
    const b = req.body || {};
    const col = (await getDb()).collection("sittings");

    if (b.action === "list") {
      const sittings = await col.find({}, { projection: { halls: 0, alloc: 0 } }).sort({ _id: 1 }).toArray();
      return res.status(200).json({ sittings });
    }
    if (b.action === "get") {
      const sitting = await col.findOne({ _id: String(b.id || "") });
      return sitting ? res.status(200).json({ sitting }) : res.status(404).json({ message: "Not found" });
    }
    if (b.action === "delete") {
      await col.deleteOne({ _id: String(b.id || "") });
      return res.status(200).json({ ok: true });
    }
    if (b.action === "save") {
      if (!isDate(b.date) || !isSession(b.session) || !isTime(b.time))
        return res.status(400).json({ message: "Date, session and start time are required." });
      if (!Array.isArray(b.alloc) || !b.alloc.length || b.alloc.length > 20000 || !Array.isArray(b.halls) || b.halls.length > 200)
        return res.status(400).json({ message: "Invalid allocation." });

      const halls = b.halls.map((h) => ({ name: clean(h.name, 40), rows: +h.rows | 0, cols: +h.cols | 0 }));
      const alloc = b.alloc.map((a) => ({
        reg: clean(a.reg, 30).toUpperCase(), name: clean(a.name, 80), dept: clean(a.dept, 60),
        hall: clean(a.hall, 40), row: +a.row | 0, col: +a.col | 0, seat: +a.seat | 0,
      }));
      const start = startAt(b.date, b.time), rel = releaseAt(start);
      const doc = {
        _id: b.date + "|" + b.session, date: b.date, session: b.session,
        startAt: start, releaseAt: rel, count: alloc.length, halls, alloc, updatedAt: new Date(),
      };
      await col.replaceOne({ _id: doc._id }, doc, { upsert: true });
      return res.status(200).json({ ok: true, id: doc._id, releaseAt: rel });
    }
    return res.status(400).json({ message: "Unknown action" });
  } catch (e) {
    console.error(e);
    return res.status(500).json({ message: "Server error." });
  }
};
