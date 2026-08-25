const SESSION_KEY = "errouani_admin_session";
const state = { section: "dash" };

function $(sel) { return document.querySelector(sel); }
function $$(sel) { return document.querySelectorAll(sel); }

let toastTimerA;
function toast(msg) {
  const t = $("#adm-toast");
  t.textContent = msg;
  t.classList.add("show");
  clearTimeout(toastTimerA);
  toastTimerA = setTimeout(() => t.classList.remove("show"), 2600);
}

const ICON_LIST = {
  caftan: "Caftan", takchita: "Takchita", djellaba: "Djellaba", ensemble: "Ensemble / Blousa",
  tray: "Plateau", box: "Boîte", candle: "Bougie", cushion: "Coussin / Mdamma",
  mirror: "Présentoir", teapot: "Théière", lantern: "Lanterne", vase: "Vase / Fleurs", star: "Bijou / Étoile"
};
const SHOP_CATS = ["Caftans", "Takchitas", "Djellabas", "Ensembles traditionnels", "Accessoires"];
const STYLES = ["Traditionnel", "Moderne", "Takchita", "Djellaba", "Blousa"];
const ORDER_STATUS = ["Nouvelle", "Confirmée", "Expédiée", "Livrée", "Annulée"];
const RES_STATUS = ["En attente", "Confirmée", "Refusée"];

const CAL_ICON = '<rect x="3" y="4" width="18" height="18" rx="2"/><path d="M16 2v4M8 2v4M3 10h18"/>';
const GIFT_ICON = '<rect x="3" y="8" width="18" height="4" rx="1"/><path d="M12 8v13M5 12v7a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2v-7"/><path d="M12 8a3 3 0 1 0-3-3c0 2 3 3 3 3Zm0 0a3 3 0 1 1 3-3c0 2-3 3-3 3Z"/>';
const POPUP_ICON = '<rect x="3" y="3" width="18" height="18" rx="2"/><path d="M12 8v8M8 12h8"/>';
const NAV = [
  ["dash", "Tableau de bord", UI_ICONS.sparkle],
  ["rentals", "Caftans à louer", UI_ICONS.gem],
  ["shop", "Boutique (vente)", UI_ICONS.cart],
  ["acc", "Accessoires", UI_ICONS.star],
  ["parties", "Packs fêtes", GIFT_ICON],
  ["packs", "Formules déco", UI_ICONS.heart],
  ["orders", "Commandes", UI_ICONS.truck],
  ["reservations", "Réservations", UI_ICONS.ruler],
  ["avail", "Disponibilités", CAL_ICON],
  ["messages", "Messages", UI_ICONS.wa],
  ["promos", "Popups / Offres", POPUP_ICON],
  ["settings", "Paramètres", UI_ICONS.shield]
];

function renderNav(badges) {
  $("#as-nav").innerHTML = NAV.map(n => {
    const b = badges[n[0]];
    return `<a href="#" data-sec="${n[0]}" class="${state.section === n[0] ? "active" : ""}">
      ${svgIcon(n[2], 19)}<span>${n[1]}</span>
      ${b ? `<span class="as-badge">${b}</span>` : ""}
    </a>`;
  }).join("");
}

function computeBadges() {
  const db = DB.data;
  return {
    reservations: db.reservations.filter(r => r.status === "En attente").length || "",
    messages: db.messages.filter(m => !m.read).length || "",
    orders: db.orders.filter(o => o.status === "Nouvelle").length || ""
  };
}

function go(section) {
  state.section = section;
  renderNav(computeBadges());
  const titles = Object.fromEntries(NAV.map(n => [n[0], n[1]]));
  $("#adm-title").textContent = titles[section];
  const views = { dash: viewDash, rentals: viewRentals, shop: viewShop, acc: viewAcc, parties: viewParties, packs: viewPacks, orders: viewOrders, reservations: viewReservations, avail: viewAvail, messages: viewMessages, promos: viewPromos, settings: viewSettings };
  (views[section] || viewDash)();
  $("#adm-side").classList.remove("open");
}

function openModal(title, fieldsHtml, onSave) {
  $("#modal-title").textContent = title;
  $("#modal-body").innerHTML = fieldsHtml;
  $("#adm-modal").classList.add("show");
  const saveBtn = $("#modal-save");
  const clone = saveBtn.cloneNode(true);
  saveBtn.replaceWith(clone);
  if (!onSave) { clone.style.display = "none"; return; }
  clone.style.display = "";
  clone.addEventListener("click", () => {
    const values = {};
    document.querySelectorAll("#modal-body [data-f]").forEach(inp => {
      if (inp.type === "checkbox") values[inp.dataset.f] = inp.checked;
      else values[inp.dataset.f] = inp.value.trim();
    });
    const err = onSave(values);
    if (err) { toast(err); return; }
    closeModal();
    DB.save();
    go(state.section);
    toast("Enregistré avec succès ✓");
  });
}
function closeModal() { $("#adm-modal").classList.remove("show"); }

function f(name, label, value, opts) {
  opts = opts || {};
  const full = opts.full ? "mf-full" : "";
  if (opts.type === "textarea") {
    return `<div class="mf-field ${full}"><label>${label}</label><textarea data-f="${name}" rows="${opts.rows || 3}" placeholder="${opts.placeholder || ""}">${esc(value == null ? "" : value)}</textarea>${opts.hint ? `<span class="mf-hint">${opts.hint}</span>` : ""}</div>`;
  }
  if (opts.type === "select") {
    return `<div class="mf-field ${full}"><label>${label}</label><select data-f="${name}">${opts.options.map(o => `<option value="${esc(o)}" ${o === value ? "selected" : ""}>${esc(o)}</option>`).join("")}</select></div>`;
  }
  if (opts.type === "checkbox") {
    return `<div class="mf-check mf-full"><input type="checkbox" data-f="${name}" id="cb-${name}" ${value ? "checked" : ""}><label for="cb-${name}">${label}</label></div>`;
  }
  return `<div class="mf-field ${full}"><label>${label}</label><input type="${opts.type || "text"}" data-f="${name}" value="${esc(value == null ? "" : value)}" placeholder="${opts.placeholder || ""}">${opts.hint ? `<span class="mf-hint">${opts.hint}</span>` : ""}</div>`;
}

function thumb(p) { return `<img src="${productImg(p)}"${imgAttrs(p)} alt="">`; }

/* ===== Images : URL + import de fichiers + galerie multi-images ===== */
function mediaBlockHTML(mode, p) {
  const singleVal = mode === "single" ? ((p && p.img) || "") : "";
  return `
  <div class="mf-field mf-full media-block" id="media-block">
    <label>${mode === "gallery" ? "Photos du produit — galerie multi-images" : "Photo du produit"}</label>
    <div class="mb-strip" id="mb-strip"></div>
    <div class="mb-actions">
      <label class="abtn mb-file">📁 Importer ${mode === "gallery" ? "des photos (multi)" : "une photo"}<input type="file" accept="image/*"${mode === "gallery" ? " multiple" : ""} id="mb-files"></label>
      <input type="url" class="mb-url" id="mb-url" placeholder="…ou coller une URL puis ➕">
      <button type="button" class="abtn" id="mb-addurl">➕</button>
    </div>
    <span class="mf-hint">${mode === "gallery"
      ? "La 1ʳᵉ photo est la principale · ✖ retire une photo · imports compressés automatiquement."
      : "Importez un fichier OU collez une URL — compression automatique à l'import."}</span>
    ${mode === "single" ? `<input type="hidden" data-f="img" value="${esc(singleVal)}">` : ""}
    <textarea data-f="gallery" style="display:none">${esc(JSON.stringify((p && p.gallery) || []))}</textarea>
  </div>`;
}

function wireMediaBlock(mode) {
  const blk = document.getElementById("media-block");
  if (!blk) return;
  const strip = document.getElementById("mb-strip");
  const filesIn = document.getElementById("mb-files");
  const urlIn = document.getElementById("mb-url");
  const addBtn = document.getElementById("mb-addurl");
  const imgField = blk.querySelector('[data-f="img"]');
  const galField = blk.querySelector('[data-f="gallery"]');
  let gal = [];
  try { gal = JSON.parse(galField.value || "[]"); } catch (e) { gal = []; }
  if (!Array.isArray(gal)) gal = [];

  function render() {
    strip.innerHTML = "";
    const list = mode === "single" ? [imgField.value] : gal;
    list.filter(Boolean).forEach(function (src, i) {
      const d = document.createElement("div");
      d.className = "mb-thumb" + (mode === "gallery" && i === 0 ? " mb-main" : "");
      const im = new Image(); im.src = src; im.alt = "";
      d.appendChild(im);
      const x = document.createElement("button");
      x.type = "button"; x.className = "mb-x"; x.textContent = "✖"; x.title = "Retirer";
      x.addEventListener("click", function () {
        if (mode === "single") imgField.value = "";
        else { gal.splice(i, 1); galField.value = JSON.stringify(gal); }
        render();
      });
      d.appendChild(x);
      if (mode === "gallery" && i === 0 && src) {
        const t = document.createElement("span"); t.className = "mb-tag"; t.textContent = "Principale";
        d.appendChild(t);
      }
      strip.appendChild(d);
    });
    if (!strip.children.length) strip.innerHTML = '<span class="mb-empty">Aucune image pour le moment</span>';
  }

  async function addFiles(files) {
    let ok = 0;
    for (const fl of Array.from(files || [])) {
      try {
        const uri = await compressImage(fl, 1000, 0.72);
        if (mode === "single") imgField.value = uri; else gal.push(uri);
        ok++;
      } catch (e) { toast("Image illisible : " + fl.name); }
    }
    galField.value = JSON.stringify(gal);
    render();
    if (ok) toast(ok + " photo(s) ajoutée(s) ✓");
  }

  filesIn.addEventListener("change", function () { addFiles(filesIn.files); filesIn.value = ""; });
  addBtn.addEventListener("click", function () {
    const u = urlIn.value.trim();
    if (!/^(https?:\/\/|images\/|data:image\/)/i.test(u)) { toast("URL invalide (http… ou images/…)"); return; }
    if (mode === "single") imgField.value = u; else gal.push(u);
    galField.value = JSON.stringify(gal);
    urlIn.value = "";
    render();
  });
  render();
}
function emptyRow(cols, msg) { return `<tr><td colspan="${cols}"><div class="empty-admin"><strong>Rien pour le moment</strong>${msg}</div></td></tr>`; }
function searchBox(ph) { return `<input type="search" class="adm-search" data-search placeholder="${ph || "Rechercher…"}" aria-label="Recherche">`; }

function bindTableSearch() {
  const inp = document.querySelector("#adm-content [data-search]");
  if (!inp) return;
  inp.addEventListener("input", () => {
    const q = inp.value.trim().toLowerCase();
    document.querySelectorAll("#adm-content tbody tr, #adm-content .msg-item").forEach(tr => {
      tr.style.display = !q || tr.textContent.toLowerCase().includes(q) ? "" : "none";
    });
  });
}

