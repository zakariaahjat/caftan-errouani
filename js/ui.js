/* ============================================================
   ERROUANI — UI core : navbar, footer, overlays, helpers
   ============================================================ */

const UI_ICONS = {
  gem: '<path d="M6 3h12l4 6-10 12L2 9l4-6z"/><path d="M2 9h20M12 21L8 9l4-6 4 6-4 12z"/>',
  bag: '<path d="M6 8h12l1 13H5L6 8z"/><path d="M9 8V6a3 3 0 0 1 6 0v2"/>',
  cart: '<circle cx="9" cy="20" r="1.6"/><circle cx="17" cy="20" r="1.6"/><path d="M3 4h2l2.6 11.6a1.5 1.5 0 0 0 1.5 1.2h7.9a1.5 1.5 0 0 0 1.5-1.2L20.5 8H6"/>',
  search: '<circle cx="11" cy="11" r="7"/><path d="m20 20-3.5-3.5"/>',
  check: '<path d="M4 12l5 5L20 6"/>',
  wa: '<path d="M12 3a9 9 0 0 0-7.8 13.5L3 21l4.6-1.2A9 9 0 1 0 12 3z"/><path d="M8.8 9.2c0 3 3 6 6 6l1.6-1.6-2-1.3-1.2.7c-.9-.5-1.7-1.3-2.2-2.2l.7-1.2-1.3-2-1.6 1.6z" fill="currentColor" stroke="none"/>',
  pin: '<path d="M12 21s7-5.5 7-11a7 7 0 1 0-14 0c0 5.5 7 11 7 11z"/><circle cx="12" cy="10" r="2.6"/>',
  phone: '<path d="M5 4h4l1.5 4L8 10a12 12 0 0 0 6 6l2-2.5 4 1.5v4a2 2 0 0 1-2 2A16 16 0 0 1 3 6a2 2 0 0 1 2-2z"/>',
  mail: '<rect x="3" y="5" width="18" height="14" rx="2"/><path d="m3 7 9 6 9-6"/>',
  star: '<path d="m12 3 2.7 5.7 6.3.8-4.6 4.3 1.2 6.2L12 17l-5.6 3 1.2-6.2L3 9.5l6.3-.8L12 3z"/>',
  menu: '<path d="M4 7h16M4 12h16M4 17h16"/>',
  close: '<path d="M6 6l12 12M18 6 6 18"/>',
  clock: '<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 3"/>'
};

const PH_ICONS = {
  caftan: '<path d="M9 3h6l3 4-2 3v11H8V10L6 7l3-4z"/><path d="M9 3c0 2 1.5 3.5 3 3.5S15 5 15 3"/>',
  takchita: '<path d="M9 3h6l3 4-2 3v11H8V10L6 7l3-4z"/><path d="M9 3c0 2 1.5 3.5 3 3.5S15 5 15 3"/><path d="M8 14h8"/>',
  djellaba: '<path d="M9 3h6l3 4-2 3v11H8V10L6 7l3-4z"/><path d="M12 6v15"/>',
  ensemble: '<path d="M9 3h6l2 3-1 4h-8L7 6l2-3z"/><path d="M8 10v11M16 10v11"/>',
  tray: '<ellipse cx="12" cy="14" rx="9" ry="4"/><path d="M12 14V5"/><path d="M9.5 7.5C9.5 6 10.6 5 12 5s2.5 1 2.5 2.5"/>',
  box: '<rect x="4" y="8" width="16" height="12" rx="2"/><path d="M4 12h16M12 8v12M8 8V5h8v3"/>',
  candle: '<path d="M12 8v13"/><path d="M9 21h6"/><path d="M12 8c-1.5-1.5-1.5-3 0-4.5C13.5 5 13.5 6.5 12 8z"/>',
  cushion: '<path d="M4 12c0-4 3-7 8-7s8 3 8 7-3 7-8 7-8-3-8-7z"/><path d="M7 9l3 3M17 9l-3 3"/>',
  mirror: '<ellipse cx="12" cy="10" rx="6" ry="8"/><path d="M12 18v3M9 21h6"/>',
  teapot: '<path d="M7 9h8a4 4 0 0 1 4 4v1a6 6 0 0 1-6 6H9a6 6 0 0 1-6-6v-1a4 4 0 0 1 4-4z"/><path d="M7 11c-2 0-3 1-3 3M11 9V6a2 2 0 0 1 4 0"/>',
  lantern: '<path d="M9 3h6M12 3v2"/><path d="M8 5h8l1 4v8l-1 4H8l-1-4V9l1-4z"/><circle cx="12" cy="13" r="2.4"/>',
  vase: '<path d="M10 3h4l-1 4c2.5 1 4 3.5 4 7a5 5 0 0 1-10 0c0-3.5 1.5-6 4-7l-1-4z"/><path d="M12 7v10"/>',
  henna: '<path d="M9 3h6v4l2 3v11H7V10l2-3V3z"/><path d="M9 14c1.5 1.5 4.5 1.5 6 0"/>',
  gift: '<rect x="4" y="10" width="16" height="10" rx="1.5"/><path d="M12 10v10M4 10h16M12 10s-4 0-5-2 1-4 3-2c1.4 1.4 2 4 2 4zm0 0s4 0 5-2-1-4-3-2c-1.4 1.4-2 4-2 4z"/>',
  star2: '<path d="m12 4 1.8 4.8L19 10l-4.2 2.4L15 18l-3-2.8L9 18l.2-5.6L5 10l5.2-1.2L12 4z"/>'
};

