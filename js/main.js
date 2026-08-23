/* ============================================================
   ERROUANI — Page logic (catalogues, fiches, panier, checkout…)
   ============================================================ */

let shopAddBound = false;
function bindShopAddButtons() {
  if (shopAddBound) return;
  shopAddBound = true;
  document.addEventListener("click", (e) => {
    const b = e.target.closest("[data-shop-add]");    if (!b) return;
    e.preventDefault();
    const p = DB.data.shop.find(x => x.id === b.dataset.shopAdd);
    if (!p) return;
    Cart.add(p.id, b.dataset.size || (p.sizes || ["Unique"])[0], 1);
    refreshCartBadge();
    openCart();
    showToast("Ajouté au panier ✓");
  });
}

function tagsFor(p, kind) {
  let h = "";
  if (kind === "rental") h += `<span class="tag tag-rent">À louer</span>`;
  if (kind === "shop") h += `<span class="tag tag-sale">À vendre</span>`;
  if (kind === "party") h += `<span class="tag tag-sale">Pack fête</span>`;
  if (p.isNew) h += `<span class="tag tag-new">Nouveau</span>`;
  if (p.stock !== undefined && p.stock <= 0) h = `<span class="tag tag-out">Épuisé</span>`;
  return h;
}

function rentalCard(p) {
  return `
  <article class="p-card reveal">
    <div class="p-media">
      <a href="location-produit.html?id=${esc(p.id)}"><img src="${productImg(p)}"${imgAttrs(p)} alt="${esc(p.name)}" loading="lazy"></a>
      <div class="p-tags">${tagsFor(p, "rental")}</div>
      <div class="p-overlay">
        <a class="btn btn-light" href="location-produit.html?id=${esc(p.id)}">Voir &amp; réserver</a>
      </div>
    </div>
    <div class="p-body">
      <h3 class="p-name">${esc(p.name)}</h3>
      <span class="p-meta">${esc([p.color, p.style].filter(Boolean).join(" · "))}</span>
      <div class="p-price-row"><span class="price">${money(p.price)} <small>/ jour</small></span></div>
    </div>
  </article>`;
}

function shopCard(p) {
  const out = p.stock !== undefined && p.stock <= 0;
  return `
  <article class="p-card reveal">
    <div class="p-media">
      <a href="produit.html?id=${esc(p.id)}"><img src="${productImg(p)}"${imgAttrs(p)} alt="${esc(p.name)}" loading="lazy"></a>
      <div class="p-tags">${tagsFor(p, "shop")}</div>
      ${p.oldPrice && !out ? `<span class="badge-promo">-${Math.round((1 - p.price / p.oldPrice) * 100)}%</span>` : ""}
      <div class="p-overlay">
        <a class="btn btn-light" href="produit.html?id=${esc(p.id)}">Détails</a>
        <button class="btn btn-light" data-shop-add="${esc(p.id)}"${out ? " disabled" : ""}>${out ? "Épuisé" : "Panier +"}</button>
      </div>
    </div>
    <div class="p-body">
      <h3 class="p-name">${esc(p.name)}</h3>
      <span class="p-meta">${esc(p.category || "")}</span>
      <div class="p-price-row"><span class="price">${money(p.price)}</span>${p.oldPrice ? `<span class="price-old">${money(p.oldPrice)}</span>` : ""}</div>
    </div>
  </article>`;
}

function partyCard(p) {
  return `
  <article class="p-card reveal" id="pt-${esc(p.id)}">
    <div class="p-media">
      <img src="${productImg(p)}"${imgAttrs(p)} alt="${esc(p.name)}" loading="lazy">
      <div class="p-tags">${tagsFor(p, "party")}</div>
    </div>
    <div class="p-body">
      <h3 class="p-name">${esc(p.name)}</h3>
      <span class="p-meta">✨ ${esc(p.occasion)}</span>
      <div class="p-price-row"><span class="price">dès ${money(p.price)}</span></div>
      <div class="acc-actions">
        <a class="btn btn-primary btn-sm" href="contact.html">Réserver</a>
        <a class="btn btn-wa btn-sm" target="_blank" rel="noopener" href="${waLink("Bonjour, je souhaite réserver le pack « " + p.name + " » (dès " + money(p.price) + ").")}">WhatsApp ${svgIcon(UI_ICONS.wa, 14)}</a>
      </div>
    </div>
  </article>`;
}

/* ================= ACCUEIL ================= */

