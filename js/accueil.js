/* ==========================================================
   accueil.js - home page only
   Step 4: twinkling stars + custom music controls
   ========================================================== */

document.addEventListener("DOMContentLoaded", function () {
  creerEtoiles(60);
  initialiserLecteur();
});

/* ---------- Stars ---------- */

function creerEtoiles(nombre) {
  const conteneur = document.getElementById("etoiles");

  for (let i = 0; i < nombre; i++) {
    const etoile = document.createElement("span");
    etoile.className = "etoile";

    // Random position, size and animation delay
    etoile.style.left = Math.random() * 100 + "%";
    etoile.style.top = Math.random() * 100 + "%";
    const taille = Math.random() * 2 + 1;
    etoile.style.width = taille + "px";
    etoile.style.height = taille + "px";
    etoile.style.animationDelay = Math.random() * 3 + "s";
    etoile.style.animationDuration = Math.random() * 2 + 1.5 + "s";

    conteneur.appendChild(etoile);
  }
}

/* ---------- Music player ---------- */

function initialiserLecteur() {
  const musique = document.getElementById("musique");
  const btnPlay = document.getElementById("btn-play");
  const btnStop = document.getElementById("btn-stop");
  const btnMute = document.getElementById("btn-mute");
  const progression = document.getElementById("progression");

  // Volume saved in the settings (step 3)
  musique.volume = Number(getPref("volume", 50)) / 100;

  // Play / Pause
  btnPlay.addEventListener("click", function () {
    if (musique.paused) {
      musique.play().catch(function () {
        alert("Impossible de lire la musique. Vérifie le fichier media/vangelis.mp3");
      });
    } else {
      musique.pause();
    }
  });

  // Stop (back to the beginning)
  btnStop.addEventListener("click", function () {
    musique.pause();
    musique.currentTime = 0;
  });

  // Mute / unmute
  btnMute.addEventListener("click", function () {
    musique.muted = !musique.muted;
    btnMute.textContent = musique.muted ? "🔇 Muet" : "🔊 Son";
  });

  // The button text follows the real state of the audio
  musique.addEventListener("play", function () {
    btnPlay.textContent = "⏸ Pause";
  });
  musique.addEventListener("pause", function () {
    btnPlay.textContent = "▶ Play";
  });

  // Progress bar follows the music
  musique.addEventListener("timeupdate", function () {
    if (musique.duration) {
      progression.value = (musique.currentTime / musique.duration) * 100;
    }
  });

  // Dragging the bar moves the music
  progression.addEventListener("input", function () {
    if (musique.duration) {
      musique.currentTime = (progression.value / 100) * musique.duration;
    }
  });
}