/* ==========================================================
   common.js - shared on all pages
   Step 2: profile (nom, prénom, pseudo, âge) in localStorage
   Step 3: preferences (theme, brightness, volume, position)
   Step A: header / navigation built once for all pages
   Step B: account change (profile form asked at every load)
   ========================================================== */

/* ==========================================================
   SETTING: how often the profile form is shown
   "chaque-chargement" : at every page load
   "chaque-visite"     : once each time the site is opened in a tab
   "premiere-fois"     : only when no profile is saved
   ========================================================== */
const MODE_DEMANDE = "premiere-fois";

/* ==========================================================
   HELPERS
   ========================================================== */

// Escapes text before putting it in innerHTML (protects against injected HTML)
function echapper(texte) {
  return String(texte)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

/* ==========================================================
   HEADER / NAVIGATION (one single menu for all pages)
   ========================================================== */

const PAGES = [
  { fichier: "index.html",    titre: "Accueil" },
  { fichier: "dragdrop.html", titre: "Classe le ciel" },
  { fichier: "quiz.html",     titre: "Mission Astronaute" },
  { fichier: "pendu.html",    titre: "Pendu" }
];

function construireEntete() {
  const entete = document.getElementById("entete");
  if (entete === null) {
    return;
  }

  // Current page, to mark its link as active
  let courant = location.pathname.split("/").pop();
  if (courant === "") {
    courant = "index.html";
  }

  const liens = PAGES.map(function (page) {
    const actif = page.fichier === courant ? ' class="actif" aria-current="page"' : "";
    return '<a href="' + page.fichier + '"' + actif + ">" + page.titre + "</a>";
  }).join("");

  entete.innerHTML = `
    <a class="logo" href="index.html">
      <span class="logo-icone">🚀</span>
      <span class="logo-texte">Cap sur l'Espace</span>
    </a>

    <nav class="menu-principal" id="menu-principal" aria-label="Navigation principale">
      ${liens}
    </nav>

    <div class="actions-entete">
      <span class="chip-profil cache" id="chip-profil"></span>
      <button type="button" class="btn-icone" id="btn-reglages" aria-label="Réglages" aria-expanded="false">⚙️</button>
      <button type="button" class="btn-icone burger" id="btn-burger" aria-label="Menu" aria-expanded="false">☰</button>
    </div>
  `;

  // Hamburger menu (phones)
  document.getElementById("btn-burger").addEventListener("click", function () {
    const menu = document.getElementById("menu-principal");
    const ouvert = menu.classList.toggle("ouvert");
    this.setAttribute("aria-expanded", ouvert);
    this.textContent = ouvert ? "✕" : "☰";
  });
}

// Profile chip in the header: avatar with the first letter + pseudo
function afficherChipProfil() {
  const chip = document.getElementById("chip-profil");
  if (chip === null) {
    return;
  }

  const profil = getProfil();
  if (profil === null) {
    chip.classList.add("cache");
    return;
  }

  const avatar = document.createElement("span");
  avatar.className = "avatar";
  avatar.textContent = profil.pseudo.charAt(0).toUpperCase();

  const nom = document.createElement("span");
  nom.className = "chip-nom";
  nom.textContent = profil.pseudo;

  chip.innerHTML = "";
  chip.appendChild(avatar);
  chip.appendChild(nom);
  chip.classList.remove("cache");
}

/* ==========================================================
   PROFILE
   ========================================================== */

/* ---------- Storage keys ---------- */
const CLES_PROFIL = ["pseudo", "nom", "prenom", "age"];

/* ---------- Helper functions ---------- */

// Returns the profile object, or null if it is not complete
function getProfil() {
  const profil = {};
  for (const cle of CLES_PROFIL) {
    const valeur = localStorage.getItem(cle);
    if (valeur === null || valeur === "") {
      return null;
    }
    profil[cle] = valeur;
  }
  return profil;
}

// Saves the profile in localStorage
function saveProfil(profil) {
  for (const cle of CLES_PROFIL) {
    localStorage.setItem(cle, profil[cle]);
  }
}

// Checks that the text is a positive integer (e.g. "20", not "20.5" or "abc")
function estEntier(texte) {
  return /^\d+$/.test(texte);
}

// Scores belong to an account: cleared when another account is used
function reinitialiserScores() {
  localStorage.removeItem("dernierScorePendu");
  sessionStorage.removeItem("scoreQuiz");
  sessionStorage.removeItem("bonnesReponses");
}

// Decides if the form must be shown on this page load
function doitDemanderProfil() {
  if (getProfil() === null) {
    return true; // no account yet
  }
  if (MODE_DEMANDE === "chaque-chargement") {
    return true;
  }
  if (MODE_DEMANDE === "chaque-visite") {
    return sessionStorage.getItem("profilConfirme") !== "oui";
  }
  return false; // "premiere-fois"
}

/* ---------- The form ---------- */

function creerFormulaireProfil() {
  if (document.getElementById("overlay-profil") !== null) {
    return; // already open
  }

  const actuel = getProfil(); // null on the very first visit
  const val = actuel !== null ? actuel : { nom: "", prenom: "", pseudo: "", age: "" };

  const titre = actuel !== null ? "👨‍🚀 Qui est aux commandes ?" : "🚀 Bienvenue, astronaute !";
  const texte = actuel !== null
    ? "Confirme ton compte ou connecte-toi avec un autre."
    : "Présente-toi avant de commencer le voyage.";

  const boutonGarder = actuel !== null
    ? '<button type="button" id="btn-garder" class="btn btn-secondaire">Continuer en tant que ' + echapper(actuel.pseudo) + "</button>"
    : "";

  // Dark background that covers the page
  const overlay = document.createElement("div");
  overlay.id = "overlay-profil";

  overlay.innerHTML = `
    <div class="modal card">
      <h2>${titre}</h2>
      <p>${texte}</p>

      <label for="f-nom">Nom</label>
      <input type="text" id="f-nom" placeholder="Ex : Ben Ali" value="${echapper(val.nom)}">

      <label for="f-prenom">Prénom</label>
      <input type="text" id="f-prenom" placeholder="Ex : Sami" value="${echapper(val.prenom)}">

      <label for="f-pseudo">Pseudo</label>
      <input type="text" id="f-pseudo" placeholder="Ex : StarSami" value="${echapper(val.pseudo)}">

      <label for="f-age">Âge</label>
      <input type="text" id="f-age" placeholder="Ex : 20" value="${echapper(val.age)}">

      <p id="erreur-profil" class="erreur"></p>

      <div class="actions-modal">
        <button type="button" id="btn-valider" class="btn">Valider</button>
        ${boutonGarder}
      </div>
    </div>
  `;

  document.body.appendChild(overlay);
  window.scrollTo(0, 0); // the form is always visible at the top

  document.getElementById("btn-valider").addEventListener("click", validerFormulaire);
  if (actuel !== null) {
    document.getElementById("btn-garder").addEventListener("click", garderCompte);
  }

  // Enter key validates
  overlay.querySelectorAll("input").forEach(function (champ) {
    champ.addEventListener("keydown", function (e) {
      if (e.key === "Enter") {
        validerFormulaire();
      }
    });
  });

  document.getElementById("f-nom").focus();
}

// "Continuer en tant que ..." : keeps the saved account
function garderCompte() {
  sessionStorage.setItem("profilConfirme", "oui");
  document.getElementById("overlay-profil").remove();
}

function validerFormulaire() {
  const nom = document.getElementById("f-nom").value.trim();
  const prenom = document.getElementById("f-prenom").value.trim();
  const pseudo = document.getElementById("f-pseudo").value.trim();
  const age = document.getElementById("f-age").value.trim();
  const erreur = document.getElementById("erreur-profil");

  // Validation
  if (nom === "" || prenom === "" || pseudo === "") {
    erreur.textContent = "Tous les champs sont obligatoires.";
    return;
  }
  if (!estEntier(age)) {
    erreur.textContent = "L'âge doit être un nombre entier (ex : 20).";
    return;
  }
  if (Number(age) < 1 || Number(age) > 120) {
    erreur.textContent = "L'âge doit être compris entre 1 et 120.";
    return;
  }

  // Another pseudo means another account: the previous scores are cleared
  const ancien = getProfil();
  if (ancien !== null && ancien.pseudo.toLowerCase() !== pseudo.toLowerCase()) {
    reinitialiserScores();
  }

  // Save and close
  saveProfil({ nom: nom, prenom: prenom, pseudo: pseudo, age: age });
  sessionStorage.setItem("profilConfirme", "oui");
  document.getElementById("overlay-profil").remove();

  afficherProfil();
  afficherChipProfil();

  // Lets the pages refresh what depends on the account (last scores)
  document.dispatchEvent(new CustomEvent("profilchange"));
}

/* ---------- Display the profile (home page) ---------- */

function afficherProfil() {
  const zone = document.getElementById("profil");
  if (zone === null) {
    return; // this page has no #profil section
  }

  const profil = getProfil();
  if (profil === null) {
    return;
  }

  zone.innerHTML = `
    <h2>Bienvenue, ${echapper(profil.pseudo)} !</h2>
    <p><strong>Nom :</strong> ${echapper(profil.nom)}</p>
    <p><strong>Prénom :</strong> ${echapper(profil.prenom)}</p>
    <p><strong>Pseudo :</strong> ${echapper(profil.pseudo)}</p>
    <p><strong>Âge :</strong> ${echapper(profil.age)} ans</p>
  `;
}

/* ==========================================================
   PREFERENCES
   ========================================================== */

// Reads a preference, or returns a default value if it does not exist
function getPref(cle, defaut) {
  const valeur = localStorage.getItem(cle);
  return valeur === null ? defaut : valeur;
}

/* ---------- Theme (dark / light) ---------- */

function appliquerTheme(theme) {
  document.documentElement.setAttribute("data-theme", theme);
  localStorage.setItem("theme", theme);

  const bouton = document.getElementById("btn-theme");
  if (bouton !== null) {
    bouton.textContent = theme === "dark" ? "☀️ Passer en mode clair" : "🌙 Passer en mode sombre";
  }
}

function basculerTheme() {
  const actuel = getPref("theme", "dark");
  appliquerTheme(actuel === "dark" ? "light" : "dark");
}

/* ---------- Brightness (50 to 120 %) ---------- */

function appliquerLuminosite(pourcent) {
  document.documentElement.style.setProperty("--brightness", pourcent / 100);
  localStorage.setItem("luminosite", pourcent);

  const texte = document.getElementById("val-luminosite");
  if (texte !== null) {
    texte.textContent = pourcent + "%";
  }
}

/* ---------- Volume (0 to 100 %) ---------- */

function appliquerVolume(pourcent) {
  localStorage.setItem("volume", pourcent);

  // Applies to every <audio> on the page
  document.querySelectorAll("audio").forEach(function (audio) {
    audio.volume = pourcent / 100;
  });

  const texte = document.getElementById("val-volume");
  if (texte !== null) {
    texte.textContent = pourcent + "%";
  }
}

/* ---------- Geolocation ---------- */

function afficherPosition() {
  const info = document.getElementById("info-position");
  if (info === null) {
    return;
  }

  const brut = localStorage.getItem("position");
  if (brut === null) {
    info.textContent = "Position non partagée.";
    return;
  }

  const pos = JSON.parse(brut);
  info.textContent = "Lat : " + pos.latitude + " / Long : " + pos.longitude;
}

function demanderPosition() {
  const info = document.getElementById("info-position");

  if (!("geolocation" in navigator)) {
    info.textContent = "Géolocalisation non supportée par ce navigateur.";
    return;
  }

  info.textContent = "Recherche de la position...";

  navigator.geolocation.getCurrentPosition(
    function (position) {
      const coords = {
        latitude: position.coords.latitude.toFixed(4),
        longitude: position.coords.longitude.toFixed(4)
      };
      localStorage.setItem("position", JSON.stringify(coords));
      afficherPosition();
    },
    function () {
      info.textContent = "Position refusée ou indisponible.";
    }
  );
}

/* ---------- Settings panel (drops down from the header) ---------- */

function creerPanneauReglages() {
  const entete = document.getElementById("entete");
  const bouton = document.getElementById("btn-reglages");
  if (entete === null || bouton === null) {
    return;
  }

  // Panel (hidden by default), placed inside the header
  const panneau = document.createElement("div");
  panneau.id = "panneau-reglages";
  panneau.className = "card cache";
  panneau.innerHTML = `
    <h3>Réglages</h3>

    <button type="button" id="btn-theme" class="btn"></button>

    <label for="range-luminosite">Luminosité : <span id="val-luminosite"></span></label>
    <input type="range" id="range-luminosite" min="50" max="120" step="5">

    <label for="range-volume">Volume : <span id="val-volume"></span></label>
    <input type="range" id="range-volume" min="0" max="100" step="5">

    <button type="button" id="btn-position" class="btn">📍 Partager ma position</button>
    <p id="info-position"></p>

    <button type="button" id="btn-compte" class="btn btn-secondaire">🔄 Changer de compte</button>
  `;
  entete.appendChild(panneau);

  // Open / close
  function definirOuvert(ouvert) {
    panneau.classList.toggle("cache", !ouvert);
    bouton.setAttribute("aria-expanded", ouvert);
  }

  bouton.addEventListener("click", function () {
    definirOuvert(panneau.classList.contains("cache"));
  });

  // Click outside the panel closes it
  document.addEventListener("click", function (e) {
    const ferme = panneau.classList.contains("cache");
    if (!ferme && !panneau.contains(e.target) && !bouton.contains(e.target)) {
      definirOuvert(false);
    }
  });

  // Escape closes it too
  document.addEventListener("keydown", function (e) {
    if (e.key === "Escape") {
      definirOuvert(false);
    }
  });

  // Controls
  document.getElementById("btn-theme").addEventListener("click", basculerTheme);
  document.getElementById("range-luminosite").addEventListener("input", function () {
    appliquerLuminosite(Number(this.value));
  });
  document.getElementById("range-volume").addEventListener("input", function () {
    appliquerVolume(Number(this.value));
  });
  document.getElementById("btn-position").addEventListener("click", demanderPosition);

  // Change account: opens the profile form
  document.getElementById("btn-compte").addEventListener("click", function () {
    definirOuvert(false);
    creerFormulaireProfil();
  });
}

// Restores saved preferences (or default values)
function restaurerPreferences() {
  const luminosite = Number(getPref("luminosite", 100));
  const volume = Number(getPref("volume", 50));

  appliquerTheme(getPref("theme", "dark"));
  appliquerLuminosite(luminosite);
  appliquerVolume(volume);
  afficherPosition();

  // Puts the sliders at the saved values
  document.getElementById("range-luminosite").value = luminosite;
  document.getElementById("range-volume").value = volume;
}

/* ==========================================================
   START-UP (runs once the page is loaded)
   ========================================================== */

document.addEventListener("DOMContentLoaded", function () {
  construireEntete();
  creerPanneauReglages();
  restaurerPreferences();

  // Shows the saved account (if any) behind the form
  afficherProfil();
  afficherChipProfil();

  if (doitDemanderProfil()) {
    creerFormulaireProfil();
  }
});