function initHome() {
  const db = DB.data;

  const news = [
    ...db.rentals.filter(p => p.isNew).slice(0, 4).map(p => rentalCard(p)),
    ...db.shop.filter(p => p.isNew).slice(0, 4).map(p => shopCard(p))
  ].slice(0, 8);
  const grid = document.getElementById("home-news");
  if (grid) {
    grid.innerHTML = news.join("");
    observeReveals(grid);
  }

  ["cta-wa", "cta-wa-bottom"].forEach(id => {
    const cta = document.getElementById(id);
    if (cta) cta.href = waLink("Bonjour " + SITE.name + ", je découvre votre collection !");
  });
}

/* ================= LOCATION ================= */

function initLocation() {
  bindShopAddButtons();
  const db = DB.data;
  const grid = document.getElementById("rentals-grid");
  if (!grid) return;
  const count = document.getElementById("loc-count");
  const fColor = document.getElementById("f-color");
  const fSize = document.getElementById("f-size");
  const fStyle = document.getElementById("f-style");
  const fPrice = document.getElementById("f-price");
  const fPriceVal = document.getElementById("f-price-val");
  const fAvail = document.getElementById("f-avail");

  [fColor, fSize, fStyle].forEach(sel => {
    if (!sel) return;
    sel.innerHTML = '<option value="">Toutes</option>';
  });
  [...new Set(db.rentals.map(r => r.color).filter(Boolean))].sort().forEach(c => fColor.insertAdjacentHTML("beforeend", `<option value="${esc(c)}">${esc(c)}</option>`));
  [...new Set(db.rentals.flatMap(r => r.sizes || []))].sort((a, b) => Number(a) - Number(b)).forEach(s => fSize.insertAdjacentHTML("beforeend", `<option value="${esc(s)}">${esc(s)}</option>`));
  [...new Set(db.rentals.map(r => r.style).filter(Boolean))].forEach(s => fStyle.insertAdjacentHTML("beforeend", `<option value="${esc(s)}">${esc(s)}</option>`));
  if (fPrice) fPrice.max = Math.max(...db.rentals.map(r => r.price));

  function apply() {
    const color = fColor.value, size = fSize.value, style = fStyle.value;
    const maxP = fPrice ? Number(fPrice.value) : Infinity;
    const availOnly = !fAvail || fAvail.checked;
    const presetStyle = getParam("style");
    let list = db.rentals.filter(r =>
      (!color || r.color === color) &&
      (!size || (r.sizes || []).includes(size)) &&
      (!style || r.style === style || (presetStyle && r.style === presetStyle)) &&
      r.price <= maxP &&
      (!availOnly || r.available !== false)
    );
    grid.innerHTML = list.length ? list.map(rentalCard).join("") :
      `<div class="empty-state"><div class="big">Aucun caftan pour ces critères</div><p>Essayez d'élargir votre recherche — ou écrivez-nous, la collection bouge vite !</p></div>`;
    if (count) count.textContent = list.length + " caftan" + (list.length > 1 ? "s" : "") + " trouvé" + (list.length > 1 ? "s" : "");
    observeReveals(grid);
  }

  ["change", "input"].forEach(ev => {
    if (fColor) fColor.addEventListener(ev, apply);
    if (fSize) fSize.addEventListener(ev, apply);
    if (fStyle) fStyle.addEventListener(ev, apply);
    if (fPrice) fPrice.addEventListener(ev, () => { if (fPriceVal) fPriceVal.textContent = "≤ " + money(Number(fPrice.value)); apply(); });
    if (fAvail) fAvail.addEventListener(ev, apply);
  });
  apply();

  const waCta = document.getElementById("loc-wa");
  if (waCta) waCta.href = waLink("Bonjour, je cherche un caftan spécial : ");
}

/* ================= FICHE LOCATION ================= */

let galBound = false;
function bindGallerySwap() {
  if (galBound) return;
  galBound = true;
  document.addEventListener("click", (e) => {
    const t = e.target.closest("#gal-thumbs img");
    if (!t) return;
    const main = document.getElementById("gal-main");
    if (!main) return;
    main.src = t.dataset.gal;
    document.querySelectorAll("#gal-thumbs img").forEach(x => x.classList.toggle("active", x === t));
  });
}

