const crypto = require("crypto");
const RELEASE_MINUTES = parseInt(process.env.RELEASE_MINUTES || "60", 10);

const isDate = (s) => /^\d{4}-\d{2}-\d{2}$/.test(String(s || ""));
const isTime = (s) => /^([01]\d|2[0-3]):[0-5]\d$/.test(String(s || ""));
const isSession = (s) => s === "FN" || s === "AN";

// Exam times are entered in Indian Standard Time (UTC+05:30)
const startAt = (date, time) => new Date(date + "T" + time + ":00+05:30");
const releaseAt = (start) => new Date(start.getTime() - RELEASE_MINUTES * 60000);
const fmtIST = (d) =>
  new Date(d).toLocaleString("en-IN", {
    timeZone: "Asia/Kolkata", day: "numeric", month: "short", year: "numeric",
    hour: "numeric", minute: "2-digit",
  });

function isAdmin(req) {
  const real = process.env.ADMIN_PASSWORD || "";
  if (!real) return false;
  const given = String(req.headers["x-admin-password"] || "");
  const h = (v) => crypto.createHash("sha256").update(v).digest();
  return crypto.timingSafeEqual(h(real), h(given));
}
const clean = (v, n) => String(v == null ? "" : v).replace(/[<>]/g, "").trim().slice(0, n);

module.exports = { RELEASE_MINUTES, isDate, isTime, isSession, startAt, releaseAt, fmtIST, isAdmin, clean };
