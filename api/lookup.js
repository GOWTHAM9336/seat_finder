// Student lookup. Returns ONLY the caller's own seat, and only after the release time.
const { getDb } = require("../lib/db");
const { isDate, isSession, fmtIST, clean, RELEASE_MINUTES } = require("../lib/common");

module.exports = async (req, res) => {
  res.setHeader("Cache-Control", "no-store");
  if (req.method !== "POST") return res.status(405).json({ message: "Method not allowed" });
  try {
    const b = req.body || {};
    const reg = clean(b.reg, 30).toUpperCase();
    if (!reg || !isDate(b.date) || !isSession(b.session))
      return res.status(400).json({ message: "Enter register number, session and date." });

    const db = await getDb();
    const doc = await db.collection("sittings").findOne(
      { _id: b.date + "|" + b.session },
      { projection: { startAt: 1, releaseAt: 1, halls: 1, alloc: { $elemMatch: { reg } } } }
    );
    if (!doc)
      return res.status(404).json({ message: "Seating for this date and session is not published yet." });

    if (Date.now() < new Date(doc.releaseAt).getTime())
      return res.status(403).json({
        code: "not_released",
        message: "Seating opens at " + fmtIST(doc.releaseAt) + " (" + RELEASE_MINUTES + " minutes before the exam). Please check back then.",
      });

    const student = doc.alloc && doc.alloc[0];
    if (!student)
      return res.status(404).json({ message: "No seat found for " + reg + ". Check the details or contact the exam cell." });

    const hall = (doc.halls || []).find((h) => h.name === student.hall) || null;
    return res.status(200).json({ student, hall, startAt: doc.startAt });
  } catch (e) {
    console.error(e);
    return res.status(500).json({ message: "Server error. Please try again." });
  }
};