function orderDetail(o) {
  const rows = [
    ["Référence", o.ref],
    ["Date", new Date(o.created).toLocaleString("fr-FR")],
    ["Cliente", o.customer.name],
    ["Téléphone", o.customer.phone || "—"],
    ["Ville", o.customer.city || "—"],
    ["Adresse", o.customer.address || "—"],
    ["Livraison", o.customer.delivery === "point" ? "Point relais" : "Domicile"],
    ["Paiement", o.customer.payment || "—"],
    ["Note", o.customer.note || "—"]
  ];
  openModal("Commande " + o.ref, `
    <table class="adm-table" style="margin-bottom:1rem"><tbody>
      ${rows.map(r => `<tr><td style="width:120px;color:#8A7B5E;font-size:.85rem">${r[0]}</td><td style="font-size:.92rem">${esc(r[1])}</td></tr>`).join("")}
    </tbody></table>
    <strong>Articles commandés</strong>
    <ul style="margin:.6rem 0 0 1.2rem;line-height:2">
      ${o.items.map(i => `<li>${esc(i.name)} × ${i.qty} — ${money((i.price || 0) * i.qty)}</li>`).join("")}
    </ul>
    <div style="margin-top:1rem;text-align:right;font-size:1.15rem"><strong>Total : ${money(o.total)}</strong></div>
    <div style="margin-top:1.2rem;display:flex;gap:.7rem">
      <a class="btn btn-primary btn-sm" target="_blank" rel="noopener" href="${waLink(`Bonjour ${o.customer.name}, au sujet de votre commande ${o.ref} chez ${SITE.name}…`)}">Contacter sur WhatsApp</a>
    </div>`,
    null);
}

function viewDash() {
  const db = DB.data;
  const revenue = db.orders.filter(o => o.status !== "Annulée").reduce((t, o) => t + o.total, 0);
  const pending = db.reservations.filter(r => r.status === "En attente");
  const unread = db.messages.filter(m => !m.read).length;
  const lowStock = db.shop.filter(p => !p.stock || p.stock <= 0);
  const minPack = db.parties.length ? Math.min(...db.parties.map(p => p.price)) : null;
  const today = new Date().toISOString().slice(0, 10);
  const upcoming = db.reservations
    .filter(r => r.status !== "Refusée" && r.to >= today)
    .sort((a, b) => String(a.from).localeCompare(String(b.from)))
    .slice(0, 5);

  const totalRevenue = db.orders.reduce((s,o) => s + (o.total||0), 0);
  const ordersCount = db.orders.length;
  const resCount = db.reservations.length;
  const unreadMsgs = db.messages.filter(m => !m.read).length;
  const activeProducts = db.rentals.length + db.shop.length;
  const pendingCount = db.reservations.filter(r => r.status === "En attente").length + db.orders.filter(o => o.status === "Nouvelle").length;

  const stat = (target, small, strong, em) => `
    <div class="stat-card" data-go="${target}" role="button" tabindex="0">
      <small>${small}</small><strong>${strong}</strong>
      ${em ? `<em>${em}</em>` : ""}<span class="stat-arrow">→</span>
    </div>`;

  $("#adm-content").innerHTML = `
  <div class="adm-kpis">
    <div class="adm-kpi"><div class="adm-kpi-value">${money(totalRevenue)}</div><div class="adm-kpi-label">Revenus total</div></div>
    <div class="adm-kpi"><div class="adm-kpi-value">${ordersCount}</div><div class="adm-kpi-label">Commandes</div></div>
    <div class="adm-kpi"><div class="adm-kpi-value">${resCount}</div><div class="adm-kpi-label">Réservations</div></div>
    <div class="adm-kpi"><div class="adm-kpi-value">${unreadMsgs}</div><div class="adm-kpi-label">Messages non lus</div></div>
    <div class="adm-kpi"><div class="adm-kpi-value">${activeProducts}</div><div class="adm-kpi-label">Produits actifs</div></div>
    <div class="adm-kpi"><div class="adm-kpi-value">${pendingCount}</div><div class="adm-kpi-label">En attente</div></div>
  </div>

  <div class="stat-grid">
    ${stat("rentals", "Caftans à louer", db.rentals.length, db.rentals.filter(r => r.available !== false).length + " disponibles")}
    ${stat("shop", "Produits boutique", db.shop.length, lowStock.length ? lowStock.length + " épuisé(s)" : "stock OK")}
    ${stat("acc", "Accessoires", db.accessories.length, "")}
    ${stat("parties", "Packs fêtes", db.parties.length, minPack != null ? "dès " + money(minPack) : "")}
    ${stat("orders", "Chiffre d'affaires", money(revenue), db.orders.length + " commandes")}
    ${stat("reservations", "Rés. en attente", pending.length, "")}
    ${stat("messages", "Messages non lus", unread, "")}
  </div>

  ${(pending.length || lowStock.length || unread) ? `
  <div class="adm-panel dash-alerts">
    <div class="ap-head"><h3>⚠ À traiter en priorité</h3></div>
    <div class="da-list">
      ${pending.map(r => `<a href="#" data-go="reservations">📌 Demande de ${esc(r.name)} — « ${esc(r.productName)} » (${esc(r.from)} → ${esc(r.to)})</a>`).join("")}
      ${lowStock.map(p => `<a href="#" data-go="shop">📦 Rupture de stock : ${esc(p.name)}</a>`).join("")}
      ${unread ? `<a href="#" data-go="messages">✉ ${unread} message${unread > 1 ? "s" : ""} non lu${unread > 1 ? "s" : ""}</a>` : ""}
    </div>
  </div>` : ""}

  <div class="adm-panel">
    <div class="ap-head"><h3>Dernières commandes</h3><button class="abtn" data-go="orders">Tout voir →</button></div>
    <div class="adm-table-wrap"><table class="adm-table">
      <thead><tr><th>Réf.</th><th>Cliente</th><th>Date</th><th>Total</th><th>Statut</th></tr></thead>
      <tbody>${db.orders.slice(0, 5).map(o => `
        <tr><td><strong>${esc(o.ref)}</strong></td><td>${esc(o.customer.name)}</td><td>${new Date(o.created).toLocaleDateString("fr-FR")}</td><td>${money(o.total)}</td><td><span class="pill ${o.status === "Annulée" ? "pill-red" : o.status === "Livrée" ? "pill-green" : "pill-gold"}">${esc(o.status)}</span></td></tr>`).join("") || emptyRow(5, "Les commandes passées sur le site apparaîtront ici.")}
      </tbody></table></div>
  </div>

  <div class="adm-panel">
    <div class="ap-head"><h3>Prochaines réservations</h3><button class="abtn" data-go="reservations">Tout voir →</button></div>
    <div class="adm-table-wrap"><table class="adm-table">
      <thead><tr><th>Caftan</th><th>Dates</th><th>Cliente</th><th>Statut</th></tr></thead>
      <tbody>${upcoming.map(r => `
        <tr><td>${esc(r.productName)}</td><td>${esc(r.from)} → ${esc(r.to)}</td><td>${esc(r.name)}<br><small>${esc(r.phone || "")}</small></td><td><span class="pill ${r.status === "Confirmée" ? "pill-green" : "pill-gold"}">${esc(r.status)}</span></td></tr>`).join("") || emptyRow(4, "Aucune réservation à venir.")}
      </tbody></table></div>
  </div>`;
  document.querySelectorAll("#adm-content [data-go]").forEach(b =>
    b.addEventListener("click", e => { e.preventDefault(); go(b.dataset.go); }));
}

function rentalsTable(list) {
  return list.map(p => `
  <tr>
    <td><div class="tp-cell">${thumb(p)}<div><strong>${esc(p.name)}</strong><small>Tailles : ${(p.sizes || []).join(", ")}</small></div></div></td>
    <td>${esc(p.style || "")}</td>
    <td><span style="display:inline-flex;align-items:center;gap:.45rem"><i style="width:14px;height:14px;border-radius:50%;background:${esc(p.colorHex || "#175247")};display:inline-block"></i>${esc(p.color || "")}</span></td>
    <td><strong>${money(p.price)}</strong>/j</td>
    <td><span class="pill ${p.available ? "pill-green" : "pill-red"}">${p.available ? "Disponible" : "Réservé"}</span></td>
    <td><div class="row-actions">
      <a class="abtn" href="../location-produit.html?id=${p.id}" target="_blank">Voir ↗</a>
      <button class="abtn" data-avail-edit="${p.id}">Calendrier</button>
      <button class="abtn" data-rental-edit="${p.id}">Modifier</button>
      <button class="abtn abtn-danger" data-del="rentals|${p.id}">Suppr.</button>
    </div></td>
  </tr>`).join("");
}

function viewRentals() {
  const db = DB.data;
  $("#adm-content").innerHTML = `
  <div class="adm-panel">
    <div class="ap-head">
      <h3>Caftans à louer (${db.rentals.length})</h3>
      ${searchBox("Nom, couleur, style…")}
      <button class="btn-new" id="add-rental">+ Nouveau caftan</button>
    </div>
    <div class="adm-table-wrap"><table class="adm-table">
      <thead><tr><th>Caftan</th><th>Style</th><th>Couleur</th><th>Prix/jour</th><th>Dispo</th><th></th></tr></thead>
      <tbody>${rentalsTable(db.rentals) || emptyRow(6, "Ajoutez votre premier caftan à louer.")}</tbody>
    </table></div>
  </div>`;
  $("#add-rental").addEventListener("click", () => rentalForm(null));
  bindEditButtons();
}