const PALETTES = [
  ["#F5EFE3", "#175247", "#C6A15B"],
  ["#FBF7EF", "#96302F", "#C6A15B"],
  ["#F3EBDB", "#123D31", "#A98340"],
  ["#FFFCF6", "#27876C", "#E9D8AE"],
  ["#F7EEDD", "#752A50", "#C6A15B"],
  ["#EFF5F0", "#08211B", "#B8934E"],
  ["#FAF3EA", "#1E5F52", "#D9B36A"],
  ["#F5EEE2", "#4A3560", "#C6A15B"]
];

function hashStr(s) {
  s = String(s || "");
  let h = 0;
  for (let i = 0; i < s.length; i++) { h = (h * 31 + s.charCodeAt(i)) | 0; }
  return Math.abs(h);
}

function phSVG(icon, label, palIdx, w, h) {
  const paths = PH_ICONS[icon] || PH_ICONS.star;
  const pal = PALETTES[(palIdx == null ? hashStr(label) : palIdx) % PALETTES.length];
  const W = w || 600, H = h || 750;
  return 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(
    '<svg xmlns="http://www.w3.org/2000/svg" width="' + W + '" height="' + H + '" viewBox="0 0 600 750">' +
    '<rect width="600" height="750" fill="' + pal[0] + '"/>' +
    '<g fill="none" stroke="' + pal[1] + '" stroke-opacity=".25" stroke-width="1.4">' +
    '<rect x="40" y="40" width="520" height="670" rx="18"/>' +
    '<rect x="58" y="58" width="484" height="634" rx="12"/></g>' +
    '<g transform="translate(150,205)" fill="none" stroke="' + pal[1] + '" stroke-width="7" stroke-linecap="round" stroke-linejoin="round" width="300" height="300" viewBox="0 0 24 24">' + paths + '</g>' +
    '<text x="300" y="620" font-family="Georgia,serif" font-size="30" font-style="italic" fill="' + pal[2] + '" text-anchor="middle">' + String(label || "").replace(/&/g, "&amp;").replace(/</g, "&lt;") + '</text></svg>');
}

function showToast(msg) {
  const t = document.getElementById("toast");
  if (!t) return;
  t.textContent = msg;
  t.classList.add("show");
  clearTimeout(showToast._t);
  showToast._t = setTimeout(() => t.classList.remove("show"), 2600);
}