function initRentalDetail() {
  bindShopAddButtons();
  bindGallerySwap();
  const root = document.getElementById("rental-detail");
  if (!root) return;
  const db = DB.data;
  const p = db.rentals.find(x => x.id === getParam("id")) || db.rentals[0];
  if (!p) { root.innerHTML = `<section class="section container"><div class="empty-state"><div class="big">Caftan introuvable</div><a class="btn btn-primary" href="location.html">Retour à la collection</a></div></section>`; return; }

  p.availability = p.availability || {};
  root.innerHTML = `
  <section class="page-hero" style="padding-bottom:1rem">
    <div class="container">
      <nav class="breadcrumb"><a href="index.html">Accueil</a> › <a href="location.html">Location</a> › <span>${esc(p.name)}</span></nav>
    </div>
  </section>
  <section class="section-tight container">
    <div class="detail-layout">
      <div>
        <div class="gallery-main"><img id="gal-main" src="${productImg(p)}"${imgAttrs(p)} alt="${esc(p.name)}"></div>
        ${galleryThumbs(p)}
        <div class="calendar">
          <div class="cal-head">
            <strong id="cal-title"></strong>
            <div class="cal-nav">
              <button type="button" id="cal-prev" aria-label="Mois précédent">‹</button>
              <button type="button" id="cal-next" aria-label="Mois suivant">›</button>
            </div>
          </div>
          <div id="cal-wrap"></div>
          <div class="cal-legend">
            <span><i class="leg-a"></i>Disponible</span>
            <span><i class="leg-r"></i>Réservé</span>
            <span><i class="leg-b"></i>Bloqué</span>
          </div>
        </div>
      </div>
      <div class="detail-info">
        <div class="p-tags" style="position:static;margin-bottom:.6rem">${tagsFor(p, "rental")}</div>
        <h1>${esc(p.name)}</h1>
        <span class="p-meta">${esc([p.color, p.style, (p.sizes || []).join(", ")].filter(Boolean).join(" · "))}</span>
        <div class="detail-price"><span class="price">${money(p.price)} <small>/ jour</small></span></div>
        <p class="detail-desc">${esc(p.desc || "Pièce d'exception de notre collection, essayage sur rendez-vous dans notre showroom de Guéliz.")}</p>
        <ul class="spec-list">
          <li>${svgIcon(UI_ICONS.check, 15)} Nettoyage à sec inclus après votre événement</li>
          <li>${svgIcon(UI_ICONS.check, 15)} Retraits et retours au showroom, ou livraison Marrakech</li>
          <li>${svgIcon(UI_ICONS.check, 15)} Caution demandée à la remise de la pièce</li>
        </ul>

        <div class="reserve-box" id="reserver">
          <h3>Demande de réservation</h3>
          <form id="resa-form">
            <div class="form-row">
              <div class="form-field"><label for="res-from">Du *</label><input type="date" id="res-from" required></div>
              <div class="form-field"><label for="res-to">Au *</label><input type="date" id="res-to" required></div>
            </div>
            <div class="form-field"><label for="res-name">Votre nom *</label><input type="text" id="res-name" required placeholder="Nom et prénom"></div>
            <div class="form-field"><label for="res-phone">Téléphone / WhatsApp *</label><input type="tel" id="res-phone" required placeholder="06 XX XX XX XX"></div>
            <div class="form-field"><label for="res-note">Message (facultatif)</label><textarea id="res-note" rows="2" placeholder="Votre événement, vos souhaits…"></textarea></div>
            <button type="submit" class="btn btn-wa btn-lg btn-block">Vérifier &amp; réserver sur WhatsApp ${svgIcon(UI_ICONS.wa, 17)}</button>
          </form>
        </div>
      </div>
    </div>
  </section>`;

  /* --- Calendrier --- */
  const today = new Date(); today.setHours(12, 0, 0, 0);
  let calY = today.getFullYear(), calM = today.getMonth();
  const MOIS = ["Janvier", "Février", "Mars", "Avril", "Mai", "Juin", "Juillet", "Août", "Septembre", "Octobre", "Novembre", "Décembre"];
  const dayKey = d => d.getFullYear() + "-" + String(d.getMonth() + 1).padStart(2, "0") + "-" + String(d.getDate()).padStart(2, "0");
  const statusOf = d => {
    const k = dayKey(d);
    const st = p.availability[k];
    if (st === "reserved") return "reserved";
    if (st === "blocked") return "blocked";
    return "avail";
  };

  function drawCal() {
    document.getElementById("cal-title").textContent = MOIS[calM] + " " + calY;
    const first = new Date(calY, calM, 1);
    const daysIn = new Date(calY, calM + 1, 0).getDate();
    const pad = (first.getDay() + 6) % 7;
    let html = '<div class="cal-grid">' + ["Lun", "Mar", "Mer", "Jeu", "Ven", "Sam", "Dim"].map(d => `<span class="cal-dow">${d}</span>`).join("");
    for (let i = 0; i < pad; i++) html += '<span class="cal-day other"></span>';
    for (let d = 1; d <= daysIn; d++) {
      const dt = new Date(calY, calM, d, 12);
      const st = statusOf(dt);
      const past = dt < today;
      const cls = past ? "blocked" : st;
      html += `<button type="button" class="cal-day ${cls}" data-date="${dayKey(dt)}" ${past || cls !== "avail" ? "disabled" : ""}>${d}</button>`;
    }
    html += "</div>";
    document.getElementById("cal-wrap").innerHTML = html;
    document.querySelectorAll("#cal-wrap .cal-day.avail").forEach(b => b.addEventListener("click", () => {
      const from = document.getElementById("res-from");
      const to = document.getElementById("res-to");
      if (!from.value || (to.value && from.value > b.dataset.date)) { from.value = b.dataset.date; to.value = ""; }
      else if (!to.value && b.dataset.date > from.value) { to.value = b.dataset.date; }
      else { from.value = b.dataset.date; to.value = ""; }
      document.querySelectorAll("#cal-wrap .cal-day").forEach(x => x.classList.remove("selected", "range"));
      document.querySelectorAll("#cal-wrap .cal-day").forEach(x => {
        if (x.disabled) return;
        if (x.dataset.date === from.value) x.classList.add("selected");
        else if (from.value && to.value && x.dataset.date > from.value && x.dataset.date < to.value) x.classList.add("range");
      });
    }));
  }
  drawCal();
  document.getElementById("cal-prev").addEventListener("click", () => { calM--; if (calM < 0) { calM = 11; calY--; } drawCal(); });
  document.getElementById("cal-next").addEventListener("click", () => { calM++; if (calM > 11) { calM = 0; calY++; } drawCal(); });

  /* --- Réservation --- */
  function rangeBlocked(a, b) {
    const cur = new Date(a + "T12:00:00");
    const end = new Date(b + "T12:00:00");
    while (cur <= end) {
      const st = statusOf(cur);
      if (st !== "avail") return true;
      cur.setDate(cur.getDate() + 1);
    }
    return false;
  }
  document.getElementById("resa-form").addEventListener("submit", (e) => {
    e.preventDefault();
    const from = document.getElementById("res-from").value;
    const to = document.getElementById("res-to").value;
    const name = document.getElementById("res-name").value.trim();
    const phone = document.getElementById("res-phone").value.trim();
    const note = document.getElementById("res-note").value.trim();
    if (!from || !to || !name || !phone) { showToast("Merci de compléter les champs obligatoires."); return; }
    if (to < from) { showToast("La date de fin doit suivre la date de début."); return; }
    if (rangeBlocked(from, to)) { showToast("Ces dates ne sont pas disponibles — choisissez-en d'autres 🙏"); return; }

    DB.data.reservations.push({
      id: DB.id("r"), productId: p.id, productName: p.name,
      name, phone, note, from, to, price: p.price,
      status: "En attente", created: new Date().toISOString()
    });
    DB.save();
    showToast("Demande envoyée ✓ Finalisons sur WhatsApp !");
    setTimeout(() => {
      window.open(waLink(`Bonjour ${SITE.name} ! Je souhaite réserver « ${p.name} » du ${from} au ${to} (${money(p.price)}/jour). — ${name}`), "_blank");
    }, 600);
  });
}