function rentalForm(p) {
  const isNew = !p;
  p = p || {};
  const fields = `
    <div class="mf-grid">
      ${f("name", "Nom du caftan *", p.name, { placeholder: "Ex : Caftan Émeraude Nour", full: true })}
      ${f("style", "Style", p.style || "Traditionnel", { type: "select", options: STYLES })}
      ${f("color", "Couleur", p.color || "", { placeholder: "Ex : Émeraude" })}
      ${f("colorHex", "Nuance", p.colorHex || "#175247", { type: "color" })}
      ${f("sizes", "Tailles (séparées par des virgules)", (p.sizes || []).join(", "), { placeholder: "36, 38, 40" })}
      ${f("price", "Prix par jour (DH) *", p.price != null ? p.price : "", { type: "number" })}
      ${f("icon", "Icône illustrative", p.icon || "caftan", { type: "select", options: Object.keys(ICON_LIST) })}
      ${mediaBlockHTML("gallery", p)}
      ${f("available", "Actuellement disponible à la location", p.available !== false, { type: "checkbox" })}
      ${f("isNew", "Afficher dans « Nos nouveautés »", !!p.isNew, { type: "checkbox" })}
      ${f("desc", "Description", p.desc, { type: "textarea", full: true })}
      ${f("conditions", "Conditions de location (une ligne = une condition)", (p.conditions || []).join("\n"), { type: "textarea", full: true, rows: 4, placeholder: "Location de 1 à 3 jours\nCaution remboursable\nNettoyage inclus" })}
    </div>`;
  openModal(isNew ? "Nouveau caftan à louer" : "Modifier — " + p.name, fields, v => {
    if (!v.name || !v.price) return "Le nom et le prix sont obligatoires.";
    let gal = [];
    try { gal = JSON.parse(v.gallery || "[]").filter(Boolean); } catch (e) {}
    const obj = {
      name: v.name, style: v.style, color: v.color, colorHex: v.colorHex,
      sizes: v.sizes.split(",").map(s => s.trim()).filter(Boolean),
      price: Number(v.price), icon: v.icon,
      img: gal.length ? null : (v.img || null), gallery: gal,
      available: !!v.available, isNew: !!v.isNew, desc: v.desc,
      conditions: v.conditions.split("\n").map(s => s.trim()).filter(Boolean),
      availability: p.availability || {}
    };
    if (isNew) { obj.id = DB.id("r"); DB.data.rentals.unshift(obj); }
    else Object.assign(DB.data.rentals.find(x => x.id === p.id), obj);
  });
  wireMediaBlock("gallery");
}

function shopForm(p) {
  const isNew = !p;
  p = p || {};
  const fields = `
    <div class="mf-grid">
      ${f("name", "Nom du produit *", p.name, { placeholder: "Ex : Caftan Satin Tarz Raffiné", full: true })}
      ${f("category", "Catégorie", p.category || "Caftans", { type: "select", options: SHOP_CATS })}
      ${f("price", "Prix de vente (DH) *", p.price != null ? p.price : "", { type: "number" })}
      ${f("oldPrice", "Prix barré — promo (DH)", p.oldPrice || "", { type: "number", hint: "Laisser vide si pas de promotion." })}
      ${f("stock", "Stock disponible", p.stock != null ? p.stock : 1, { type: "number" })}
      ${f("sizes", "Tailles (virgules)", (p.sizes || []).join(", "), { placeholder: "S, M, L ou 38, 40, 42" })}
      ${f("colors", "Couleurs (virgules)", (p.colors || []).join(", "), { placeholder: "Émeraude, Doré" })}
      ${f("icon", "Icône illustrative", p.icon || "caftan", { type: "select", options: Object.keys(ICON_LIST) })}
      ${mediaBlockHTML("gallery", p)}
      ${f("isNew", "Afficher dans « Nos nouveautés »", !!p.isNew, { type: "checkbox" })}
      ${f("desc", "Description", p.desc, { type: "textarea", full: true })}
    </div>`;
  openModal(isNew ? "Nouveau produit boutique" : "Modifier — " + p.name, fields, v => {
    if (!v.name || !v.price) return "Le nom et le prix sont obligatoires.";
    let gal = [];
    try { gal = JSON.parse(v.gallery || "[]").filter(Boolean); } catch (e) {}
    const obj = {
      name: v.name, category: v.category, price: Number(v.price),
      oldPrice: v.oldPrice ? Number(v.oldPrice) : null,
      stock: Number(v.stock) || 0,
      sizes: v.sizes.split(",").map(s => s.trim()).filter(Boolean),
      colors: v.colors.split(",").map(s => s.trim()).filter(Boolean),
      icon: v.icon, img: gal.length ? null : (v.img || null), gallery: gal,
      isNew: !!v.isNew, desc: v.desc
    };
    if (isNew) { obj.id = DB.id("s"); DB.data.shop.unshift(obj); }
    else Object.assign(DB.data.shop.find(x => x.id === p.id), obj);
  });
  wireMediaBlock("gallery");
}

function accForm(p) {
  const isNew = !p;
  p = p || {};
  const cats = [...new Set(DB.data.accessories.map(a => a.category))];
  const fields = `
    <div class="mf-grid">
      ${f("name", "Nom de l'accessoire *", p.name, { placeholder: "Ex : Plateau doré de cérémonie", full: true })}
      ${f("category", "Catégorie", p.category || "Plateaux", { type: "select", options: cats.length ? cats : ["Plateaux"] })}
      ${f("price", "Prix de location (DH/jour) *", p.price != null ? p.price : "", { type: "number" })}
      ${f("available", "Actuellement disponible", p.available !== false, { type: "checkbox" })}
      ${f("icon", "Icône illustrative", p.icon || "tray", { type: "select", options: Object.keys(ICON_LIST) })}
      ${mediaBlockHTML("single", p)}
      ${f("desc", "Description", p.desc, { type: "textarea", full: true })}
    </div>`;
  openModal(isNew ? "Nouvel accessoire" : "Modifier — " + p.name, fields, v => {
    if (!v.name || !v.price) return "Le nom et le prix sont obligatoires.";
    const obj = { name: v.name, category: v.category, price: Number(v.price), available: !!v.available, icon: v.icon, img: v.img || null, desc: v.desc };
    if (isNew) { obj.id = DB.id("a"); DB.data.accessories.unshift(obj); }
    else Object.assign(DB.data.accessories.find(x => x.id === p.id), obj);
  });
  wireMediaBlock("single");
}

function packForm(pk) {
  const isNew = !pk;
  pk = pk || {};
  const fields = `
    <div class="mf-grid">
      ${f("name", "Nom de la formule *", pk.name, { placeholder: "Ex : Premium", full: true })}
      ${f("price", "Tarif de départ (DH) — 0 = sur devis *", pk.price != null ? pk.price : 0, { type: "number" })}
      ${f("featured", "Mettre en avant (« le plus choisi »)", !!pk.featured, { type: "checkbox" })}
      ${f("desc", "Description courte", pk.desc, { type: "textarea", full: true, rows: 2 })}
      ${f("includes", "Ce qui est inclus (une ligne = un point)", (pk.includes || []).join("\n"), { type: "textarea", full: true, rows: 6 })}
    </div>`;
  openModal(isNew ? "Nouvelle formule déco" : "Modifier — " + pk.name, fields, v => {
    if (!v.name || v.price === "") return "Le nom et le tarif sont obligatoires (0 pour « sur devis »).";
    const obj = {
      name: v.name, price: Number(v.price), featured: !!v.featured, desc: v.desc,
      includes: v.includes.split("\n").map(s => s.trim()).filter(Boolean)
    };
    if (isNew) { obj.id = DB.id("p"); DB.data.packs.push(obj); }
    else Object.assign(DB.data.packs.find(x => x.id === pk.id), obj);
  });
}

function viewShop() {
  const db = DB.data;
  $("#adm-content").innerHTML = `
  <div class="adm-panel">
    <div class="ap-head">
      <h3>Produits à vendre (${db.shop.length})</h3>
      ${searchBox("Nom, catégorie, taille…")}
      <button class="btn-new" id="add-shop">+ Nouveau produit</button>
    </div>
    <div class="adm-table-wrap"><table class="adm-table">
      <thead><tr><th>Produit</th><th>Catégorie</th><th>Prix</th><th>Promo</th><th>Stock</th><th></th></tr></thead>
      <tbody>${db.shop.map(p => `
        <tr>
          <td><div class="tp-cell">${thumb(p)}<div><strong>${esc(p.name)}</strong><small>Tailles : ${(p.sizes || []).join(", ")}</small></div></div></td>
          <td>${esc(p.category)}</td>
          <td><strong>${money(p.price)}</strong></td>
          <td>${p.oldPrice ? `<span class="pill pill-gold">−${Math.round((1 - p.price / p.oldPrice) * 100)}%</span>` : '<span class="pill pill-gray">—</span>'}</td>
          <td><span class="pill ${p.stock > 0 ? "pill-green" : "pill-red"}">${p.stock > 0 ? p.stock : "Épuisé"}</span></td>
          <td><div class="row-actions">
            <a class="abtn" href="../produit.html?id=${p.id}" target="_blank">Voir ↗</a>
            <button class="abtn" data-shop-edit="${p.id}">Modifier</button>
            <button class="abtn abtn-danger" data-del="shop|${p.id}">Suppr.</button>
          </div></td>
        </tr>`).join("") || emptyRow(6)}
      </tbody>
    </table></div>
  </div>`;
  $("#add-shop").addEventListener("click", () => shopForm(null));
  bindEditButtons();
}

function viewAcc() {
  const db = DB.data;
  $("#adm-content").innerHTML = `
  <div class="adm-panel">
    <div class="ap-head">
      <h3>Accessoires de fiançailles (${db.accessories.length})</h3>
      ${searchBox("Nom, catégorie…")}
      <button class="btn-new" id="add-acc">+ Nouvel accessoire</button>
    </div>
    <div class="adm-table-wrap"><table class="adm-table">
      <thead><tr><th>Accessoire</th><th>Catégorie</th><th>Prix/jour</th><th>Dispo</th><th></th></tr></thead>
      <tbody>${db.accessories.map(p => `
        <tr>
          <td><div class="tp-cell">${thumb(p)}<div><strong>${esc(p.name)}</strong><small>${esc((p.desc || "").slice(0, 46))}…</small></div></div></td>
          <td>${esc(p.category)}</td>
          <td><strong>${money(p.price)}</strong></td>
          <td><span class="pill ${p.available ? "pill-green" : "pill-red"}">${p.available ? "Oui" : "Non"}</span></td>
          <td><div class="row-actions">
            <button class="abtn" data-acc-edit="${p.id}">Modifier</button>
            <button class="abtn abtn-danger" data-del="accessories|${p.id}">Suppr.</button>
          </div></td>
        </tr>`).join("") || emptyRow(5)}
      </tbody>
    </table></div>
  </div>`;
  $("#add-acc").addEventListener("click", () => accForm(null));
  bindEditButtons();
}

