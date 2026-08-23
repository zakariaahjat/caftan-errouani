# Caftan Errouani — Site + Administration

Site vitrine & boutique pour la location de caftans, la vente en ligne, les accessoires
de fiançailles, la décoration d'événements et les packs de fête — 100% HTML/CSS/JS,
aucune installation nécessaire.

## Lancer le site

Ouvrez simplement `index.html` dans un navigateur (double-clic).
Pour un rendu optimal (recommandé) :

```
npx serve .
```

puis ouvrez l'URL affichée.

## Pages

| Page | Rôle |
|---|---|
| `index.html` | Accueil (hero, univers, nouveautés, avis, Instagram, CTA) |
| `location.html` | Catalogue **Location** avec filtres (couleur, taille, style, prix, dispo) |
| `location-produit.html?id=…` | Fiche location : galerie, calendrier de disponibilité, réservation WhatsApp |
| `boutique.html` | Catalogue **Vente** avec catégories + tri |
| `produit.html?id=…` | Fiche produit : tailles, stock, ajout panier, achat immédiat |
| `panier.html` / `checkout.html` | Panier & commande (livraison Maroc, paiement à la livraison ou virement) |
| `accessoires.html` | Accessoires de fiançailles à louer |
| `packs.html` | **Packs de fête tout-en-un** (fiançailles, anniversaire, baby shower, henné…) |
| `decoration.html` | Services décoration + formules Essentiel / Premium / Sur-mesure |
| `apropos.html` · `contact.html` | Histoire & contact (formulaire → boîte admin) |

## Administration

Ouvrez `admin/index.html` — code PIN par défaut : **1234**.

Vous pouvez gérer : caftans à louer (+ calendrier jour par jour : disponible /
réservé / bloqué), produits à vendre (prix barrés promo, stock), accessoires,
**packs de fête**, formules déco, commandes (statuts), réservations (bouton
« Bloquer les dates »), messages du site, et vos coordonnées (numéro WhatsApp…).

Données stockées dans le navigateur (localStorage). Export/import JSON dans
Paramètres — pensez à faire des sauvegardes régulières.

## À personnaliser en priorité

1. `js/config.js` : numéro WhatsApp (`2126XXXXXXXX`), email, Instagram, adresse.
2. `admin` → Paramètres : même chose, directement sans toucher au code.
3. Photos réelles : dans l'admin, chaque produit accepte une URL d'image
   (ex. `images/caftan1.jpg`) — sinon une illustration élégante est générée.

## Vos photos (Instagram, téléphone…)

Le site charge automatiquement vos photos depuis le dossier `images/`.
Il suffit de **renommer chaque photo selon la liste ci-dessous** et de la
déposer dans `images/`. Tant qu'un fichier est absent, une illustration
de remplacement s'affiche — aucune erreur visible.

| Fichier | Emplacement sur le site |
|---|---|
| `logo.png` | Logo (barre de navigation, pied de page, admin, favicon) |
| `hero.jpg` | Grande image d'accueil |
| `apropos.jpg` | Page À propos |
| `cat-location.jpg` · `cat-boutique.jpg` · `cat-accessoires.jpg` · `cat-decoration.jpg` | 4 cartes univers de l'accueil |
| `insta1.jpg` … `insta6.jpg` | Grille Instagram de l'accueil |
| `deco1.jpg` … `deco3.jpg` | Galerie page Décoration |
| **Produits réels — 3 photos chacune (galerie + miniatures)** | |
| `a1–a3.jpg` · `b1–b3.jpg` · `c1–c3.jpg` · `d1–d3.jpg` · `e1–e3.jpg` | 5 caftans à LOUER (location.html) |
| `f1–f3.jpg` · `h1–h3.jpg` · `i1–i3.jpg` · `j1–j3.jpg` · `o1–o3.jpg` | 5 pièces à VENDRE (boutique.html) |
| `acc1.jpg` … `acc12.jpg` | (En réserve — les accessoires affichent des illustrations en attendant vos photos) |
| `p1.jpg` … `p3.jpg` | Formules décoration |
| `pt1.jpg` … `pt6.jpg` | Packs fêtes — **vos vraies photos** (fiançailles, anniversaire, baby shower, henné, fête, shooting) |

Astuce : exportez en JPG (~1200 px de large), poids idéal < 300 Ko.
Les photos actuelles sont des images de démonstration libres (Wikimedia
Commons / Flickr CC) — remplacez-les par les vôtres dès que possible.

Noms, prix et catégories des 10 vrais produits : modifiables dans
l'admin (`admin/index.html`) sans toucher au code. Pour déplacer un
produit entre Location et Boutique, ou changer ses photos : dites-le,
c'est fait en une ligne dans `js/seed.js`.

> Instagram : les photos ne peuvent pas être récupérées automatiquement
> (compte privé pour les robots). Enregistrez-les depuis votre téléphone,
> renommez-les comme indiqué ci-dessus, c'est tout.

## 🔐 Connexion admin par code email (30 s)

Chaque connexion à `admin/index.html` demande un **code à 6 chiffres** :
cliquez « 📧 Recevoir le code par email », le code est envoyé à
**ahjatzakaria2001@gmail.com**, il est valable **30 secondes** et à
**usage unique**. Expiré ou utilisé, plus rien ne part tant que vous ne
cliquez pas sur « ↻ Renvoyer le code ».

**Activer l'envoi email réel (5 min, gratuit) :**
1. Compte sur [emailjs.com](https://www.emailjs.com) (200 emails/mois gratuits)
2. « Email Services » → connectez Gmail `ahjatzakaria2001@gmail.com`
3. « Email Templates » → créez un template avec les variables `{{passcode}}`, `{{to_email}}`, `{{validity}}`
4. Copiez **Service ID**, **Template ID** et **Public Key** dans `js/config.js` → `EMAILJS`

Tant que les clés sont vides, le mode démo affiche le code directement
sur l'écran de connexion.