/* ================= BOUTIQUE ================= */

function initBoutique() {
  bindShopAddButtons();
  const db = DB.data;
  const grid = document.getElementById("shop-grid");
  if (!grid) return;
  const chipsWrap = document.getElementById("shop-cats");
  const sortSel = document.getElementById("shop-sort");
  const countEl = document.getElementById("shop-count");
  const cats = [...new Set(db.shop.map(p => p.category))];
  let activeCat = getParam("cat") || "";

  function renderChips() {
    chipsWrap.innerHTML =
      `<button type="button" class="chip${!activeCat ? " active" : ""}" data-cat="">Tout</button>` +
      cats.map(c => `<button type="button" class="chip${activeCat === c ? " active" : ""}" data-cat="${esc(c)}">${esc(c)}</button>`).join("");
  }

  function apply() {
    let list = db.shop.filter(p => !activeCat || p.category === activeCat);
    const s = sortSel.value;
    if (s === "price-asc") list = [...list].sort((a, b) => a.price - b.price);
    if (s === "price-desc") list = [...list].sort((a, b) => b.price - a.price);
    if (s === "promo") list = [...list].sort((a, b) => (b.oldPrice ? 1 : 0) - (a.oldPrice ? 1 : 0));
    grid.innerHTML = list.length ? list.map(shopCard).join("") :
      `<div class="empty-state"><div class="big">Rien dans cette catégorie</div><p>D'autres pièces arrivent très bientôt ✨</p></div>`;
    if (countEl) countEl.textContent = list.length + " pièce" + (list.length > 1 ? "s" : "");
    observeReveals(grid);
  }

  chipsWrap.addEventListener("click", (e) => {
    const chip = e.target.closest(".chip[data-cat]");
    if (!chip) return;
    activeCat = chip.dataset.cat;
    renderChips();
    apply();
  });
  sortSel.addEventListener("change", apply);
  renderChips();
  apply();
}