function partyForm(p) {
  const isNew = !p;
  p = p || {};
  const occs = [...new Set(["Fiançailles", "Anniversaire", "Baby shower", "Henné", "Aïd / Fête", "Shooting photo"].concat(DB.data.parties.map(x => x.occasion)))];
  const fields = `
    <div class="mf-grid">
      ${f("name", "Nom du pack *", p.name, { placeholder: "Ex : Pack Fiançailles Intime", full: true })}
      ${f("occasion", "Occasion", p.occasion || "Fiançailles", { type: "select", options: occs })}
      ${f("price", "Tarif de départ (DH) *", p.price != null ? p.price : "", { type: "number" })}
      ${f("icon", "Icône illustrative", p.icon || "tray", { type: "select", options: Object.keys(ICON_LIST) })}
      ${mediaBlockHTML("single", p)}
      ${f("available", "Actuellement proposé sur le site", p.available !== false, { type: "checkbox" })}
      ${f("popular", "Badge « ★ Populaire »", !!p.popular, { type: "checkbox" })}
      ${f("desc", "Description courte", p.desc, { type: "textarea", full: true, rows: 2 })}
      ${f("includes", "Contenu du pack (une ligne = un élément)", (p.includes || []).join("\n"), { type: "textarea", full: true, rows: 6, placeholder: "Coin traditionnel\nPlateau d'alliances\nBougies & lanternes" })}
    </div>`;
  openModal(isNew ? "Nouveau pack de fête" : "Modifier — " + p.name, fields, v => {
    if (!v.name || v.price === "") return "Le nom et le tarif sont obligatoires.";
    const obj = {
      name: v.name, occasion: v.occasion, price: Number(v.price),
      icon: v.icon, img: v.img || null, available: !!v.available, popular: !!v.popular,
      desc: v.desc, includes: v.includes.split("\n").map(s => s.trim()).filter(Boolean)
    };
    if (isNew) { obj.id = DB.id("pt"); DB.data.parties.unshift(obj); }
    else Object.assign(DB.data.parties.find(x => x.id === p.id), obj);
  });
  wireMediaBlock("single");
}

function viewParties() {
  const db = DB.data;
  $("#adm-content").innerHTML = `
  <div class="adm-panel">
    <div class="ap-head">
      <h3>Packs de fête (${db.parties.length})</h3>
      ${searchBox("Nom, occasion…")}
      <button class="btn-new" id="add-party">+ Nouveau pack</button>
    </div>
    <div class="adm-table-wrap"><table class="adm-table">
      <thead><tr><th>Pack</th><th>Occasion</th><th>Tarif départ</th><th>Statut</th><th></th></tr></thead>
      <tbody>${db.parties.map(p => `
        <tr>
          <td><div class="tp-cell">${thumb(p)}<div><strong>${esc(p.name)}</strong><small>${(p.includes || []).length} éléments inclus${p.popular ? ' · <span class="pill pill-gold">★ Populaire</span>' : ""}</small></div></div></td>
          <td>${esc(p.occasion)}</td>
          <td><strong>${money(p.price)}</strong></td>
          <td><span class="pill ${p.available ? "pill-green" : "pill-red"}">${p.available ? "En ligne" : "Masqué"}</span></td>
          <td><div class="row-actions">
            <a class="abtn" href="../packs.html" target="_blank">Voir ↗</a>
            <button class="abtn" data-party-edit="${p.id}">Modifier</button>
            <button class="abtn abtn-danger" data-del="parties|${p.id}">Suppr.</button>
          </div></td>
        </tr>`).join("") || emptyRow(5)}
      </tbody>
    </table></div>
  </div>`;
  $("#add-party").addEventListener("click", () => partyForm(null));
  bindEditButtons();
}

function viewPacks() {
  const db = DB.data;
  $("#adm-content").innerHTML = `
  <div class="adm-panel">
    <div class="ap-head">
      <h3>Formules de décoration (${db.packs.length})</h3>
      ${searchBox("Nom, description…")}
      <button class="btn-new" id="add-pack">+ Nouvelle formule</button>
    </div>
    <div class="adm-table-wrap"><table class="adm-table">
      <thead><tr><th>Formule</th><th>Tarif départ</th><th>Mise en avant</th><th>Inclus</th><th></th></tr></thead>
      <tbody>${db.packs.map(pk => `
        <tr>
          <td><strong>${esc(pk.name)}</strong><br><small>${esc(pk.desc)}</small></td>
          <td><strong>${pk.price > 0 ? money(pk.price) : "Sur devis"}</strong></td>
          <td>${pk.featured ? '<span class="pill pill-gold">★ Mise en avant</span>' : '<span class="pill pill-gray">—</span>'}</td>
          <td><small>${pk.includes.map(esc).join("<br>")}</small></td>
          <td><div class="row-actions">
            <button class="abtn" data-pack-edit="${pk.id}">Modifier</button>
            <button class="abtn abtn-danger" data-del="packs|${pk.id}">Suppr.</button>
          </div></td>
        </tr>`).join("") || emptyRow(5)}
      </tbody>
    </table></div>
  </div>`;
  $("#add-pack").addEventListener("click", () => packForm(null));
  bindEditButtons();
}