let revealIO = null;
function ensureRevealIO() {
  if (revealIO || typeof IntersectionObserver === "undefined") return null;
  revealIO = new IntersectionObserver((entries) => {
    entries.forEach(en => { if (en.isIntersecting) { en.target.classList.add("in"); revealIO.unobserve(en.target); } });
  }, { threshold: 0.08 });
  return revealIO;
}
function observeReveals(root) {
  const io = ensureRevealIO();
  (root || document).querySelectorAll(".reveal:not(.in)").forEach(el => {
    const r = el.getBoundingClientRect();
    if (io && r.top > window.innerHeight * 0.92) io.observe(el);
    else el.classList.add("in");
  });
}
function installImgFallback() {
  window.addEventListener("error", (e) => {
    const img = e.target;
    if (!(img instanceof HTMLImageElement)) return;
    if (!img.src.startsWith("data:image/svg+xml")) {
      img.src = phSVG(img.dataset.icon || "star", img.dataset.label || "Errouani",
        img.dataset.pal != null && img.dataset.pal !== "" ? Number(img.dataset.pal) : hashStr(img.dataset.label));
    }
  }, true);
}
function imgAttrs(p) {
  return ' data-icon="' + esc(p.icon || "caftan") + '" data-label="' + esc(p.name) + '" data-pal="' + (hashStr(p.id) % PALETTES.length) + '"';
}
function productImg(p) {
  return p.img || (p.gallery && p.gallery[0]) || ("images/" + p.id + ".jpg");
}
function galleryThumbs(p) {
  var g = (p && p.gallery) || [];
  if (g.length < 2) return "";
  return '<div class="gallery-thumbs" id="gal-thumbs">' +
    g.map(function(src, i) {
      return '<img src="' + esc(src) + '" data-gal="' + esc(src) + '" class="' + (i === 0 ? "active" : "") + '" alt="" loading="lazy">';
    }).join("") +
    '</div>';
}

function getParam(name) {
  return new URLSearchParams(location.search).get(name);
}

function esc(s) {
  return String(s == null ? "" : s)
    .replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;").replace(/'/g, "&#39;");
}

function money(n) {
  return Number(n || 0).toLocaleString("fr-FR") + " DH";
}

function svgIcon(path, size, cls) {
  return '<svg class="' + (cls || "") + '" width="' + (size || 18) + '" height="' + (size || 18) + '" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round">' + path + "</svg>";
}

function waLink(msg) {
  return "https://wa.me/" + String(SITE.whatsapp || "").replace(/\D/g, "") + "?text=" + encodeURIComponent(msg);
}

/* ---------- Navbar / Footer / Mobile menu ---------- */

const NAV_LINKS = [
  ["index.html", "Accueil", "home"],
  ["location.html", "Location", "location"],
  ["boutique.html", "Boutique", "shop"],
  ["accessoires.html", "Accessoires", "acc"],
  ["decoration.html", "Décoration", "deco"],
  ["packs.html", "Packs fêtes", "packs"],
  ["contact.html", "Contact", "contact"]
];

function currentPage() {
  const f = location.pathname.split("/").pop() || "index.html";
  return f.replace(/^_t_/, "");
}

function renderNav() {
  const host = document.getElementById("site-header");
  if (!host) return;
  const cur = currentPage();
  const isActive = (u, key) => (cur === u || (u !== "index.html" && document.body.getAttribute("data-page") === key)) ? " active" : "";
  host.innerHTML = `
  <header class="header">
    <div class="container">
      <nav class="nav">
        <a class="logo" href="index.html" aria-label="Caftan Errouani">
          <img class="logo-img" src="images/logo.png" alt="Errouani">
          <span class="logo-text"><strong>ERROUANI</strong><span>CAFTANS &amp; MARIAGE</span></span>
        </a>
        <ul class="nav-links">
          ${NAV_LINKS.map(([u, t, k]) => `<li><a href="${u}"${isActive(u, k)}>${t}</a></li>`).join("")}
        </ul>
        <div class="nav-actions">
          <button class="icon-btn" id="open-search" aria-label="Rechercher">${svgIcon(UI_ICONS.search)}</button>
          <button class="icon-btn" id="open-cart" aria-label="Panier">${svgIcon(UI_ICONS.bag)}<span class="cart-count" data-cart-count>0</span></button>
          <a class="btn btn-primary btn-sm nav-cta-desktop" href="location.html">Réserver</a>
          <button class="icon-btn hamburger" id="burger" aria-label="Menu">${svgIcon(UI_ICONS.menu)}</button>
        </div>
      </nav>
    </div>
  </header>`;
}