/* ================= FICHE PRODUIT ================= */

function initProductDetail() {
  bindShopAddButtons();
  bindGallerySwap();
  const root = document.getElementById("product-detail");
  if (!root) return;
  const db = DB.data;
  const p = db.shop.find(x => x.id === getParam("id")) || db.shop[0];
  if (!p) { root.innerHTML = `<section class="section container"><div class="empty-state"><div class="big">Produit introuvable</div><a class="btn btn-primary" href="boutique.html">Retour à la boutique</a></div></section>`; return; }

  const out = p.stock !== undefined && p.stock <= 0;
  root.innerHTML = `
  <section class="page-hero" style="padding-bottom:1rem">
    <div class="container">
      <nav class="breadcrumb"><a href="index.html">Accueil</a> › <a href="boutique.html">Boutique</a> › <span>${esc(p.name)}</span></nav>
    </div>
  </section>
  <section class="section-tight container">
    <div class="detail-layout">
      <div>
        <div class="gallery-main">
          <img id="gal-main" src="${productImg(p)}"${imgAttrs(p)} alt="${esc(p.name)}">
          ${p.oldPrice && !out ? `<span class="badge-promo">Promo</span>` : ""}
        </div>
        ${galleryThumbs(p)}
      </div>
      <div class="detail-info">
        <div class="p-tags" style="position:static;margin-bottom:.6rem">${tagsFor(p, "shop")}</div>
        <h1>${esc(p.name)}</h1>
        <div class="detail-price">
          <span class="price">${money(p.price)}</span>
          ${p.oldPrice ? `<span class="price-old">${money(p.oldPrice)}</span>` : ""}
        </div>
        <p class="detail-desc">${esc(p.desc || "Pièce coup de cœur, confectionnée dans des tissus nobles.")}</p>

        ${(p.sizes || []).length ? `
        <strong style="font-size:.9rem">Taille</strong>
        <div class="size-chips">
          ${p.sizes.map(s => `<button type="button" class="size-chip" data-size="${esc(s)}">${esc(s)}</button>`).join("")}
        </div>` : ""}

        <span class="stock-note ${out ? "stock-out" : p.stock <= 2 ? "stock-low" : "stock-in"}">
          ● ${out ? "Épuisé — revenez bientôt" : p.stock <= 2 ? "Plus que " + p.stock + " en stock !" : "En stock, expédié sous 48h"}
        </span>

        <div class="detail-actions">
          <button class="btn btn-primary btn-lg" id="add-cart-btn"${out ? " disabled" : ""}>${out ? "Épuisé" : "Ajouter au panier"}</button>
          <a class="btn btn-wa btn-lg" target="_blank" rel="noopener" href="${waLink("Bonjour, je suis intéressée par « " + p.name + " » (" + money(p.price) + ").")}">Commander sur WhatsApp ${svgIcon(UI_ICONS.wa, 16)}</a>
        </div>

        <ul class="spec-list">
          <li>${svgIcon(UI_ICONS.check, 15)} Livraison partout au Maroc (24-72h)</li>
          <li>${svgIcon(UI_ICONS.check, 15)} Paiement à la livraison ou virement</li>
          <li>${svgIcon(UI_ICONS.check, 15)} Échange possible sous 48h, article non porté</li>
        </ul>
      </div>
    </div>
  </section>`;

  let selectedSize = null;
  const chips = root.querySelectorAll(".size-chip");
  chips.forEach(c => c.addEventListener("click", () => {
    selectedSize = c.dataset.size;
    chips.forEach(x => x.classList.toggle("selected", x === c));
  }));

  document.getElementById("add-cart-btn").addEventListener("click", () => {
    const needSize = (p.sizes || []).length > 0;
    if (needSize && !selectedSize) { showToast("Choisissez d'abord votre taille."); return; }
    if (out) { showToast("Produit épuisé — contactez-nous, il revient vite !"); return; }
    Cart.add(p.id, selectedSize || "Unique", 1);
    refreshCartBadge();
    openCart();
    showToast("Ajouté au panier ✓");
  });

  const related = document.getElementById("related-grid");
  if (related) {
    const rel = db.shop.filter(x => x.category === p.category && x.id !== p.id).slice(0, 4);
    if (rel.length) {
      document.getElementById("related-section").style.display = "";
      related.innerHTML = rel.map(shopCard).join("");
      observeReveals(related);
    }
  }
}

