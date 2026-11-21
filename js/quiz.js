/* ==========================================================
   quiz.js - "Mission Astronaute"
   Step 6: quiz + score in sessionStorage
   ========================================================== */

/* ---------- Questions ---------- */
const QUESTIONS = [
  {
    question: "Quelle est la plus grosse planète du système solaire ?",
    options: ["Saturne", "Jupiter", "Neptune", "La Terre"],
    bonne: 1,
    explication: "Jupiter est une planète géante gazeuse : elle pourrait contenir plus de 1 000 Terres."
  },
  {
    question: "Quelle planète est la plus proche du Soleil ?",
    options: ["Vénus", "Mars", "Mercure", "La Terre"],
    bonne: 2,
    explication: "Mercure est la planète la plus proche du Soleil, et aussi la plus petite."
  },
  {
    question: "Combien de planètes compte le système solaire ?",
    options: ["7", "8", "9", "10"],
    bonne: 1,
    explication: "Il y en a 8 : Mercure, Vénus, la Terre, Mars, Jupiter, Saturne, Uranus et Neptune."
  },
  {
    question: "Sur la Lune, la gravité est environ ... celle de la Terre.",
    options: ["Le double de", "La même que", "La moitié de", "Six fois plus faible que"],
    bonne: 3,
    explication: "La gravité lunaire vaut environ 1/6 de la gravité terrestre : on y pèse six fois moins."
  },
  {
    question: "Pourquoi les astronautes flottent-ils dans la Station spatiale internationale ?",
    options: [
      "Il n'y a plus du tout de gravité là-haut",
      "Ils sont en chute libre permanente autour de la Terre",
      "L'air de la station les soulève",
      "Des moteurs les maintiennent en l'air"
    ],
    bonne: 1,
    explication: "À l'altitude de l'ISS, la gravité existe encore. Mais la station et ses astronautes tombent en permanence autour de la Terre, d'où l'impression d'apesanteur."
  },
  {
    question: "Qui a été le premier humain à marcher sur la Lune, en 1969 ?",
    options: ["Youri Gagarine", "Buzz Aldrin", "Neil Armstrong", "John Glenn"],
    bonne: 2,
    explication: "Neil Armstrong a posé le pied sur la Lune le 21 juillet 1969, pendant la mission Apollo 11."
  },
  {
    question: "Quel a été le premier satellite artificiel envoyé dans l'espace, en 1957 ?",
    options: ["Spoutnik 1", "Apollo 1", "Hubble", "Voyager 1"],
    bonne: 0,
    explication: "Spoutnik 1, lancé par l'URSS en 1957, a marqué le début de l'ère spatiale."
  },
  {
    question: "Quelle agence spatiale a envoyé le rover Perseverance sur Mars ?",
    options: ["L'ESA", "La NASA", "Roscosmos", "La JAXA"],
    bonne: 1,
    explication: "Perseverance est un rover de la NASA, posé sur Mars en 2021 pour chercher des traces de vie ancienne."
  }
];

/* ---------- State ---------- */
let ordre = [];        // shuffled questions
let indexCourant = 0;  // current question
let bonnes = 0;        // number of correct answers

/* ---------- Helpers ---------- */

function melanger(tableau) {
  const copie = tableau.slice();
  for (let i = copie.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    const temp = copie[i];
    copie[i] = copie[j];
    copie[j] = temp;
  }
  return copie;
}

function elt(id) {
  return document.getElementById(id);
}

/* ---------- Previous score (sessionStorage) ---------- */

function afficherDernierScore() {
  const score = sessionStorage.getItem("scoreQuiz");
  if (score === null) {
    elt("dernier-score").textContent = "";
  } else {
    elt("dernier-score").textContent = "Dernier score de cette session : " + score + "%";
  }
}

/* ---------- Start / restart ---------- */

function demarrer() {
  ordre = melanger(QUESTIONS);
  indexCourant = 0;
  bonnes = 0;

  elt("ecran-resultat").classList.add("cache");
  elt("ecran-question").classList.remove("cache");

  afficherDernierScore();
  afficherQuestion();
}

/* ---------- Show a question ---------- */

function afficherQuestion() {
  const q = ordre[indexCourant];

  elt("compteur").textContent = "Question " + (indexCourant + 1) + " / " + ordre.length;
  elt("barre").style.width = (indexCourant / ordre.length) * 100 + "%";
  elt("question").textContent = q.question;
  elt("explication").textContent = "";
  elt("explication").className = "";
  elt("btn-suivant").classList.add("cache");

  // Shuffle the options but remember which one is correct
  const options = q.options.map(function (texte, i) {
    return { texte: texte, correcte: i === q.bonne };
  });

  const zone = elt("options");
  zone.innerHTML = "";

  melanger(options).forEach(function (opt) {
    const bouton = document.createElement("button");
    bouton.type = "button";
    bouton.className = "option";
    bouton.textContent = opt.texte;
    bouton.dataset.correcte = opt.correcte;
    bouton.addEventListener("click", function () {
      repondre(bouton, opt.correcte, q);
    });
    zone.appendChild(bouton);
  });
}

/* ---------- Answer ---------- */

function repondre(bouton, estCorrecte, q) {
  // Lock all the buttons and show the right answer
  document.querySelectorAll(".option").forEach(function (b) {
    b.disabled = true;
    if (b.dataset.correcte === "true") {
      b.classList.add("juste");
    }
  });

  const explication = elt("explication");

  if (estCorrecte) {
    bonnes++;
    explication.textContent = "✅ Exact ! " + q.explication;
    explication.className = "ok";
  } else {
    bouton.classList.add("faux");
    explication.textContent = "❌ Raté. " + q.explication;
    explication.className = "ko";
  }

  // Score saved after every answer
  sessionStorage.setItem("bonnesReponses", bonnes);

  const suivant = elt("btn-suivant");
  suivant.textContent = indexCourant === ordre.length - 1 ? "Voir mon résultat ➜" : "Question suivante ➜";
  suivant.classList.remove("cache");
}

/* ---------- Next question ---------- */

function suivante() {
  indexCourant++;
  if (indexCourant < ordre.length) {
    afficherQuestion();
  } else {
    afficherResultat();
  }
}

/* ---------- Final result ---------- */

function afficherResultat() {
  const pourcent = Math.round((bonnes / ordre.length) * 100);

  // Score in sessionStorage
  sessionStorage.setItem("scoreQuiz", pourcent);
  sessionStorage.setItem("bonnesReponses", bonnes);

  const profil = getProfil();
  const pseudo = profil !== null ? profil.pseudo : "astronaute";

  elt("ecran-question").classList.add("cache");
  elt("ecran-resultat").classList.remove("cache");

  elt("message-final").textContent = "Bravo " + pseudo + ", tu as réussi " + pourcent + "% de ta mission !";

  let commentaire;
  if (pourcent >= 75) {
    commentaire = "🚀 Mission accomplie : tu es prêt pour le décollage !";
  } else if (pourcent >= 50) {
    commentaire = "🛰️ Pas mal ! Encore un peu d'entraînement et tu seras un vrai astronaute.";
  } else {
    commentaire = "🌑 Il te faut plus d'entraînement : relance la mission pour t'améliorer.";
  }

  elt("detail-final").textContent =
    bonnes + " bonne(s) réponse(s) sur " + ordre.length + ". " + commentaire;
}

/* ---------- Start-up ---------- */

document.addEventListener("DOMContentLoaded", function () {
  elt("btn-suivant").addEventListener("click", suivante);
  elt("btn-recommencer").addEventListener("click", demarrer);
   document.addEventListener("profilchange", afficherDernierScore);
  demarrer();
});