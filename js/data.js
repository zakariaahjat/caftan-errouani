const DB_KEY = "errouani_db_v5";
const CART_KEY = "errouani_cart";

const DB = {
  data: null,
  load() {
    try {
      const raw = localStorage.getItem(DB_KEY);
      if (raw) {
        this.data = JSON.parse(raw);
        const seed = buildSeedDB();
        ["rentals", "shop", "accessories", "packs", "parties", "orders", "reservations", "messages", "settings"].forEach(k => {
          if (!Array.isArray(this.data[k]) && typeof this.data[k] !== "object") this.data[k] = seed[k];
        });
      } else {
        this.data = buildSeedDB();
        this.save();
      }
    } catch (e) {
      this.data = buildSeedDB();
    }
    try {
      if (this.data.settings && this.data.settings.site) Object.assign(SITE, this.data.settings.site);
    } catch (e) {}
    return this.data;
  },
  save() {
    try {
      localStorage.setItem(DB_KEY, JSON.stringify(this.data));
    } catch (e) {
      if (typeof toast === "function") toast("⚠️ Mémoire pleine — supprimez d'anciennes photos importées ou utilisez des URL.");
      else alert("Mémoire du navigateur pleine : supprimez d'anciennes photos importées ou utilisez des URL.");
    }
  },
  reset() {
    localStorage.removeItem(DB_KEY);
    this.load();
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
    const db = DB.data || DB.load();
    return this.items().map(i => {
      const p = db.shop.find(s => s.id === i.id);
      return p ? Object.assign({}, p, { cartSize: i.size, cartQty: i.qty }) : null;
    }).filter(Boolean);
  },
  total() {
    return this.detailed().reduce((t, p) => t + p.price * p.cartQty, 0);
  }
};

DB.load();
