const { kv } = require("@vercel/kv");

const DB_KEY = "errouani_db";

module.exports = async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST,OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") return res.status(200).end();

  if (req.method === "POST") {
    try {
      const seed = require("../../backend/data/seed.json");
      await kv.set(DB_KEY, seed);
      return res.status(200).json({ ok: true, data: seed });
    } catch (err) {
      console.error("Reset error:", err);
      return res.status(500).json({ error: "Reset failed" });
    }
  }

  res.status(405).json({ error: "Method not allowed" });
};
