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
let _fallback = null;

module.exports = async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET,PUT,OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
  if (req.method === "OPTIONS") return res.status(200).end();

  try {
    const kv = getKV();

    if (req.method === "GET") {
      let data = null;
      if (kv) {
        data = await kv.get(DB_KEY);
      } else if (_fallback) {
        data = _fallback;
      }
      if (!data) {
        data = require("./seed.json");
        if (kv) await kv.set(DB_KEY, data);
        _fallback = data;
      }
      return res.status(200).json(data);
    }

    if (req.method === "PUT") {
      const data = req.body;
      if (!data || !data.rentals) return res.status(400).json({ error: "Invalid data" });
      if (kv) await kv.set(DB_KEY, data);
      _fallback = data;
      return res.status(200).json({ ok: true });
    }

    res.status(405).json({ error: "Method not allowed" });
  } catch (err) {
    console.error("API error:", err);
    res.status(500).json({ error: err.message });
  }
};
