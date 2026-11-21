/* ==========================================================
   dragdrop.js - "Classe le ciel"
   Step 5: HTML5 Drag and Drop
   ========================================================== */

/* ---------- Data: the 6 objects ---------- */
const OBJETS = [
  {
    id: "mars", nom: "Mars", zone: "systeme", src: "media/mars.jpg",
    ok: "Bravo ! Mars est une planète rocheuse de notre système solaire.",
    ko: "Non, Mars est une planète de notre système solaire, pas un objet lointain !"
  },
  {
    id: "jupiter", nom: "Jupiter", zone: "systeme", src: "media/jupiter.jpg",
    ok: "Bravo ! Jupiter est la plus grosse planète du système solaire.",
    ko: "Non, Jupiter est la plus grosse planète de notre système solaire, elle n'est pas au-delà !"
  },
  {
    id: "saturne", nom: "Saturne", zone: "systeme", src: "media/saturne.jpg",
    ok: "Bravo ! Saturne, la planète aux anneaux, fait bien partie du système solaire.",
    ko: "Non, Saturne est une planète de notre système solaire, pas un objet lointain !"
  },
  {
    id: "sirius", nom: "Sirius", zone: "audela", src: "media/sirius.jpg",
    ok: "Bravo ! Sirius est une étoile lointaine, bien au-delà du système solaire.",
    ko: "Non, Sirius est une étoile lointaine, pas une planète !"
  },
  {
    id: "betelgeuse", nom: "Bételgeuse", zone: "audela", src: "media/betelgeuse.jpg",
    ok: "Bravo ! Bételgeuse est une supergéante rouge située très loin de nous.",
    ko: "Non, Bételgeuse est une étoile géante très lointaine, pas une planète !"
  },
  {
    id: "andromede", nom: "Andromède", zone: "audela", src: "media/andromede.jpg",
    ok: "Bravo ! Andromède est une galaxie située à des millions d'années-lumière.",
    ko: "Non, Andromède est une galaxie lointaine, pas un astre de notre système solaire !"
  }
];

/* ---------- State ---------- */
let reussis = 0;
let erreurs = 0;

/* ---------- Helpers ---------- */

// Shuffles an array (Fisher-Yates)
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

function afficherMessage(texte, type) {
  const message = document.getElementById("message");
  message.textContent = texte;
  message.className = type; // "ok" or "ko"
}

function afficherScore() {
  document.getElementById("score").textContent =
    "Réussis : " + reussis + " / " + OBJETS.length + " — Erreurs : " + erreurs;
}

/* ---------- Create the draggable images ---------- */

function creerImages() {
  const bac = document.getElementById("bac-images");
  bac.innerHTML = "";

  melanger(OBJETS).forEach(function (obj) {
    const figure = document.createElement("figure");
    figure.className = "objet";
    figure.id = obj.id;
    figure.draggable = true;

    const img = document.createElement("img");
    img.src = obj.src;
    img.alt = obj.nom;
    img.draggable = false; // the whole <figure> is dragged, not the <img>

    const legende = document.createElement("figcaption");
    legende.textContent = obj.nom;

    figure.appendChild(img);
    figure.appendChild(legende);
    bac.appendChild(figure);

    // Start of the drag: remember which object is moved
    figure.addEventListener("dragstart", function (e) {
      e.dataTransfer.setData("text/plain", obj.id);
      figure.classList.add("deplace");
    });

    figure.addEventListener("dragend", function () {
      figure.classList.remove("deplace");
    });
  });
}

/* ---------- Containers: where the images are dropped ---------- */

function initialiserConteneurs() {
  document.querySelectorAll(".conteneur").forEach(function (conteneur) {

    // Without preventDefault(), the drop is not allowed
    conteneur.addEventListener("dragover", function (e) {
      e.preventDefault();
      conteneur.classList.add("survol");
    });

    conteneur.addEventListener("dragleave", function () {
      conteneur.classList.remove("survol");
    });

    conteneur.addEventListener("drop", function (e) {
      e.preventDefault();
      conteneur.classList.remove("survol");

      const id = e.dataTransfer.getData("text/plain");
      const figure = document.getElementById(id);
      const obj = OBJETS.find(function (o) { return o.id === id; });

      // Ignore if it is not one of our images or is already placed
      if (figure === null || obj === undefined || figure.draggable === false) {
        return;
      }

      if (conteneur.dataset.zone === obj.zone) {
        // Correct answer
        conteneur.querySelector(".contenu").appendChild(figure);
        figure.draggable = false;
        figure.classList.add("place");
        reussis++;
        afficherMessage(obj.ok, "ok");

        if (reussis === OBJETS.length) {
          terminer();
        }
      } else {
        // Wrong answer: the image stays in place
        erreurs++;
        afficherMessage(obj.ko, "ko");
      }

      afficherScore();
    });
  });
}

/* ---------- End of the game ---------- */

function terminer() {
  const profil = getProfil();
  const pseudo = profil !== null ? profil.pseudo : "astronaute";

  if (erreurs === 0) {
    afficherMessage("🎉 Bravo " + pseudo + " ! Tout est bien classé, sans aucune erreur !", "ok");
  } else {
    afficherMessage("🎉 Bravo " + pseudo + " ! Tout est classé, avec " + erreurs + " erreur(s).", "ok");
  }
}

/* ---------- Restart ---------- */

function recommencer() {
  reussis = 0;
  erreurs = 0;

  document.querySelectorAll(".contenu").forEach(function (zone) {
    zone.innerHTML = "";
  });

  creerImages();
  afficherMessage("", "");
  afficherScore();
}

/* ---------- Start-up ---------- */

document.addEventListener("DOMContentLoaded", function () {
  initialiserConteneurs();
  document.getElementById("btn-rejouer").addEventListener("click", recommencer);
  recommencer();
});