/* ================= PANIER ================= */

function initPanier() {
  bindShopAddButtons();
  const table = document.getElementById("cart-table");
  if (!table) return;

  function refresh() {
    const rows = Cart.detailed();
    if (!rows.length) {
      table.innerHTML = `<div class="empty-state"><div class="big">Votre panier est vide</div><p>Il vous reste plein de belles pièces à découvrir !</p><a class="btn btn-primary" href="boutique.html">Voir la boutique</a></div>`;
      document.getElementById("cart-total").textContent = money(0);
      return;
    }
    table.innerHTML = `
    <table class="cart-table">
      <thead><tr><th>Article</th><th>Taille</th><th>Prix</th><th>Qté</th><th>Total</th><th></th></tr></thead>
      <tbody>${rows.map(r => `
        <tr>
          <td><div class="cart-prod"><img src="${productImg(r)}"${imgAttrs(r)} alt=""><div><strong>${esc(r.name)}</strong></div></div></td>
          <td>${esc(r.cartSize)}</td>
          <td>${money(r.price)}</td>
          <td><div class="dc-qty"><button data-q="-1" data-id="${esc(r.id)}" data-size="${esc(r.cartSize)}">−</button><span>${r.cartQty}</span><button data-q="1" data-id="${esc(r.id)}" data-size="${esc(r.cartSize)}">+</button></div></td>
          <td><strong>${money(r.price * r.cartQty)}</strong></td>
          <td><a class="cart-remove" data-rm="${esc(r.id)}" data-size="${esc(r.cartSize)}">✕ Retirer</a></td>
        </tr>`).join("")}
      </tbody></table>`;
    document.getElementById("cart-total").textContent = money(Cart.total());
  }

  table.addEventListener("click", (e) => {
    const q = e.target.closest("[data-q]");
    if (q) {
      const cur = Cart.items().find(i => i.id === q.dataset.id && i.size === q.dataset.size);
      const next = (cur ? cur.qty : 0) + Number(q.dataset.q);
      if (next < 1) Cart.remove(q.dataset.id, q.dataset.size); else Cart.updateQty(q.dataset.id, q.dataset.size, next);
    }
    const rm = e.target.closest("[data-rm]");
    if (rm) Cart.remove(rm.dataset.rm, rm.dataset.size);
    if (q || rm) { refresh(); refreshCartBadge(); }
  });

  refresh();
}

/* ================= CHECKOUT ================= */

const DELIVERY_FEES = { domicile: 50, relais: 30, retrait: 0 };

