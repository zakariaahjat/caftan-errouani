const { kv } = require("@vercel/kv");

const DB_KEY = "errouani_db";

module.exports = async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET,PUT,OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") return res.status(200).end();

  try {
    if (req.method === "GET") {
      let data = await kv.get(DB_KEY);
      if (!data) {
        const seed = require("../../backend/data/seed.json");
        data = seed;
        await kv.set(DB_KEY, data);
      }
      return res.status(200).json(data);
    }

    if (req.method === "PUT") {
      const data = req.body;
      if (!data || !data.rentals) return res.status(400).json({ error: "Invalid data" });
      await kv.set(DB_KEY, data);
      return res.status(200).json({ ok: true });
    }

    res.status(405).json({ error: "Method not allowed" });
  } catch (err) {
    console.error("API error:", err);
    res.status(500).json({ error: "Server error" });
  }
};
