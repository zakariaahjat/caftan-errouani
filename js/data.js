const DB_KEY = "errouani_db_v5";
const CART_KEY = "errouani_cart";
const API_BASE = (location.hostname === "localhost" || location.hostname === "127.0.0.1")
  ? "http://localhost:3001/api"
  : "";

async function apiFetch(path, opts) {
  if (!API_BASE) return null;
  try {
    const r = await fetch(API_BASE + path, Object.assign({ headers: { "Content-Type": "application/json" } }, opts || {}));
    if (!r.ok) throw new Error(r.status);
    return await r.json();
  } catch (e) {
    return null;
  }
}

function localLoad() {
  try {
    const raw = localStorage.getItem(DB_KEY);
    if (raw) return JSON.parse(raw);
  } catch (e) {}
  return null;
}

function localSave(data) {
  try {
    localStorage.setItem(DB_KEY, JSON.stringify(data));
  } catch (e) {
    if (typeof toast === "function") toast("⚠️ Mémoire pleine — supprimez d'anciennes photos importées.");
    else alert("Mémoire du navigateur pleine.");
  }
}

function migrateKeys(data) {
  var seed = buildSeedDB();
  ["rentals", "shop", "accessories", "packs", "parties", "orders", "reservations", "messages", "settings", "promos"].forEach(function(k) {
    if (!Array.isArray(data[k]) && typeof data[k] !== "object") data[k] = seed[k];
  });
  return data;
}

const DB = {
  data: null,

  load() {
    var data = localLoad();
    if (!data) {
      data = buildSeedDB();
    }
    data = migrateKeys(data);
    this.data = data;
    localSave(data);
    try {
      if (this.data.settings && this.data.settings.site) Object.assign(SITE, this.data.settings.site);
    } catch (e) {}
    this._syncFromAPI();
    return this.data;
  },

  async _syncFromAPI() {
    var apiData = await apiFetch("/db");
    if (apiData) {
      apiData = migrateKeys(apiData);
      this.data = apiData;
      localSave(apiData);
      try {
        if (this.data.settings && this.data.settings.site) Object.assign(SITE, this.data.settings.site);
      } catch (e) {}
      if (typeof go === "function" && typeof state !== "undefined" && typeof state.section !== "undefined") {
        go(state.section);
      }
    }
  },

  save() {
    localSave(this.data);
    apiFetch("/db", { method: "PUT", body: JSON.stringify(this.data) }).catch(function() {});
  },

  reset() {
    localStorage.removeItem(DB_KEY);
    var data = buildSeedDB();
    this.data = data;
    localSave(data);
    apiFetch("/db", { method: "PUT", body: JSON.stringify(data) }).catch(function() {});
  },

  id(prefix) {
    return prefix + Date.now().toString(36) + Math.random().toString(36).slice(2, 6);
  }
};

const Cart = {
  items() {
    try { return JSON.parse(localStorage.getItem(CART_KEY)) || []; } catch (e) { return []; }
  },
  save(items) {
    localStorage.setItem(CART_KEY, JSON.stringify(items));
    if (typeof refreshCartBadge === "function") refreshCartBadge();
  },
  add(productId, size, qty) {
    qty = qty || 1;
    const items = this.items();
    const existing = items.find(i => i.id === productId && i.size === size);
    if (existing) existing.qty += qty;
    else items.push({ id: productId, size: size, qty: qty });
    this.save(items);
  },
  updateQty(productId, size, qty) {
    let items = this.items();
    const it = items.find(i => i.id === productId && i.size === size);
    if (it) {
      it.qty = Math.max(1, qty);
      this.save(items);
    }
  },
  remove(productId, size) {
    let items = this.items().filter(i => !(i.id === productId && i.size === size));
    this.save(items);
  },
  clear() {
    this.save([]);
  },
  count() {
    return this.items().reduce((n, i) => n + i.qty, 0);
  },
  detailed() {
    const db = DB.data || {};
    return this.items().map(i => {
      const p = (db.shop || []).find(s => s.id === i.id);
      return p ? Object.assign({}, p, { cartSize: i.size, cartQty: i.qty }) : null;
    }).filter(Boolean);
  },
  total() {
    return this.detailed().reduce((t, p) => t + p.price * p.cartQty, 0);
  }
};

DB.load();
