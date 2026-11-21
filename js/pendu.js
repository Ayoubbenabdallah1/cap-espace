/* ==========================================================
   pendu.js - Hangman game
   Step 7: random word, virtual keyboard, drawing, score
   Step 8: physical keyboard support
   ========================================================== */

/* ---------- Data ---------- */
const MOTS = [
  "PLANETE", "FUSEE", "ETOILE", "GALAXIE", "COMETE",
  "LUNE", "SOLEIL", "ASTRONAUTE", "SATELLITE", "ORBITE"
];
const MAX_ERREURS = 6;

/* ---------- State ---------- */
let mot = "";               // the word to find
let lettresTrouvees = [];   // correct letters already clicked
let erreurs = 0;            // number of mistakes
let partieFinie = false;
let motPrecedent = "";      // to avoid the same word twice in a row

/* ---------- Helpers ---------- */

function elt(id) {
  return document.getElementById(id);
}

function choisirMot() {
  let nouveau;
  do {
    nouveau = MOTS[Math.floor(Math.random() * MOTS.length)];
  } while (nouveau === motPrecedent);
  motPrecedent = nouveau;
  return nouveau;
}

function toutTrouve() {
  return mot.split("").every(function (lettre) {
    return lettresTrouvees.includes(lettre);
  });
}

/* ---------- Display ---------- */

// Hidden word as dashes. If "reveler" is true, shows the missing letters too.
function afficherMot(reveler) {
  const zone = elt("mot");
  zone.innerHTML = "";

  mot.split("").forEach(function (lettre) {
    const span = document.createElement("span");
    span.className = "lettre";

    if (lettresTrouvees.includes(lettre)) {
      span.textContent = lettre;
    } else if (reveler) {
      span.textContent = lettre;
      span.classList.add("rate"); // missed letter, shown in red
    } else {
      span.textContent = "_";
    }

    zone.appendChild(span);
  });
}

function afficherErreurs() {
  const restantes = MAX_ERREURS - erreurs;
  elt("erreurs-restantes").textContent =
    "Erreurs restantes : " + restantes + " / " + MAX_ERREURS;
}

// Shows as many body parts as there are mistakes
function mettreAJourDessin() {
  document.querySelectorAll("#dessin .partie").forEach(function (partie, i) {
    partie.classList.toggle("visible", i < erreurs);
  });
}

function afficherMessage(texte, type) {
  const message = elt("message-pendu");
  message.textContent = texte;
  message.className = type; // "ok", "ko" or ""
}

/* ---------- Last score (localStorage) ---------- */

function sauvegarderScore(victoire) {
  const score = {
    resultat: victoire ? "gagné" : "perdu",
    erreurs: erreurs,
    mot: mot
  };
  localStorage.setItem("dernierScorePendu", JSON.stringify(score));
  afficherDernierScore();
}

function afficherDernierScore() {
  const zone = elt("dernier-score-pendu");
  const brut = localStorage.getItem("dernierScorePendu");

  if (brut === null) {
    zone.textContent = "";
    return;
  }

  try {
    const score = JSON.parse(brut);
    zone.textContent =
      "Dernier score : " + score.resultat + " (" + score.erreurs + " erreur(s)) — mot : " + score.mot;
  } catch (e) {
    zone.textContent = "";
  }
}

/* ---------- Virtual keyboard ---------- */

function creerClavier() {
  const clavier = elt("clavier");
  clavier.innerHTML = "";

  for (let code = 65; code <= 90; code++) { // 65 = "A", 90 = "Z"
    const lettre = String.fromCharCode(code);

    const bouton = document.createElement("button");
    bouton.type = "button";
    bouton.className = "touche";
    bouton.textContent = lettre;
    bouton.addEventListener("click", function () {
      cliquerLettre(lettre, bouton);
    });

    clavier.appendChild(bouton);
  }
}

/* ---------- Click on a letter ---------- */

function cliquerLettre(lettre, bouton) {
  if (partieFinie) {
    return;
  }

  bouton.disabled = true; // the clicked button is disabled

  if (mot.includes(lettre)) {
    // Correct letter
    lettresTrouvees.push(lettre);
    bouton.classList.add("juste");
    afficherMot(false);

    if (toutTrouve()) {
      finir(true);
    }
  } else {
    // Mistake
    erreurs++;
    bouton.classList.add("faux");
    mettreAJourDessin();
    afficherErreurs();

    if (erreurs >= MAX_ERREURS) {
      finir(false);
    }
  }
}

/* ---------- End of the game ---------- */

function finir(victoire) {
  partieFinie = true;

  // Lock the whole keyboard
  document.querySelectorAll(".touche").forEach(function (b) {
    b.disabled = true;
  });

  if (victoire) {
    const profil = getProfil();
    const pseudo = profil !== null ? profil.pseudo : "astronaute";
    afficherMessage("Bravo " + pseudo + " !", "ok");
  } else {
    afficherMot(true);
    afficherMessage("Perdu ! Le mot était : " + mot, "ko");
  }

  sauvegarderScore(victoire);
}

/* ---------- New game ---------- */

function rejouer() {
  mot = choisirMot();
  lettresTrouvees = [];
  erreurs = 0;
  partieFinie = false;

  creerClavier();
  afficherMot(false);
  afficherErreurs();
  mettreAJourDessin();
  afficherMessage("", "");
  afficherDernierScore();
}

/* ---------- Start-up ---------- */

document.addEventListener("DOMContentLoaded", function () {
  elt("btn-rejouer-pendu").addEventListener("click", rejouer);
  rejouer();
   document.addEventListener("profilchange", afficherDernierScore);

  // The physical keyboard also works (A to Z)
  document.addEventListener("keydown", function (e) {
    // Ignore when typing in a form field (the profile form) or using shortcuts
    if (e.target.tagName === "INPUT" || e.ctrlKey || e.altKey || e.metaKey) {
      return;
    }

    const lettre = e.key.toUpperCase();
    if (!/^[A-Z]$/.test(lettre)) {
      return;
    }

    const touches = Array.from(document.querySelectorAll(".touche"));
    const bouton = touches.find(function (b) {
      return b.textContent === lettre;
    });

    if (bouton !== undefined && !bouton.disabled) {
      bouton.click();
    }
  });
});