function viewOrders() {
  const db = DB.data;
  $("#adm-content").innerHTML = `
  <div class="adm-panel">
    <div class="ap-head"><h3>Commandes boutique (${db.orders.length})</h3>${searchBox("Réf., cliente, ville…")}</div>
    <div class="adm-table-wrap"><table class="adm-table">
      <thead><tr><th>Réf.</th><th>Cliente</th><th>Articles</th><th>Livraison</th><th>Total</th><th>Statut</th><th></th></tr></thead>
      <tbody>${db.orders.map(o => `
        <tr>
          <td><strong>${esc(o.ref)}</strong><br><small>${new Date(o.created).toLocaleDateString("fr-FR")} ${new Date(o.created).toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" })}</small></td>
          <td>${esc(o.customer.name)}<br><small>${esc(o.customer.phone)} · ${esc(o.customer.city)}</small></td>
          <td><small>${o.items.map(i => esc(i.name) + " ×" + i.qty).join("<br>")}</small></td>
          <td><small>${o.customer.delivery === "point" ? "Point relais" : "Domicile"}<br>${esc(o.customer.payment || "—")}</small></td>
          <td><strong>${money(o.total)}</strong></td>
          <td><select class="adm-select" data-order-status="${o.id}">${ORDER_STATUS.map(s => `<option ${s === o.status ? "selected" : ""}>${s}</option>`).join("")}</select></td>
          <td><div class="row-actions">
            <button class="abtn abtn-primary" data-order-detail="${o.id}">Détails</button>
            <a class="abtn" target="_blank" rel="noopener" href="${waLink(`Bonjour ${o.customer.name}, au sujet de votre commande ${o.ref} chez ${SITE.name}…`)}">WhatsApp</a>
            <button class="abtn abtn-danger" data-del="orders|${o.id}">Suppr.</button>
          </div></td>
        </tr>`).join("") || emptyRow(7, "Les commandes vous parviennent aussi par WhatsApp 📲. Celles passées sur cet appareil s'affichent ici.")}
      </tbody>
    </table></div>
  </div>`;
  bindEditButtons();
}

function dateRange(from, to) {
  const out = [];
  const d = new Date(from + "T12:00:00");
  const end = new Date(to + "T12:00:00");
  while (d <= end) { out.push(d.toISOString().slice(0, 10)); d.setDate(d.getDate() + 1); }
  return out;
}

function viewReservations() {
  const db = DB.data;
  $("#adm-content").innerHTML = `
  <div class="adm-panel">
    <div class="ap-head"><h3>Demandes de réservation (${db.reservations.length})</h3>${searchBox("Cliente, caftan…")}</div>
    <div class="adm-table-wrap"><table class="adm-table">
      <thead><tr><th>Caftan</th><th>Periode</th><th>Cliente</th><th>Montant</th><th>Statut</th><th></th></tr></thead>
      <tbody>${db.reservations.map(r => `
        <tr>
          <td><strong>${esc(r.productName)}</strong>${r.promoCode ? '<br><small style="color:#175247">🏷️ ' + esc(r.promoCode) + ' (−' + (r.promoDiscount || 0) + ' DH)</small>' : ''}</td>
          <td>${esc(r.from)}<br>→ ${esc(r.to)}</td>
          <td>${esc(r.name)}<br><small>${esc(r.phone || "—")}</small></td>
          <td style="white-space:nowrap">${r.total ? '<strong>' + money(r.total) + '</strong>' + (r.promoDiscount ? '<br><small style="color:#175247"><s>' + money(r.baseTotal) + '</s></small>' : '') : '—'}</td>
          <td><select class="adm-select" data-res-status="${r.id}">${RES_STATUS.map(s => `<option ${s === r.status ? "selected" : ""}>${s}</option>`).join("")}</select></td>
          <td><div class="row-actions">
            <button class="abtn abtn-primary" data-block-dates="${r.id}" title="Marquer ces dates comme réservées dans le calendrier public">Bloquer les dates</button>
            <a class="abtn" target="_blank" rel="noopener" href="${waLink(`Bonjour ${r.name}, concernant votre demande de réservation pour « ${r.productName} » du ${r.from} au ${r.to}…`)}">WhatsApp</a>
            <button class="abtn abtn-danger" data-del="reservations|${r.id}">Suppr.</button>
          </div></td>
        </tr>`).join("") || emptyRow(5, "Chaque demande de réservation vous arrive aussi sur WhatsApp 📲. Sur cet appareil, elle s'affiche également ici.")}
      </tbody>
    </table></div>
  </div>`;
  bindEditButtons();
}

let calY = new Date().getFullYear();
let calM = new Date().getMonth();

function viewAvail() {
  const db = DB.data;
  const selId = sessionStorage.getItem("errouani_avail_sel") || (db.rentals[0] && db.rentals[0].id);
  const sel = db.rentals.find(r => r.id === selId) || db.rentals[0];
  sessionStorage.setItem("errouani_avail_sel", sel ? sel.id : "");
  const y = calY, m = calM;
  const names = ["Janvier", "Février", "Mars", "Avril", "Mai", "Juin", "Juillet", "Août", "Septembre", "Octobre", "Novembre", "Décembre"];
  const first = new Date(y, m, 1);
  const startDow = (first.getDay() + 6) % 7;
  const days = new Date(y, m + 1, 0).getDate();
  let cells = ["Lun", "Mar", "Mer", "Jeu", "Ven", "Sam", "Dim"].map(d => `<div class="ed-dow">${d}</div>`).join("");
  for (let i = 0; i < startDow; i++) cells += "<div></div>";
  const todayStr = new Date().toISOString().slice(0, 10);
  for (let d = 1; d <= days; d++) {
    const ds = `${y}-${String(m + 1).padStart(2, "0")}-${String(d).padStart(2, "0")}`;
    let st = sel && sel.availability ? (sel.availability[ds] || "avail") : "avail";
    if (!sel && ds >= todayStr) st = "avail";
    cells += `<button class="ed-day st-${st}" data-day="${ds}" title="${ds} — cliquez pour changer">${d}</button>`;
  }
  $("#adm-content").innerHTML = `
  <div class="adm-panel cal-editor">
    <div class="ap-head">
      <h3>Calendrier de disponibilité</h3>
      <select class="adm-select" id="avail-select" style="max-width:280px">
        ${db.rentals.map(r => `<option value="${r.id}" ${sel && sel.id === r.id ? "selected" : ""}>${esc(r.name)}</option>`).join("")}
      </select>
    </div>
    <div style="padding:1.4rem">
      ${sel ? "" : '<div class="empty-admin"><strong>Aucun caftan</strong>Ajoutez d\'abord un caftan dans « Caftans à louer ».</div>'}
      <div class="cal-mhead">
        <strong>${names[m]} ${y}</strong>
        <div class="cal-nav">
          <button id="cal-prev" aria-label="Mois précédent">←</button>
          <button id="cal-next" aria-label="Mois suivant">→</button>
        </div>
      </div>
      <div class="ed-cal">${cells}</div>
      <div class="ed-legend">
        <span><i style="background:#fff;border:1.5px solid #1EA85A"></i>Disponible</span>
        <span><i style="background:rgba(150,48,47,.16);border:1px solid #96302F"></i>Réservé</span>
        <span><i style="background:#EDE7DA;border:1px solid #B7AD99"></i>Bloqué</span>
        <span style="color:#A98340">Cliquez sur un jour pour changer son statut ✓</span>
      </div>
    </div>
  </div>`;
  const selEl = document.getElementById("avail-select");
  if (selEl) selEl.addEventListener("change", e => { sessionStorage.setItem("errouani_avail_sel", e.target.value); viewAvail(); });
  const prev = document.getElementById("cal-prev");
  if (prev) prev.addEventListener("click", () => { calM--; if (calM < 0) { calM = 11; calY--; } viewAvail(); });
  const next = document.getElementById("cal-next");
  if (next) next.addEventListener("click", () => { calM++; if (calM > 11) { calM = 0; calY++; } viewAvail(); });
  document.querySelectorAll("[data-day]").forEach(btn => {
    btn.addEventListener("click", () => {
      if (!sel) return;
      const ds = btn.dataset.day;
      const cur = (sel.availability[ds] || "avail");
      const nxt = cur === "avail" ? "reserved" : cur === "reserved" ? "blocked" : "avail";
      if (nxt === "avail") delete sel.availability[ds];
      else sel.availability[ds] = nxt;
      DB.save();
      viewAvail();
      toast(ds + " → " + (nxt === "reserved" ? "réservé" : nxt === "blocked" ? "bloqué" : "disponible"));
    });
  });
}

function viewMessages() {
  const db = DB.data;
  $("#adm-content").innerHTML = `
  <div class="adm-panel">
    <div class="ap-head"><h3>Boîte de réception (${db.messages.length})</h3>${searchBox("Nom, message…")}</div>
    ${db.messages.map(m => `
      <div class="msg-item ${m.read ? "" : "unread"}">
        <div class="msg-meta">
          <strong>${esc(m.name)}</strong>
          ${m.phone ? `<span>📞 ${esc(m.phone)}</span>` : ""}
          ${m.email ? `<span>✉ ${esc(m.email)}</span>` : ""}
          <span>· ${new Date(m.date).toLocaleString("fr-FR")}</span>
          ${!m.read ? '<span class="pill pill-gold">Non lu</span>' : ""}
        </div>
        <div class="msg-sub">${esc(m.subject || "Message")}</div>
        <div class="msg-body">${esc(m.body)}</div>
        <div class="msg-actions">
          ${m.phone ? `<a class="abtn abtn-primary" target="_blank" rel="noopener" href="${waLink(`Bonjour ${m.name}, vous avez contacté ${SITE.name}. Nous revenons vers vous concernant : ${m.subject || "votre message"}.`)}">Répondre WhatsApp</a>` : ""}
          ${m.email ? `<a class="abtn" href="mailto:${esc(m.email)}?subject=Re: ${encodeURIComponent(m.subject || "Votre message")}">Répondre par email</a>` : ""}
          <button class="abtn" data-msg-read="${m.id}">${m.read ? "Marquer non lu" : "Marquer lu"}</button>
          <button class="abtn abtn-danger" data-del="messages|${m.id}">Supprimer</button>
        </div>
      </div>`).join("") || `<div class="empty-admin"><strong>Aucun message</strong>Les messages de contact vous arrivent aussi sur WhatsApp 📲 ; ils sont listés ici s'ils ont été envoyés depuis cet appareil.</div>`}
  </div>`;
  bindEditButtons();
}

const PROMO_COLORS = [
  { label: "Or", value: "#B8860B" },
  { label: "Émeraude", value: "#0E5A45" },
  { label: "Bordeaux", value: "#6B2230" },
  { label: "Rose", value: "#D9A8A0" },
  { label: "Noir", value: "#1a1a1a" },
  { label: "Blanc cassé", value: "#FAF6F0" }
];

function viewPromos() {
  var db = DB.data;
  var promos = db.promos || [];
  var active = promos.filter(function(p){ return p.active; });
  var inactive = promos.filter(function(p){ return !p.active; });

  function promoRow(p) {
    var linkLabel = (function() {
      var lt = p.linkType || "custom";
      if (lt === "whatsapp") return "WhatsApp";
      if (lt === "page_boutique") return "Boutique";
      if (lt === "page_location") return "Location";
      if (lt === "page_accessoires") return "Accessoires";
      if (lt === "page_packs") return "Packs";
      if (lt === "page_deco") return "Decoration";
      if (lt === "page_apropos") return "A propos";
      if (lt === "page_contact") return "Contact";
      if (lt.startsWith("prod_")) { var s = db.shop.find(function(x){ return x.id === lt.slice(5); }); return s ? s.name : "Produit"; }
      if (lt.startsWith("rent_")) { var r = db.rentals.find(function(x){ return x.id === lt.slice(5); }); return r ? r.name : "Location"; }
      if (lt.startsWith("party_")) { var pt = db.parties.find(function(x){ return x.id === lt.slice(5); }); return pt ? pt.name : "Pack fete"; }
      if (p.btnLink) return (p.btnLink.length > 28 ? p.btnLink.slice(0, 28) + "..." : p.btnLink);
      return "—";
    })();
    var timerInfo = p.timerEnd ? '<br><small style="color:var(--gold,#B8860B)">Timer: ' + new Date(p.timerEnd).toLocaleDateString("fr-FR", {day:"2-digit",month:"short",hour:"2-digit",minute:"2-digit"}) + '</small>' : '';
    return '<tr>' +
      '<td><div style="display:flex;align-items:center;gap:.65rem">' +
        '<span style="width:16px;height:16px;border-radius:50%;background:' + esc(p.bgColor || '#B8860B') + ';display:inline-block;flex-shrink:0;border:2px solid rgba(255,255,255,.5);box-shadow:0 2px 8px rgba(0,0,0,.12)"></span>' +
        '<div><strong>' + esc(p.title) + '</strong><br><small style="color:var(--muted)">' + esc(p.btnText || "Voir") + timerInfo + '</small></div>' +
      '</div></td>' +
      '<td style="max-width:220px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;color:var(--muted)">' + esc(p.message) + '</td>' +
      '<td><span class="pill ' + (p.active ? 'pill-green' : 'pill-red') + '">' + (p.active ? 'Active' : 'Inactive') + '</span></td>' +
      '<td style="max-width:160px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;font-size:.84rem;color:var(--muted)">' + linkLabel + '</td>' +
      '<td><div class="row-actions" style="gap:.35rem">' +
        '<button class="abtn btn-promo-edit" data-id="' + esc(p.id) + '">Modifier</button>' +
        '<button class="abtn ' + (p.active ? 'abtn-warn' : 'abtn-ok') + ' btn-promo-toggle" data-id="' + esc(p.id) + '">' + (p.active ? 'Desactiver' : 'Activer') + '</button>' +
        '<button class="abtn abtn-danger btn-promo-del" data-id="' + esc(p.id) + '">Suppr.</button>' +
      '</div></td>' +
    '</tr>';
  }

  var html = '<div class="adm-panel">' +
    '<div class="ap-head"><h3>Popups / Offres speciales</h3>' +
      '<button class="btn-new btn-promo-new">+ Nouvelle offre</button>' +
    '</div>' +
    '<p style="padding:0 1.5rem;color:var(--muted);font-size:.88rem;line-height:1.55">' +
      'Creez des popups promotionnelles qui s\'affichent automatiquement aux visiteurs a chaque rafraichissement de page. ' +
      'Seule la popup la plus recente et active est affichee.' +
    '</p>';

  if (active.length) {
    html += '<div class="adm-table-wrap"><table class="adm-table">' +
      '<thead><tr><th>Titre</th><th>Message</th><th>Etat</th><th>Lien</th><th>Actions</th></tr></thead>' +
      '<tbody>' + active.map(promoRow).join("") + '</tbody></table></div>';
  }

  if (inactive.length) {
    html += '<div style="margin-top:1.2rem;padding:0 1.5rem">' +
      '<h4 style="font-family:Cormorant Garamond,serif;color:var(--muted);margin-bottom:.8rem;font-size:1.05rem">Inactives (' + inactive.length + ')</h4>' +
      '<div class="adm-table-wrap"><table class="adm-table">' +
      '<thead><tr><th>Titre</th><th>Message</th><th>Etat</th><th>Lien</th><th>Actions</th></tr></thead>' +
      '<tbody>' + inactive.map(promoRow).join("") + '</tbody></table></div></div>';
  }

  if (!promos.length) {
    html += '<div class="empty-admin"><strong>Aucune popup</strong><br>Cliquez sur "+ Nouvelle offre" pour creer votre premiere popup promotionnelle.</div>';
  }

  html += '</div>';
  $("#adm-content").innerHTML = html;

  var newBtn = document.querySelector(".btn-promo-new");
  if (newBtn) newBtn.addEventListener("click", function(){ editPromo(null); });

  document.querySelectorAll(".btn-promo-edit").forEach(function(b){
    b.addEventListener("click", function(){ editPromo(b.getAttribute("data-id")); });
  });
  document.querySelectorAll(".btn-promo-toggle").forEach(function(b){
    b.addEventListener("click", function(){
      var id = b.getAttribute("data-id");
      var p = db.promos.find(function(x){ return x.id === id; });
      if (p) { p.active = !p.active; DB.save(); viewPromos(); toast(p.active ? "Popup activee" : "Popup desactivee"); }
    });
  });
  document.querySelectorAll(".btn-promo-del").forEach(function(b){
    b.addEventListener("click", function(){
      if (!confirm("Supprimer cette popup ?")) return;
      var id = b.getAttribute("data-id");
      DB.data.promos = (DB.data.promos || []).filter(function(x){ return x.id !== id; });
      DB.save(); viewPromos(); toast("Popup supprimee.");
    });
  });
}

function editPromo(id) {
  var db = DB.data;
  var isNew = !id;
  var promo = isNew ? { id: DB.id("promo_"), title: "", message: "", image: "", btnText: "J'en profite", btnLink: "", linkType: "custom", bgColor: "#B8860B", active: true, timerEnd: "", promoType: "offre", promoCode: "", promoDiscount: "", promoProducts: [], promoStart: "", promoEnd: "" } : Object.assign({}, db.promos.find(function(p){ return p.id === id; }));
  if (!promo.id) return;

  var linkOptions = [
    { value: "custom", label: "URL personnalisee" },
    { value: "whatsapp", label: "WhatsApp" },
    { value: "page_boutique", label: "Page Boutique" },
    { value: "page_location", label: "Page Location" },
    { value: "page_accessoires", label: "Page Accessoires" },
    { value: "page_packs", label: "Page Packs" },
    { value: "page_deco", label: "Page Decoration" },
    { value: "page_apropos", label: "Page A propos" },
    { value: "page_contact", label: "Page Contact" },
  ];
  (db.shop || []).forEach(function(p){ linkOptions.push({ value: "prod_" + p.id, label: p.name }); });
  (db.rentals || []).forEach(function(p){ linkOptions.push({ value: "rent_" + p.id, label: p.name }); });
  (db.parties || []).forEach(function(p){ linkOptions.push({ value: "party_" + p.id, label: p.name }); });

  var detectLinkType = function(link) {
    if (!link) return "custom";
    if (link.indexOf("wa.me") > -1) return "whatsapp";
    if (link.indexOf("produit.html?id=") > -1) return "prod_" + link.split("id=")[1];
    if (link.indexOf("location-produit.html?id=") > -1) return "rent_" + link.split("id=")[1];
    return "custom";
  };
  var currentType = promo.linkType || detectLinkType(promo.btnLink);
  var timerVal = promo.timerEnd ? promo.timerEnd.slice(0, 16) : "";
  var selectedProducts = promo.promoProducts || [];
  var isCodeType = promo.promoType === "code";

  var shopItemsHtml = (db.shop || []).map(function(p) {
    var checked = selectedProducts.indexOf(p.id) >= 0 ? "checked" : "";
    return '<label class="promo-prod-item"><input type="checkbox" data-f="pprod" value="' + esc(p.id) + '" ' + checked + '> <span class="promo-prod-name">' + esc(p.name) + '</span> <span class="promo-prod-price">' + (p.price ? p.price + " DH" : "") + '</span></label>';
  }).join("");
  var rentalItemsHtml = (db.rentals || []).map(function(p) {
    var checked = selectedProducts.indexOf(p.id) >= 0 ? "checked" : "";
    return '<label class="promo-prod-item"><input type="checkbox" data-f="pprod" value="' + esc(p.id) + '" ' + checked + '> <span class="promo-prod-name">' + esc(p.name) + '</span> <span class="promo-prod-price">' + (p.price ? p.price + " DH/j" : "") + '</span></label>';
  }).join("");

  openModal(isNew ? "Nouvelle offre" : "Modifier l'offre", '' +
    '<div class="promo-form-section">' +
      '<div class="promo-form-header">' +
        '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--g700,#175247)" stroke-width="2"><path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/></svg>' +
        '<span>Type d\'offre</span>' +
      '</div>' +
      '<div class="mf-grid">' +
        '<div class="mf-field mf-full">' +
          '<label>Type</label>' +
          '<div class="promo-type-switch">' +
            '<button type="button" class="promo-type-btn' + (!isCodeType ? ' active' : '') + '" data-promo-type="offre">' +
              '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="18" height="18" rx="2"/><path d="M12 8v8M8 12h8"/></svg> Offre promotionnelle' +
            '</button>' +
            '<button type="button" class="promo-type-btn' + (isCodeType ? ' active' : '') + '" data-promo-type="code">' +
              '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="2" y="6" width="20" height="12" rx="2"/><path d="M2 10h20"/></svg> Code promo' +
            '</button>' +
          '</div>' +
          '<input type="hidden" data-f="promoType" value="' + esc(promo.promoType || "offre") + '">' +
          '<small style="color:var(--muted);font-size:.78rem;display:block;margin-top:.4rem">' +
            (isCodeType ? 'Le visiteur entre un code pour beneficier d\'une reduction sur des produits specifiques.' : 'Popup vitrine qui s\'affiche a chaque visite — image cover + titre + bouton CTA.') +
          '</small>' +
        '</div>' +
      '</div>' +
    '</div>' +

    '<div class="promo-form-section">' +
      '<div class="promo-form-header">' +
        '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--g700,#175247)" stroke-width="2"><path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/></svg>' +
        '<span>Contenu</span>' +
      '</div>' +
      '<div class="mf-grid">' +
        f("title", "Titre *", promo.title, { full: true, placeholder: isCodeType ? "Ex: -20% sur les caftans" : "Ex: Offre speciale Ramadan" }) +
        f("message", "Message *", promo.message, { full: true, type: "textarea", rows: 3, placeholder: isCodeType ? "Utilisez le code RAMADAN20 pour -20% sur toute la boutique." : "Decouvrez notre nouvelle collection a prix exceptionnel !" }) +
      '</div>' +
    '</div>' +

    '<div class="promo-form-section">' +
      '<div class="promo-form-header">' +
        '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--g700,#175247)" stroke-width="2"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><path d="M21 15l-5-5L5 21"/></svg>' +
        '<span>Image de fond (cover)</span>' +
      '</div>' +
      '<div class="mf-grid">' +
        '<div class="mf-field mf-full">' +
          '<label>Image depuis votre PC</label>' +
          '<div class="promo-upload-area" id="promo-upload-area">' +
            '<input type="file" id="promo-file-input" accept="image/*" style="display:none">' +
            '<div class="promo-upload-content" id="promo-upload-content">' +
              (promo.image ? '<img src="' + esc(promo.image) + '" class="promo-upload-preview" id="promo-upload-preview">' : '<svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="var(--muted,#6B6560)" stroke-width="1.5"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><path d="M21 15l-5-5L5 21"/></svg><p>Cliquez ou glissez une image ici</p>') +
            '</div>' +
          '</div>' +
        '</div>' +
        f("image", "Ou URL / chemin de l'image", promo.image, { full: true, placeholder: "https://... ou images/offre.jpg" }) +
        '<div class="mf-field mf-full">' +
          '<label>Couleur du theme</label>' +
          '<input type="hidden" data-f="bgColor" value="' + esc(promo.bgColor || '#B8860B') + '">' +
          '<div class="promo-color-picker">' +
            PROMO_COLORS.map(function(c){ return '<button type="button" data-pcolor="' + c.value + '" class="promo-color-btn' + (promo.bgColor === c.value ? ' selected' : '') + '" style="background:' + c.value + '" title="' + c.label + '"></button>'; }).join("") +
          '</div>' +
        '</div>' +
      '</div>' +
    '</div>' +

    (isCodeType ?
    '<div class="promo-form-section promo-code-section" id="promo-code-section">' +
      '<div class="promo-form-header">' +
        '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--g700,#175247)" stroke-width="2"><rect x="2" y="6" width="20" height="12" rx="2"/><path d="M2 10h20"/><path d="M12 6v12"/></svg>' +
        '<span>Reduction & Produits</span>' +
      '</div>' +
      '<div class="mf-grid">' +
        f("promoCode", "Code promo *", promo.promoCode || "", { full: true, placeholder: "Ex: RAMADAN20" }) +
        '<div class="mf-field"><label>Reduction *</label>' +
          '<div class="promo-discount-row">' +
            '<input type="number" data-f="promoDiscount" value="' + esc(promo.promoDiscount || "") + '" min="0" max="90" placeholder="20" style="width:80px;text-align:center">' +
            '<span style="font-size:1.1rem;font-weight:700;color:var(--g700)">%</span>' +
          '</div>' +
          '<span class="mf-hint">Pourcentage de reduction applique</span>' +
        '</div>' +
        f("promoStart", "Valide a partir du", promo.promoStart ? promo.promoStart.slice(0, 16) : "", { full: true, type: "datetime-local" }) +
        f("promoEnd", "Valide jusqu\'au", promo.promoEnd ? promo.promoEnd.slice(0, 16) : "", { full: true, type: "datetime-local" }) +
        '<div class="mf-field mf-full">' +
          '<label>Produits concernes</label>' +
          '<div class="promo-prod-list">' +
            (shopItemsHtml || '<p style="color:var(--muted);font-size:.85rem">Aucun produit en boutique.</p>') +
          '</div>' +
          ((db.rentals && db.rentals.length) ? '<label style="margin-top:.8rem;display:block;font-size:.78rem;letter-spacing:.1em;text-transform:uppercase;color:var(--gold-deep)">Locations</label><div class="promo-prod-list">' + rentalItemsHtml + '</div>' : '') +
          '<small style="color:var(--muted);font-size:.78rem;display:block;margin-top:.5rem">Laissez tout deselectionne pour appliquer sur tous les produits.</small>' +
        '</div>' +
      '</div>' +
    '</div>'
    : '<div class="promo-form-section promo-code-section" id="promo-code-section" style="display:none">' +
      '<div class="promo-form-header">' +
        '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--g700,#175247)" stroke-width="2"><rect x="2" y="6" width="20" height="12" rx="2"/><path d="M2 10h20"/><path d="M12 6v12"/></svg>' +
        '<span>Reduction & Produits</span>' +
      '</div>' +
      '<div class="mf-grid">' +
        f("promoCode", "Code promo *", promo.promoCode || "", { full: true, placeholder: "Ex: RAMADAN20" }) +
        '<div class="mf-field"><label>Reduction *</label>' +
          '<div class="promo-discount-row">' +
            '<input type="number" data-f="promoDiscount" value="' + esc(promo.promoDiscount || "") + '" min="0" max="90" placeholder="20" style="width:80px;text-align:center">' +
            '<span style="font-size:1.1rem;font-weight:700;color:var(--g700)">%</span>' +
          '</div>' +
          '<span class="mf-hint">Pourcentage de reduction applique</span>' +
        '</div>' +
        f("promoStart", "Valide a partir du", promo.promoStart ? promo.promoStart.slice(0, 16) : "", { full: true, type: "datetime-local" }) +
        f("promoEnd", "Valide jusqu\'au", promo.promoEnd ? promo.promoEnd.slice(0, 16) : "", { full: true, type: "datetime-local" }) +
        '<div class="mf-field mf-full">' +
          '<label>Produits concernes</label>' +
          '<div class="promo-prod-list">' +
            (shopItemsHtml || '<p style="color:var(--muted);font-size:.85rem">Aucun produit en boutique.</p>') +
          '</div>' +
          ((db.rentals && db.rentals.length) ? '<label style="margin-top:.8rem;display:block;font-size:.78rem;letter-spacing:.1em;text-transform:uppercase;color:var(--gold-deep)">Locations</label><div class="promo-prod-list">' + rentalItemsHtml + '</div>' : '') +
          '<small style="color:var(--muted);font-size:.78rem;display:block;margin-top:.5rem">Laissez tout deselectionne pour appliquer sur tous les produits.</small>' +
        '</div>' +
      '</div>' +
    '</div>') +

    '<div class="promo-form-section" id="promo-btn-section"' + (isCodeType ? ' style="display:none"' : '') + '>' +
      '<div class="promo-form-header">' +
        '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--g700,#175247)" stroke-width="2"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/></svg>' +
        '<span>Bouton & Lien</span>' +
      '</div>' +
      '<div class="mf-grid">' +
        f("btnText", "Texte du bouton CTA", promo.btnText, { placeholder: "J'en profite" }) +
        '<div class="mf-field"><label>Lien du bouton</label>' +
          '<select data-f="linkType" id="promo-link-type" class="adm-select" style="width:100%">' +
            linkOptions.map(function(o){ return '<option value="' + esc(o.value) + '" ' + (o.value === currentType ? "selected" : "") + '>' + esc(o.label) + '</option>'; }).join("") +
          '</select>' +
        '</div>' +
        f("btnLink", "URL personnalisee (si type = URL)", promo.btnLink, { full: true, placeholder: "https://..." }) +
      '</div>' +
    '</div>' +

    '<div class="promo-form-section">' +
      '<div class="promo-form-header">' +
        '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--g700,#175247)" stroke-width="2"><circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/></svg>' +
        '<span>Minuteur & Statut</span>' +
      '</div>' +
      '<div class="mf-grid">' +
        f("timerEnd", "Minuteur — date/heure de fin (optionnel)", timerVal, { full: true, type: "datetime-local", hint: "Affichage automatiquement desactive a cette date." }) +
        '<div class="mf-field mf-full">' +
          '<div class="promo-active-toggle">' +
            '<label class="promo-toggle-switch">' +
              '<input type="checkbox" data-f="active" ' + (promo.active ? "checked" : "") + '>' +
              '<span class="promo-toggle-slider"></span>' +
            '</label>' +
            '<div class="promo-toggle-label">' +
              '<strong>Offre active</strong>' +
              '<small style="color:var(--muted)">' + (promo.active ? 'Visible aux visiteurs' : 'Desactivee — pas visible') + '</small>' +
            '</div>' +
          '</div>' +
        '</div>' +
      '</div>' +
    '</div>'
  , function(data) {
    if (!data.title || !data.message) { return "Titre et message requis"; }
    data.bgColor = promo.bgColor || "#B8860B";
    data.active = !!data.active;
    data.id = promo.id;
    data.promoType = data.promoType || "offre";

    if (data.promoType === "code") {
      if (!data.promoCode) return "Code promo requis";
      if (!data.promoDiscount || Number(data.promoDiscount) <= 0) return "Pourcentage de reduction requis";
      data.promoCode = data.promoCode.trim().toUpperCase();
      data.promoDiscount = Number(data.promoDiscount);
    } else {
      delete data.promoCode;
      delete data.promoDiscount;
      delete data.promoProducts;
      delete data.promoStart;
      delete data.promoEnd;
    }

    if (data.promoType === "code") {
      var pprods = [];
      document.querySelectorAll('[data-f="pprod"]:checked').forEach(function(cb) { pprods.push(cb.value); });
      data.promoProducts = pprods;
      if (!data.promoStart) delete data.promoStart;
      if (!data.promoEnd) delete data.promoEnd;
    }

    var lt = data.linkType || "custom";
    data.linkType = lt;
    if (lt === "whatsapp") {
      data.btnLink = waLink(data.btnText || "Bonjour !");
    } else if (lt === "page_boutique") {
      data.btnLink = "boutique.html";
    } else if (lt === "page_location") {
      data.btnLink = "location.html";
    } else if (lt === "page_accessoires") {
      data.btnLink = "accessoires.html";
    } else if (lt === "page_packs") {
      data.btnLink = "packs.html";
    } else if (lt === "page_deco") {
      data.btnLink = "decoration.html";
    } else if (lt === "page_apropos") {
      data.btnLink = "apropos.html";
    } else if (lt === "page_contact") {
      data.btnLink = "contact.html";
    } else if (lt.indexOf("prod_") === 0) {
      data.btnLink = "produit.html?id=" + lt.slice(5);
    } else if (lt.indexOf("rent_") === 0) {
      data.btnLink = "location-produit.html?id=" + lt.slice(5);
    } else if (lt.indexOf("party_") === 0) {
      data.btnLink = "packs.html";
    }

    if (!data.timerEnd) delete data.timerEnd;

    if (isNew) db.promos.push(data);
    else {
      var idx = db.promos.findIndex(function(p){ return p.id === data.id; });
      if (idx >= 0) Object.assign(db.promos[idx], data);
    }
  });

  var linkTypeEl = document.getElementById("promo-link-type");
  var btnLinkField = document.querySelector('[data-f="btnLink"]');
  if (linkTypeEl && btnLinkField) {
    var toggleCustomUrl = function() {
      var isCustom = linkTypeEl.value === "custom";
      btnLinkField.closest(".mf-field").style.display = isCustom ? "" : "none";
    };
    toggleCustomUrl();
    linkTypeEl.addEventListener("change", toggleCustomUrl);
  }

  document.querySelectorAll("[data-promo-type]").forEach(function(btn) {
    btn.addEventListener("click", function() {
      document.querySelectorAll("[data-promo-type]").forEach(function(b){ b.classList.remove("active"); });
      btn.classList.add("active");
      var hidden = document.querySelector('[data-f="promoType"]');
      if (hidden) hidden.value = btn.getAttribute("data-promo-type");
      var newType = btn.getAttribute("data-promo-type");
      var codeSection = document.getElementById("promo-code-section");
      var btnSection = document.getElementById("promo-btn-section");
      if (codeSection) codeSection.style.display = newType === "code" ? "" : "none";
      if (btnSection) btnSection.style.display = newType === "code" ? "none" : "";
    });
  });

  var fileInput = document.getElementById("promo-file-input");
  var uploadArea = document.getElementById("promo-upload-area");
  var uploadContent = document.getElementById("promo-upload-preview") || document.getElementById("promo-upload-content");
  var imageField = document.querySelector('[data-f="image"]');
  if (fileInput && uploadArea) {
    uploadArea.addEventListener("click", function() { fileInput.click(); });
    uploadArea.addEventListener("dragover", function(e) { e.preventDefault(); uploadArea.classList.add("dragover"); });
    uploadArea.addEventListener("dragleave", function() { uploadArea.classList.remove("dragover"); });
    uploadArea.addEventListener("drop", function(e) {
      e.preventDefault();
      uploadArea.classList.remove("dragover");
      if (e.dataTransfer.files.length) handlePromoFile(e.dataTransfer.files[0]);
    });
    fileInput.addEventListener("change", function() {
      if (fileInput.files.length) handlePromoFile(fileInput.files[0]);
    });
    function handlePromoFile(file) {
      if (!file.type.startsWith("image/")) { toast("Seules les images sont acceptees."); return; }
      var reader = new FileReader();
      reader.onload = function(ev) {
        var dataUrl = ev.target.result;
        if (imageField) imageField.value = dataUrl;
        if (uploadContent && uploadContent.tagName === "IMG") {
          uploadContent.src = dataUrl;
        } else {
          var img = document.createElement("img");
          img.src = dataUrl;
          img.className = "promo-upload-preview";
          img.id = "promo-upload-preview";
          uploadArea.innerHTML = "";
          uploadArea.appendChild(img);
        }
      };
      reader.readAsDataURL(file);
    }
  }

  document.querySelectorAll("[data-pcolor]").forEach(function(b) {
    b.addEventListener("click", function(e) {
      e.preventDefault();
      var color = b.getAttribute("data-pcolor");
      document.querySelectorAll("[data-pcolor]").forEach(function(x) { x.classList.remove("selected"); });
      b.classList.add("selected");
      var hidden = document.querySelector('[data-f="bgColor"]');
      if (hidden) hidden.value = color;
      promo.bgColor = color;
    });
  });
}

function viewSettings() {
  const s = SITE;
  $("#adm-content").innerHTML = `
  <div class="adm-panel">
    <div class="ap-head"><h3>Coordonnées publiées sur le site</h3></div>
    <div style="padding:1.5rem">
      <div class="mf-grid">
        ${f("whatsapp", "Numéro WhatsApp (format international sans + ni espaces) *", s.whatsapp, { placeholder: "212661234567", full: true, hint: "Tous les boutons WhatsApp du site utiliseront ce numéro." })}
        ${f("phoneDisplay", "Téléphone affiché", s.phoneDisplay)}
        ${f("email", "Email affiché", s.email)}
        ${f("instagramHandle", "Pseudo Instagram", s.instagramHandle)}
        ${f("instagram", "Lien Instagram (URL)", s.instagram)}
        ${f("address", "Adresse", s.address, { full: true })}
        ${f("hours", "Horaires", s.hours, { full: true })}
      </div>
      <button class="btn-new" id="save-site" style="margin-top:1.2rem">Enregistrer les coordonnées ✓</button>
    </div>
  </div>

  <div class="adm-panel">
    <div class="ap-head"><h3>Bannière d'accueil (visiteurs)</h3></div>
    <p style="padding:0 1.5rem;color:var(--muted);font-size:.9rem">
      Message de bienvenue affiché en haut du site à chaque visite. Désactivez-le pour masquer.
    </p>
    <div style="padding:1.5rem">
      <div class="mf-grid">
        ${f("wbTitle", "Titre", (DB.data.settings.welcomeBanner || {}).title || "", { full: true, placeholder: "Bienvenue chez Caftan Errouani" })}
        ${f("wbMessage", "Message", (DB.data.settings.welcomeBanner || {}).message || "", { full: true, placeholder: "Livraison gratuite à Marrakech cette semaine !" })}
        ${f("wbImage", "Image (URL ou chemin local)", (DB.data.settings.welcomeBanner || {}).image || "", { full: true, placeholder: "https://… ou images/welcome.jpg" })}
        <div class="mf-field"><label>
          <input type="checkbox" data-f="wbActive" ${(DB.data.settings.welcomeBanner || {}).active ? "checked" : ""} style="margin-right:.5rem"> Bannière active (affichée aux visiteurs)
        </label></div>
      </div>
      <button class="btn-new" id="save-wb" style="margin-top:1.2rem">Enregistrer la bannière ✓</button>
    </div>
  </div>

  <div class="adm-panel">
    <div class="ap-head"><h3>Sécurité &amp; données</h3></div>
    <div style="padding:1.5rem;display:flex;flex-direction:column;gap:1.2rem;max-width:520px">
      <div class="mf-field"><label>Code PIN d'administration</label>
        <input type="text" data-f="adminPin" value="${esc(DB.data.settings.adminPin)}">
        <span class="mf-hint">Notez-le précieusement — il protège cette page.</span>
      </div>
      <button class="btn-new" id="save-pin">Changer le PIN</button>
      <hr style="border:none;border-top:1px solid #E5DBC7">
      <div style="display:flex;gap:.7rem;flex-wrap:wrap">
        <button class="abtn" id="export-db">⬇ Exporter les données (JSON)</button>
        <label class="abtn" style="cursor:pointer">⬆ Importer un JSON<input type="file" id="import-db" accept=".json" hidden></label>
        <button class="abtn abtn-danger" id="reset-db">Réinitialiser données démo</button>
      </div>
      <p class="mf-hint">Vos données sont stockées dans ce navigateur (localStorage). Faites des exports réguliers — et pour un usage multi-appareils, une synchronisation serveur pourra être ajoutée plus tard.</p>
    </div>
  </div>`;

  $("#save-site").addEventListener("click", () => {
    const get = n => document.querySelector(`[data-f="${n}"]`).value.trim();
    if (!get("whatsapp")) { toast("Le numéro WhatsApp est requis."); return; }
    DB.data.settings.site = {
      whatsapp: get("whatsapp"), phoneDisplay: get("phoneDisplay"), email: get("email"),
      instagram: get("instagram"), instagramHandle: get("instagramHandle"),
      address: get("address"), hours: get("hours")
    };
    Object.assign(SITE, DB.data.settings.site);
    DB.save();
    toast("Coordonnées mises à jour — visibles immédiatement sur le site ✓");
  });

  $("#save-wb").addEventListener("click", () => {
    const get = n => { const el = document.querySelector(`[data-f="${n}"]`); return el ? (el.type === "checkbox" ? el.checked : el.value.trim()) : ""; };
    DB.data.settings.welcomeBanner = {
      title: get("wbTitle"), message: get("wbMessage"),
      image: get("wbImage"), active: !!get("wbActive")
    };
    DB.save();
    toast("Bannière d'accueil mise à jour ✓");
  });

  $("#save-pin").addEventListener("click", () => {
    const pin = document.querySelector('[data-f="adminPin"]').value.trim();
    if (pin.length < 3) { toast("PIN trop court (3 chiffres minimum)."); return; }
    DB.data.settings.adminPin = pin;
    DB.save();
    toast("Code PIN mis à jour ✓");
  });

  $("#export-db").addEventListener("click", () => {
    const blob = new Blob([JSON.stringify(DB.data, null, 2)], { type: "application/json" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = "errouani-sauvegarde-" + new Date().toISOString().slice(0, 10) + ".json";
    a.click();
  });

  document.getElementById("import-db").addEventListener("change", e => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      try {
        const parsed = JSON.parse(reader.result);
        if (!parsed.rentals || !parsed.shop) throw new Error("bad");
        DB.data = parsed;
        DB.save();
        go("dash");
        toast("Données importées ✓");
      } catch (err) { toast("Fichier invalide."); }
    };
    reader.readAsText(file);
  });

  $("#reset-db").addEventListener("click", () => {
    if (confirm("Réinitialiser toutes les données (produits, commandes…) avec le contenu de démonstration ?")) {
      DB.reset();
      go("dash");
      toast("Données réinitialisées.");
    }
  });
}

function bindEditButtons() {
  bindTableSearch();

  document.querySelectorAll("[data-order-detail]").forEach(b =>
    b.addEventListener("click", () => orderDetail(DB.data.orders.find(x => x.id === b.dataset.orderDetail))));

  document.querySelectorAll("[data-rental-edit]").forEach(b =>
    b.addEventListener("click", () => rentalForm(DB.data.rentals.find(x => x.id === b.dataset.rentalEdit))));
  document.querySelectorAll("[data-shop-edit]").forEach(b =>
    b.addEventListener("click", () => shopForm(DB.data.shop.find(x => x.id === b.dataset.shopEdit))));
  document.querySelectorAll("[data-acc-edit]").forEach(b =>
    b.addEventListener("click", () => accForm(DB.data.accessories.find(x => x.id === b.dataset.accEdit))));
  document.querySelectorAll("[data-party-edit]").forEach(b =>
    b.addEventListener("click", () => partyForm(DB.data.parties.find(x => x.id === b.dataset.partyEdit))));
  document.querySelectorAll("[data-pack-edit]").forEach(b =>
    b.addEventListener("click", () => packForm(DB.data.packs.find(x => x.id === b.dataset.packEdit))));

  document.querySelectorAll("[data-avail-edit]").forEach(b =>
    b.addEventListener("click", () => { sessionStorage.setItem("errouani_avail_sel", b.dataset.availEdit); go("avail"); }));

  document.querySelectorAll("[data-del]").forEach(b =>
    b.addEventListener("click", () => {
      const parts = b.dataset.del.split("|");
      const label = { rentals: "ce caftan", shop: "ce produit", accessories: "cet accessoire", parties: "ce pack fête", packs: "cette formule", orders: "cette commande", reservations: "cette réservation", messages: "ce message", promos: "cette popup" }[parts[0]];
      if (!confirm("Supprimer définitivement " + label + " ?")) return;
      DB.data[parts[0]] = DB.data[parts[0]].filter(x => x.id !== parts[1]);
      DB.save();
      go(state.section);
      toast("Supprimé.");
    }));

  document.querySelectorAll("[data-order-status]").forEach(sel =>
    sel.addEventListener("change", () => {
      const o = DB.data.orders.find(x => x.id === sel.dataset.orderStatus);
      o.status = sel.value;
      DB.save();
      renderNav(computeBadges());
      toast("Commande mise à jour ✓");
    }));

  document.querySelectorAll("[data-res-status]").forEach(sel =>
    sel.addEventListener("change", () => {
      const r = DB.data.reservations.find(x => x.id === sel.dataset.resStatus);
      r.status = sel.value;
      DB.save();
      renderNav(computeBadges());
      toast("Réservation mise à jour ✓");
    }));

  document.querySelectorAll("[data-block-dates]").forEach(b =>
    b.addEventListener("click", () => {
      const r = DB.data.reservations.find(x => x.id === b.dataset.blockDates);
      const product = DB.data.rentals.find(p => p.id === r.productId);
      if (!product) { toast("Caftan introuvable — peut-être supprimé."); return; }
      if (!product.availability) product.availability = {};
      dateRange(r.from, r.to).forEach(d => { product.availability[d] = "reserved"; });
      r.status = "Confirmée";
      DB.save();
      go("reservations");
      toast("Dates bloquées dans le calendrier public ✓");
    }));

  document.querySelectorAll("[data-msg-read]").forEach(b =>
    b.addEventListener("click", () => {
      const m = DB.data.messages.find(x => x.id === b.dataset.msgRead);
      m.read = !m.read;
      DB.save();
      go("messages");
    }));
}

function initLogin() {
  let activeCode = null;
  let tickOn = false;

  const sendBtn = $("#send-code-btn");
  const timerEl = $("#code-timer");
  const infoEl = $("#login-info");
  const errEl = $("#login-error");
  const demoBox = $("#demo-code-box");
  const demoVal = $("#demo-code-val");
  const input = $("#login-code");
  window.__admCode = () => activeCode;

  function tick() {
    if (!tickOn || !activeCode) return;
    const left = activeCode.exp - Date.now();
    timerEl.textContent = left > 0 ? "⏱ Code actif — expire dans " + Math.ceil(left / 1000) + " s" : "";
    if (left > 0 && !activeCode.used) setTimeout(tick, 250);
    else tickOn = false;
  }

  async function sendCode() {
    errEl.textContent = ""; infoEl.textContent = "";
    const chars = "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789@#$%&*";
    let code = ""; for (let i = 0; i < 10; i++) code += chars.charAt(Math.floor(Math.random() * chars.length));
    activeCode = { code, exp: Date.now() + 40000, used: false };
    sendBtn.disabled = true;
    sendBtn.textContent = "Envoi…";
    demoBox.style.display = "none";
    tickOn = true;
    tick();

    const cfg = typeof EMAILJS !== "undefined" ? EMAILJS : null;
    const toMail = typeof ADMIN_EMAIL !== "undefined" ? ADMIN_EMAIL : "";
    let sentReal = false;
    if (cfg && cfg.serviceId && cfg.templateId && cfg.publicKey && toMail) {
      try {
        const r = await fetch("https://api.emailjs.com/api/v1.0/email/send", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            service_id: cfg.serviceId,
            template_id: cfg.templateId,
            user_id: cfg.publicKey,
            template_params: { to_email: toMail, passcode: code, validity: "40 secondes", brand: SITE.name }
          })
        });
        if (!r.ok) throw new Error("HTTP " + r.status);
        sentReal = true;
        infoEl.textContent = "";
      } catch (e) {
        infoEl.textContent = "⚠️ Envoi email impossible — code de secours affiché ci-dessous.";
      }
    }
    if (!sentReal) {
      demoVal.textContent = code;
      demoBox.style.display = "block";
      infoEl.textContent = "";
    }

    setTimeout(() => {
      sendBtn.disabled = false;
      sendBtn.textContent = "↻ Renvoyer le code";
    }, 800);
  }

  function tryLogin() {
    errEl.textContent = "";
    if (!activeCode) { errEl.textContent = "Demandez d'abord un code."; return; }
    if (activeCode.used) { errEl.textContent = "Code déjà utilisé — demandez-en un nouveau."; return; }
    if (Date.now() >= activeCode.exp) {
      errEl.textContent = "⏱ Code expiré — cliquez sur « Renvoyer le code ».";
      return;
    }
    if (input.value.trim() === activeCode.code) {
      activeCode.used = true;
      sessionStorage.setItem(SESSION_KEY, "1");
      startApp();
    } else {
      errEl.textContent = "Code incorrect — réessayez.";
      input.value = "";
      input.focus();
    }
  }

  sendBtn.addEventListener("click", sendCode);
  $("#login-btn").addEventListener("click", tryLogin);
  input.addEventListener("keydown", e => { if (e.key === "Enter") tryLogin(); });
  input.addEventListener("input", () => { input.value = input.value.slice(0, 10); });
}

function startApp() {
  $("#adm-login").style.display = "none";
  $("#adm-app").style.display = "block";
  installImgFallback();
  $("#year-now").textContent = new Date().getFullYear();
  renderNav(computeBadges());
  go("dash");

  $("#as-nav").addEventListener("click", e => {
    const a = e.target.closest("a[data-sec]");
    if (!a) return;
    e.preventDefault();
    go(a.dataset.sec);
  });
  $("#logout-btn").addEventListener("click", () => {
    sessionStorage.removeItem(SESSION_KEY);
    location.reload();
  });
  $("#burger-adm").addEventListener("click", () => $("#adm-side").classList.toggle("open"));
  document.querySelectorAll("[data-modal-close]").forEach(b => b.addEventListener("click", closeModal));
  $("#adm-modal").addEventListener("click", e => { if (e.target.id === "adm-modal") closeModal(); });
  document.addEventListener("keydown", e => { if (e.key === "Escape") closeModal(); });
}

DB.load();
if (sessionStorage.getItem(SESSION_KEY) === "1") startApp();
else initLogin();
