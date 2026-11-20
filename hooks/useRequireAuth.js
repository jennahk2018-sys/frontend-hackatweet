import { useEffect } from "react";
import { useRouter } from "next/router";
import { useSelector } from "react-redux";

// Protège une page : si l'utilisateur n'est pas connecté (pas de token),
// on le renvoie vers la page de connexion.
// Renvoie true si l'utilisateur est connecté, false sinon.
function useRequireAuth() {
  const router = useRouter();
  const token = useSelector((state) => state.user.value.token);

  useEffect(() => {
    if (!token) {
      // replace (et pas push) : le bouton "retour" ne ramène pas sur la page protégée
      router.replace("/");
    }
  }, [token]);

  return Boolean(token);
}

export default useRequireAuth;