function renderMobileMenu() {
  const host = document.getElementById("mobile-menu");
  if (!host) return;
  host.className = "mobile-menu";
  const cur = currentPage();
  host.innerHTML = `
    <div class="mm-bg"></div>
    <aside class="mm-panel">
      <div class="mm-head">
        <img class="logo-img" src="images/logo.png" alt="Errouani" style="width:38px;height:38px">
        <button class="icon-btn" id="mm-close" aria-label="Fermer">${svgIcon(UI_ICONS.close)}</button>
      </div>
      <nav>
        ${NAV_LINKS.map(([u, t]) => `<a href="${u}"${cur === u ? ' class="active"' : ""}><span>${t}</span><span>→</span></a>`).join("")}
      </nav>
      <div class="mm-foot">
        <a class="btn btn-wa btn-block" target="_blank" rel="noopener" href="${waLink("Bonjour " + SITE.name + ", j'aimerais des informations.")}">${svgIcon(UI_ICONS.wa, 17)} WhatsApp</a>
        <a class="btn btn-outline btn-block" href="tel:${esc(SITE.phone || "")}">${svgIcon(UI_ICONS.phone, 16)} ${esc(SITE.phoneDisplay || SITE.phone || "")}</a>
      </div>
    </aside>`;
}

function renderFooter() {
  const host = document.getElementById("site-footer");
  if (!host) return;
  host.innerHTML = `
  <footer class="footer">
    <div class="container">
      <div class="footer-grid">
        <div class="footer-about">
          <a class="logo" href="index.html">
            <img class="logo-img" src="images/logo.png" alt="Errouani">
            <span class="logo-text"><strong>ERROUANI</strong><span>MARRAKECH</span></span>
          </a>
          <p>Maison marocaine de caftans à louer et à acheter, accessoires de fiançailles et décoration d'événements — au cœur de Guéliz.</p>
          <div class="footer-social">
            <a href="${esc(SITE.instagram || "#")}" target="_blank" rel="noopener" aria-label="Instagram">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7"><rect x="3" y="3" width="18" height="18" rx="5"/><circle cx="12" cy="12" r="4.2"/><circle cx="17.2" cy="6.8" r=".9" fill="currentColor"/></svg>
            </a>
            <a href="#" aria-label="Facebook">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M13.5 22v-8h2.7l.4-3.2h-3.1V8.7c0-.9.3-1.6 1.6-1.6h1.7V4.2C16.5 4.1 15.4 4 14.2 4c-2.6 0-4.3 1.6-4.3 4.4v2.4H7.2V14h2.7v8h3.6z"/></svg>
            </a>
            <a href="#" aria-label="TikTok">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M16.6 3c.4 2.1 1.8 3.6 3.9 3.9v3c-1.5 0-2.8-.5-3.9-1.3v5.9a5.9 5.9 0 1 1-5.9-5.9c.3 0 .7 0 1 .1v3.1a2.8 2.8 0 1 0 1.9 2.7V3h3z"/></svg>
            </a>
          </div>
        </div>
        <div>
          <h4>Navigation</h4>
          <ul class="footer-links">
            ${NAV_LINKS.filter(([u]) => u !== "index.html").map(([u, t]) => `<li><a href="${u}">${t}</a></li>`).join("")}
          </ul>
        </div>
        <div>
          <h4>Services</h4>
          <ul class="footer-links">
            <li><a href="location.html">Location caftans</a></li>
            <li><a href="packs.html">Packs fêtes</a></li>
            <li><a href="decoration.html">Décoration événements</a></li>
            <li><a href="apropos.html">Notre histoire</a></li>
            <li><a href="admin/index.html" rel="nofollow">Espace propriétaire</a></li>
          </ul>
        </div>
        <div>
          <h4>Contact</h4>
          <ul class="footer-contact">
            <li>${svgIcon(UI_ICONS.pin, 16)}<span>${esc(SITE.address || "Guéliz, Marrakech")}</span></li>
            <li>${svgIcon(UI_ICONS.phone, 16)}<a href="tel:${esc(SITE.phone || "")}">${esc(SITE.phoneDisplay || SITE.phone || "")}</a></li>
            <li>${svgIcon(UI_ICONS.mail, 16)}<a href="mailto:${esc(SITE.email || "")}">${esc(SITE.email || "")}</a></li>
          </ul>
        </div>
      </div>
      <div class="footer-bottom">
        <span>© ${new Date().getFullYear()} Caftan Errouani — Marrakech. Tous droits réservés.</span>
        <span>Fait avec ♥ à Marrakech · <a href="admin/index.html" rel="nofollow">Admin</a></span>
      </div>
    </div>
  </footer>

  <a class="fab-wa" id="fab-wa" href="${waLink("Bonjour " + SITE.name + " !")}">
    <span class="fab-tip">Une question ? Écrivez-nous</span>
    ${svgIcon(UI_ICONS.wa, 28)}
  </a>

  <div class="overlay" id="overlay"></div>

  <aside class="drawer-cart" id="cart-drawer" aria-label="Panier">
    <div class="dc-head">
      <h3>Votre panier</h3>
      <button class="icon-btn" id="close-cart" aria-label="Fermer">${svgIcon(UI_ICONS.close)}</button>
    </div>
    <div class="dc-body" id="dc-items"></div>
    <div class="dc-foot">
      <div class="dc-total"><span>Total</span><strong id="dc-total">${money(0)}</strong></div>
      <a class="btn btn-outline btn-block" href="panier.html">Voir le panier</a>
      <a class="btn btn-primary btn-block" href="checkout.html">Commander</a>
    </div>
  </aside>

  <div class="search-panel" id="search-panel">
    <div class="container">
      <div class="sp-head">
        ${svgIcon(UI_ICONS.search, 22)}
        <input type="search" class="search-input" id="search-input" placeholder="Rechercher un caftan, un accessoire…" autocomplete="off">
        <button class="icon-btn" id="close-search" aria-label="Fermer">${svgIcon(UI_ICONS.close)}</button>
      </div>
      <div class="sp-results" id="search-results"></div>
    </div>
  </div>

  <div class="toast" id="toast"></div>`;
}

