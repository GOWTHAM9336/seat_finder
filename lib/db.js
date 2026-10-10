const { MongoClient } = require("mongodb");
let cached = null;
function getDb() {
  if (!cached) {
    if (!process.env.MONGODB_URI) throw new Error("MONGODB_URI is not set");
    cached = new MongoClient(process.env.MONGODB_URI)
      .connect()
      .then((c) => c.db(process.env.MONGODB_DB || "kmgseat"));
  }
  return cached;
}
module.exports = { getDb };