function initCheckout() {
  bindShopAddButtons();
  const wrap = document.getElementById("checkout-wrap");
  if (!wrap) return;
  const rows = Cart.detailed();

  if (!rows.length) {
    wrap.innerHTML = `<div class="empty-state"><div class="big">Votre panier est vide</div><p>Ajoutez de belles pièces avant de commander.</p><a class="btn btn-primary" href="boutique.html">Voir la boutique</a></div>`;
    return;
  }

  const items = document.getElementById("co-items");
  items.innerHTML = rows.map(r => `
    <li class="sum-item">
      <img src="${productImg(r)}"${imgAttrs(r)} alt="">
      <div style="flex:1"><strong>${esc(r.name)}</strong><br><small class="p-meta">Taille ${esc(r.cartSize)} × ${r.cartQty}</small></div>
      <strong>${money(r.price * r.cartQty)}</strong>
    </li>`).join("");

  function fee() {
    const sel = wrap.querySelector('input[name="delivery"]:checked');
    return DELIVERY_FEES[sel ? sel.value : "domicile"] ?? 50;
  }
  function totals() {
    const sub = Cart.total(), f = fee();
    document.getElementById("co-subtotal").textContent = money(sub);
    document.getElementById("co-fee").textContent = f === 0 ? "Offerte ✓" : money(f);
    document.getElementById("co-total").textContent = money(sub + f);
  }

  wrap.querySelectorAll('input[name="delivery"]').forEach(r => r.addEventListener("change", () => {
    wrap.querySelectorAll(".radio-card").forEach(c => c.classList.toggle("checked", c.contains(wrap.querySelector('input[name="delivery"]:checked')) || false));
    totals();
  }));

  totals();

  document.getElementById("checkout-form").addEventListener("submit", (e) => {
    e.preventDefault();
    const ref = "CMD-" + Math.random().toString(36).slice(2, 8).toUpperCase();
    const delivery = wrap.querySelector('input[name="delivery"]:checked');
    const payment = wrap.querySelector('input[name="payment"]:checked');
    const order = {
      id: DB.id("o"), ref,
      customer: {
        name: document.getElementById("ck-name").value.trim(),
        phone: document.getElementById("ck-phone").value.trim(),
        city: document.getElementById("ck-city").value.trim(),
        address: document.getElementById("ck-address").value.trim(),
        note: document.getElementById("ck-note").value.trim(),
        delivery: delivery ? delivery.value : "domicile",
        payment: payment ? payment.value : ""
      },
      items: Cart.items(),
      subtotal: Cart.total(),
      fee: fee(),
      total: Cart.total() + fee(),
      status: "Nouvelle",
      created: new Date().toISOString()
    };
    order.items.forEach(i => {
      const prod = DB.data.shop.find(x => x.id === i.id);
      if (prod && typeof prod.stock === "number") prod.stock = Math.max(0, prod.stock - i.qty);
    });
    DB.data.orders.push(order);
    DB.save();
    Cart.clear();
    refreshCartBadge();
    wrap.innerHTML = `
    <div class="success-panel">
      <div class="success-icon">${svgIcon(UI_ICONS.check, 40)}</div>
      <h2>Merci ${esc(order.customer.name.split(" ")[0])} ! 🎉</h2>
      <p>Votre commande <strong>${order.ref}</strong> est bien reçue.<br>Nous vous appelons très vite pour la confirmer.</p>
      <p class="results-count">Total : ${money(order.total)} · ${esc(order.customer.payment)}</p>
      <div style="display:flex;gap:.8rem;justify-content:center;margin-top:1.6rem">
        <a class="btn btn-wa" target="_blank" rel="noopener" href="${waLink("Bonjour ! Je viens de passer la commande " + order.ref + ".")}">Confirmer sur WhatsApp</a>
        <a class="btn btn-outline" href="index.html">Retour à l'accueil</a>
      </div>
    </div>`;
    observeReveals(wrap);
  });
}

/* ================= ACCESSOIRES ================= */

function initAccessories() {
  bindShopAddButtons();
  const db = DB.data;
  const root = document.getElementById("acc-grid");
  if (!root) return;

  const FAMILIES = [
    { cat: "La Mariée", emoji: "👰‍♀️", title: "La parure de la mariée", ar: "أكسسوارات العروس" },
    { cat: "Amariya & Cérémonie", emoji: "🪭", title: "Pour l'Amariya & les cérémonies", ar: "العمارية والاحتفال" },
    { cat: "Décoration de fête", emoji: "🎉", title: "Décoration & accessoires de fêtes", ar: "ديكور الحفلات" }
  ];

  function accCard(a) {
    return `
    <article class="acc-card reveal" id="a-${esc(a.id)}">
      <div class="acc-media">
        <img src="${a.img ? productImg(a) : phSVG(a.icon || "star", a.name, hashStr(a.id) % PALETTES.length)}"${a.img ? imgAttrs(a) : ' alt="' + esc(a.name) + '"'} loading="lazy">
        ${a.available === false ? `<span class="p-tags"><span class="tag-out">Indisponible</span></span>` : ""}
      </div>
      <div class="acc-body">
        <h3 class="p-name">${esc(a.name)}</h3>
        ${a.nameAr ? `<p class="acc-name-ar">${esc(a.nameAr)}</p>` : ""}
        <div class="acc-details">${esc(a.desc || "")}</div>
        <div class="acc-actions">
          <span class="price" style="align-self:center">${money(a.price)} <small>/ jour</small></span>
          <a class="btn btn-gold btn-sm${a.available === false ? " disabled" : ""}" target="_blank" rel="noopener" href="${waLink("Bonjour, je souhaite louer : " + a.name + " (" + money(a.price) + "/jour).")}">Réserver</a>
        </div>
      </div>
    </article>`;
  }

  root.innerHTML = FAMILIES.map(f => {
    const list = db.accessories.filter(a => a.category === f.cat);
    if (!list.length) return "";
    return `
    <section class="acc-family">
      <div class="section-head">
        <span class="eyebrow">${f.emoji} ${esc(f.cat)}</span>
        <h2>${esc(f.title)}</h2>
        <p class="acc-family-ar">${esc(f.ar)}</p>
      </div>
      <div class="grid-products">${list.map(accCard).join("")}</div>
    </section>`;
  }).join("");
  observeReveals(root);
}

