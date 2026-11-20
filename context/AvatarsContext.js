// =====================================
// CONTEXTE DES AVATARS
//
// Un "Context" React permet de partager une donnée avec TOUS les composants,
// sans la passer en props de parent en enfant (Login -> SignUp -> AvatarPicker...).
//
// Fonctionnement :
// 1. Chaque page lit le dossier avec getStaticProps et reçoit "avatars" en props
// 2. _app.js met cette liste dans le Provider (le "émetteur")
// 3. N'importe quel composant la récupère avec useAvatars()

import { createContext, useContext } from "react";

// Valeur par défaut : une liste vide (si une page n'a pas fourni d'avatars)
const AvatarsContext = createContext([]);

// Hook pratique : const avatars = useAvatars();
export function useAvatars() {
  return useContext(AvatarsContext);
}

export default AvatarsContext;
