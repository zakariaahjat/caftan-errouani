let _kv = null;
function getKV() {
  if (_kv === null) {
    try {
      if (process.env.KV_REST_API_URL && process.env.KV_REST_API_TOKEN) {
        _kv = require("@vercel/kv").kv;
      } else {
        _kv = false;
      }
    } catch (e) {
      _kv = false;
    }
  }
  return _kv;
}

const DB_KEY = "errouani_db";

module.exports = async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST,OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
  if (req.method === "OPTIONS") return res.status(200).end();

  if (req.method === "POST") {
    try {
      const seed = require("./seed.json");
      const kv = getKV();
      if (kv) await kv.set(DB_KEY, seed);
      return res.status(200).json({ ok: true });
    } catch (err) {
      return res.status(500).json({ error: err.message });
    }
  }

  res.status(405).json({ error: "Method not allowed" });
};
