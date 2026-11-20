// =====================================
// LECTURE AUTOMATIQUE DU DOSSIER public/avatar
//
// ⚠️ Ce fichier utilise "fs" (le système de fichiers de Node.js).
// Il ne fonctionne QUE côté serveur : on l'appelle uniquement dans
// getStaticProps (voir pages/index.js, pages/home.js, pages/hashtag/[tag].js).
// Next.js retire automatiquement ce code du JavaScript envoyé au navigateur.

import fs from "fs";
import path from "path";

// Même règle que le backend (modules/checkAvatar.js) :
// minuscules, chiffres et tirets, puis une extension d'image.
// Un fichier qui ne respecte pas ce format serait refusé par le backend,
// donc on ne le propose même pas.
const VALID_FILENAME = /^[a-z0-9-]+\.(webp|png|jpe?g)$/;

// Transforme un nom de fichier en texte lisible
// "avatar-new-york.webp" -> "New york"
function toLabel(filename) {
  const name = filename
    .replace(/^avatar-/, "") // enlève le préfixe "avatar-"
    .replace(/\.\w+$/, "") // enlève l'extension (.webp, .png...)
    .replace(/-/g, " "); // remplace les tirets par des espaces

  // Première lettre en majuscule
  return name.charAt(0).toUpperCase() + name.slice(1);
}

export function getAvatars() {
  // process.cwd() = la racine du projet frontend
  const folder = path.join(process.cwd(), "public", "avatar");

  // Si le dossier n'existe pas, on renvoie une liste vide au lieu de planter
  if (!fs.existsSync(folder)) {
    return [];
  }

  return fs
    .readdirSync(folder) // liste tous les fichiers du dossier
    .filter((file) => VALID_FILENAME.test(file)) // garde seulement les images valides (ignore .DS_Store, etc.)
    .sort() // ordre alphabétique, pour que la liste soit toujours la même
    .map((file) => ({
      src: `/avatar/${file}`, // l'adresse de l'image sur le site
      label: toLabel(file), // le nom affiché sous l'avatar
    }));
}