function renderOverlays() { /* inclus dans renderFooter */ }

function refreshCartBadge() {
  const n = Cart.count();
  document.querySelectorAll("[data-cart-count]").forEach(el => {
    el.textContent = n;
    el.style.display = n ? "flex" : "none";
  });
}

function openCart() {
  const wrap = document.getElementById("cart-drawer");
  const items = document.getElementById("dc-items");
  if (!wrap || !items) return;
  const rows = Cart.detailed();
  if (!rows.length) {
    items.innerHTML = `<div class="dc-empty">${svgIcon(UI_ICONS.bag, 34)}<p>Votre panier est vide.</p><a class="btn btn-gold btn-sm" href="boutique.html">Découvrir la boutique</a></div>`;
  } else {
    items.innerHTML = rows.map(r => `
      <div class="dc-item">
        <img src="${productImg(r)}"${imgAttrs(r)} alt="">
        <div class="dc-info">
          <div class="p-name">${esc(r.name)}</div>
          <div class="p-meta">Taille ${esc(r.cartSize)}</div>
          <div class="dc-qty">
            <button data-q="-1" data-id="${esc(r.id)}" data-size="${esc(r.cartSize)}">−</button><span>${r.cartQty}</span><button data-q="1" data-id="${esc(r.id)}" data-size="${esc(r.cartSize)}">+</button>
          </div>
          <a class="dc-remove" data-rm="${esc(r.id)}" data-size="${esc(r.cartSize)}">Retirer</a>
        </div>
        <strong>${money(r.price * r.cartQty)}</strong>
      </div>`).join("");
  }
  const tot = document.getElementById("dc-total");
  if (tot) tot.textContent = money(Cart.total());
  wrap.classList.add("open");
  const ov = document.getElementById("overlay");
  if (ov) ov.classList.add("show");
}
function closeCart() {
  const w = document.getElementById("cart-drawer");
  if (w) w.classList.remove("open");
  const ov = document.getElementById("overlay");
  if (ov) ov.classList.remove("show");
}

function openSearch() {
  const p = document.getElementById("search-panel");
  if (!p) return;
  p.classList.add("open");
  setTimeout(() => { const i = document.getElementById("search-input"); if (i) i.focus(); }, 120);
}
function closeSearch() {
  const p = document.getElementById("search-panel");
  if (p) p.classList.remove("open");
}

