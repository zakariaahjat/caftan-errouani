const DB_KEY = "errouani_db_v5";
const CART_KEY = "errouani_cart";

var _apiBase = "http://localhost:3001/api";
var _apiAvailable = null;

async function apiFetch(path, opts) {
  try {
    var r = await fetch(_apiBase + path, Object.assign({ headers: { "Content-Type": "application/json" } }, opts || {}));
    if (!r.ok) throw new Error(r.status);
    _apiAvailable = true;
    return await r.json();
  } catch (e) {
    if (_apiAvailable === null) _apiAvailable = false;
    return null;
  }
}

function localLoad() {
  try {
    var raw = localStorage.getItem(DB_KEY);
    if (raw) return JSON.parse(raw);
  } catch (e) {}
  return null;
}

function localSave(data) {
  try {
    localStorage.setItem(DB_KEY, JSON.stringify(data));
  } catch (e) {
    if (typeof toast === "function") toast("Mmoire pleine.");
    else alert("Mmoire du navigateur pleine.");
  }
}

function migrateKeys(data) {
  var seed = buildSeedDB();
  ["rentals", "shop", "accessories", "packs", "parties", "orders", "reservations", "messages", "settings", "promos"].forEach(function(k) {
    if (!Array.isArray(data[k]) && typeof data[k] !== "object") data[k] = seed[k];
  });
  return data;
}

var DB = {
  data: null,

  load: function() {
    var data = localLoad();
    if (!data) data = buildSeedDB();
    data = migrateKeys(data);
    this.data = data;
    localSave(data);
    try {
      if (this.data.settings && this.data.settings.site) Object.assign(SITE, this.data.settings.site);
    } catch (e) {}
    this._syncFromAPI();
    return this.data;
  },

  _syncFromAPI: function() {
    var self = this;
    apiFetch("/db").then(function(apiData) {
      if (apiData) {
        apiData = migrateKeys(apiData);
        self.data = apiData;
        localSave(apiData);
        try {
          if (self.data.settings && self.data.settings.site) Object.assign(SITE, self.data.settings.site);
        } catch (e) {}
        if (typeof go === "function" && typeof state !== "undefined" && typeof state.section !== "undefined") {
          go(state.section);
        }
      }
    });
  },

  save: function() {
    localSave(this.data);
    apiFetch("/db", { method: "PUT", body: JSON.stringify(this.data) });
  },

  reset: function() {
    localStorage.removeItem(DB_KEY);
    var data = buildSeedDB();
    this.data = data;
    localSave(data);
    apiFetch("/db", { method: "PUT", body: JSON.stringify(data) });
  },

  id: function(prefix) {
    return prefix + Date.now().toString(36) + Math.random().toString(36).slice(2, 6);
  }
};

var Cart = {
  items: function() {
    try { return JSON.parse(localStorage.getItem(CART_KEY)) || []; } catch (e) { return []; }
  },
  save: function(items) {
    localStorage.setItem(CART_KEY, JSON.stringify(items));
    if (typeof refreshCartBadge === "function") refreshCartBadge();
  },
  add: function(productId, size, qty) {
    qty = qty || 1;
    var items = this.items();
    var existing = items.find(function(i) { return i.id === productId && i.size === size; });
    if (existing) existing.qty += qty;
    else items.push({ id: productId, size: size, qty: qty });
    this.save(items);
  },
  updateQty: function(productId, size, qty) {
    var items = this.items();
    var it = items.find(function(i) { return i.id === productId && i.size === size; });
    if (it) {
      it.qty = Math.max(1, qty);
      this.save(items);
    }
  },
  remove: function(productId, size) {
    var items = this.items().filter(function(i) { return !(i.id === productId && i.size === size); });
    this.save(items);
  },
  clear: function() { this.save([]); },
  count: function() {
    return this.items().reduce(function(n, i) { return n + i.qty; }, 0);
  },
  detailed: function() {
    var db = DB.data || {};
    return this.items().map(function(i) {
      var p = (db.shop || []).find(function(s) { return s.id === i.id; });
      return p ? Object.assign({}, p, { cartSize: i.size, cartQty: i.qty }) : null;
    }).filter(Boolean);
  },
  total: function() {
    return this.detailed().reduce(function(t, p) { return t + p.price * p.cartQty; }, 0);
  }
};

DB.load();