/* ================= PACKS FÊTES ================= */

function initPacks() {
  bindShopAddButtons();
  const db = DB.data;
  const grid = document.getElementById("parties-grid");
  if (!grid) return;
  const chipsWrap = document.getElementById("party-cats");
  const countEl = document.getElementById("parties-count");
  const occs = [...new Set(db.parties.map(p => p.occasion))];
  let activeOcc = "";

  function apply() {
    const list = db.parties.filter(p => !activeOcc || p.occasion === activeOcc);
    grid.innerHTML = list.length ? list.map(partyCard).join("") :
      `<div class="empty-state"><div class="big">Pas encore de pack pour cette occasion</div><p>Mais on peut tout imaginer — écrivez-nous !</p></div>`;
    if (countEl) countEl.textContent = list.length + " pack" + (list.length > 1 ? "s" : "");
    observeReveals(grid);
  }

  chipsWrap.addEventListener("click", (e) => {
    const chip = e.target.closest(".chip[data-occ]");
    if (!chip) return;
    activeOcc = chip.dataset.occ;
    chipsWrap.querySelectorAll(".chip").forEach(c => c.classList.toggle("active", c === chip));
    apply();
  });

  chipsWrap.innerHTML =
    `<button type="button" class="chip active" data-occ="">Toutes occasions</button>` +
    occs.map(o => `<button type="button" class="chip" data-occ="${esc(o)}">${esc(o)}</button>`).join("");
  apply();
}

/* ================= DÉCORATION ================= */

function initDecoration() {
  bindShopAddButtons();
  const grid = document.getElementById("packs-grid");
  if (!grid) return;
  const packs = DB.data.packs;

  grid.innerHTML = packs.map((pk, i) => `
    <div class="pack-card reveal${pk.featured ? " featured" : ""}">
      ${pk.featured ? `<span class="pack-badge">★ Le plus choisi</span>` : ""}
      <h3>${esc(pk.name)}</h3>
      <p class="pack-desc">${esc(pk.desc)}</p>
      <div class="pack-price">${money(pk.price)}<small> / événement</small></div>
      <ul class="pack-list">
        ${(pk.includes || []).map(it => `<li>${svgIcon(UI_ICONS.check, 14)} ${esc(it)}</li>`).join("")}
      </ul>
      <a class="btn ${pk.featured ? "btn-gold" : "btn-primary"} btn-block" target="_blank" rel="noopener" href="${waLink("Bonjour, je m'intéresse à la formule déco « " + pk.name + " » (" + money(pk.price) + ").")}">Demander cette formule</a>
    </div>`).join("");

  const form = document.getElementById("quote-form");
  if (form) form.addEventListener("submit", (e) => {
    e.preventDefault();
    const name = document.getElementById("qt-name").value.trim();
    const phone = document.getElementById("qt-phone").value.trim();
    const details = document.getElementById("qt-details").value.trim();
    if (!name || !phone || !details) { showToast("Complétez nom, téléphone et description 🙏"); return; }
    DB.data.messages.push({
      id: DB.id("m"), name, phone, email: "",
      subject: "Devis décoration", message: details,
      read: false, created: new Date().toISOString()
    });
    DB.save();
    showToast("Demande envoyée ✓ Réponse sous 24h !");
    form.reset();
  });

  observeReveals(grid);
}

/* ================= CONTACT ================= */

function initContact() {
  const form = document.getElementById("contact-form");
  if (!form) return;
  form.addEventListener("submit", (e) => {
    e.preventDefault();
    const name = document.getElementById("ct-name").value.trim();
    const phone = document.getElementById("ct-phone").value.trim();
    const email = document.getElementById("ct-email").value.trim();
    const subject = document.getElementById("ct-subject").value;
    const message = document.getElementById("ct-message").value.trim();
    if (!name || !message) { showToast("Nom et message sont requis 🙂"); return; }
    DB.data.messages.push({ id: DB.id("m"), name, phone, email, subject, message, read: false, created: new Date().toISOString() });
    DB.save();
    showToast("Message envoyé ✓ Nous répondons sous 24h !");
    form.reset();
  });
}