function doSearch(qRaw) {
  const q = String(qRaw || "").trim().toLowerCase();
  const out = document.getElementById("search-results");
  if (!out) return;
  if (q.length < 2) { out.innerHTML = ""; return; }
  const db = DB.data;
  const hits = [
    ...db.rentals.map(p => ({ p, url: "location-produit.html?id=" + p.id, kind: "À louer · " + money(p.price) + "/jour" })),
    ...db.shop.map(p => ({ p, url: "produit.html?id=" + p.id, kind: "À vendre · " + money(p.price) })),
    ...db.accessories.map(p => ({ p, url: "accessoires.html#a-" + p.id, kind: "Accessoire · " + money(p.price) })),
    ...db.parties.map(p => ({ p, url: "packs.html#pt-" + p.id, kind: "Pack fête · dès " + money(p.price) }))
  ].filter(x => (x.p.name + " " + (x.p.color || "") + " " + (x.p.category || x.p.style || "") + " " + (x.p.desc || "")).toLowerCase().includes(q)).slice(0, 8);

  out.innerHTML = hits.length ? hits.map(x => `
    <a class="sp-item" href="${x.url}">
      <img src="${productImg(x.p)}"${imgAttrs(x.p)} alt="">
      <div><div class="p-name">${esc(x.p.name)}</div><small>${esc(x.kind)}</small></div>
    </a>`).join("")
    : `<p class="results-count" style="padding:.4rem">Aucun résultat pour « ${esc(qRaw)} » — essayez « caftan », « plateau »…</p>`;
}

/* ---------- Global bindings ---------- */

function bindGlobalUI() {
  renderNav();
  renderMobileMenu();
  renderFooter();
  installImgFallback();
  refreshCartBadge();
  observeReveals();

  document.addEventListener("click", (e) => {
    const t = e.target;

    if (t.closest("#open-search")) { openSearch(); return; }
    if (t.closest("#close-search")) { closeSearch(); return; }
    if (t.closest("#open-cart")) { e.preventDefault(); openCart(); return; }
    if (t.closest("#close-cart")) { closeCart(); return; }
    if (t.closest("#overlay")) { closeCart(); return; }

    const burger = t.closest("#burger");
    if (burger) { document.querySelector(".mobile-menu")?.classList.add("open"); return; }
    if (t.closest("#mm-close")) { document.querySelector(".mobile-menu")?.classList.remove("open"); return; }
    const mmBg = t.closest(".mm-bg");
    if (mmBg) { document.querySelector(".mobile-menu")?.classList.remove("open"); return; }

    const dq = t.closest("[data-q]");
    if (dq) {
      const cur = Cart.items().find(i => i.id === dq.dataset.id && i.size === dq.dataset.size);
      const next = (cur ? cur.qty : 0) + Number(dq.dataset.q);
      if (next < 1) Cart.remove(dq.dataset.id, dq.dataset.size);
      else Cart.updateQty(dq.dataset.id, dq.dataset.size, next);
      refreshCartBadge();
      openCart();
      return;
    }
    const rm = t.closest("[data-rm]");
    if (rm) {
      Cart.remove(rm.dataset.rm, rm.dataset.size);
      refreshCartBadge();
      openCart();
      return;
    }

    const accHead = t.closest("[data-acc-toggle]");
    if (accHead) {
      accHead.closest(".acc-card").classList.toggle("expanded");
      return;
    }
  });

  let searchT;
  document.addEventListener("input", (e) => {
    if (e.target.id === "search-input") {
      clearTimeout(searchT);
      searchT = setTimeout(() => doSearch(e.target.value), 180);
    }
  });
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") { closeCart(); closeSearch(); document.querySelector(".mobile-menu")?.classList.remove("open"); }
  });

  window.addEventListener("scroll", () => {
    const h = document.querySelector(".header");
    if (h) h.classList.toggle("scrolled", window.scrollY > 10);
  }, { passive: true });

  document.addEventListener("click", (e) => {
    const fab = e.target.closest("#fab-wa");
    if (fab && !fab.href.includes("wa.me")) { e.preventDefault(); location.href = waLink("Bonjour !"); }
  }, false);
}
