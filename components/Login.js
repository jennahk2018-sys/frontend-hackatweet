
import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import { useSelector } from "react-redux";
import styles from "../styles/Login.module.css";
import Image from "next/image";
import logo from "../public/logo-twitter-blanc-png.png";
import { Modal, Button } from "antd";
import SignUp from "./SignUp";
import SignIn from "./SignIn";
import ParticleLogo from "./ParticleLogo";

const TITLE = "See what's happening";
const TYPING_SPEED = 80; // millisecondes entre chaque lettre

function Login() {
  // Effet machine à écrire : nombre de lettres déjà affichées
  const [typedLength, setTypedLength] = useState(0);

  const [isModalSignInVisible, setIsModalSignInVisible] = useState(false);
  const [isModalSignUpVisible, setIsModalSignUpVisible] = useState(false);

  const router = useRouter();
  const token = useSelector((state) => state.user.value.token);

  // Déjà connecté en arrivant sur la page : on va directement sur /home
  // (seulement au chargement : après un login, SignIn/SignUp redirigent déjà)
  useEffect(() => {
    if (token) {
      router.replace("/home");
    }
  }, []);

  // Ajoute une lettre au titre à intervalle régulier
  useEffect(() => {
    // Si l'utilisateur a désactivé les animations dans son système, on affiche tout direct
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      setTypedLength(TITLE.length);
      return;
    }

    const interval = setInterval(() => {
      setTypedLength((length) => {
        if (length >= TITLE.length) {
          clearInterval(interval);
          return length;
        }
        return length + 1;
      });
    }, TYPING_SPEED);

    return () => clearInterval(interval);
  }, []);

  return (
    <div>
      <main className={styles.main}>
        {/* COLONNE GAUCHE */}
        <div className={styles.imageContent}>
          <div className={styles.logo}>
            <ParticleLogo src="/logo-twitter-blanc-png.png" alt="Logo Hackatweet" />
          </div>
        </div>

        {/* COLONNE DROITE */}
        <div className={styles.connexionContent}>
          <div className={styles.smallLogo}>
            <Image
              src={logo}
              alt="Logo Twitter"
              layout="fill"
              objectFit="contain"
            />
          </div>

          <h1 className={styles.title} aria-label={TITLE}>
            {/* Texte complet invisible : réserve la place pour que la page ne bouge pas */}
            <span className={styles.titleGhost} aria-hidden="true">
              {TITLE}
            </span>

            {/* Texte qui s'écrit, posé par-dessus, avec le curseur */}
            <span className={styles.titleTyped} aria-hidden="true">
              {TITLE.slice(0, typedLength)}
              <span className={styles.cursor} />
            </span>
          </h1>

          <h2 className={styles.subtitle}>
            Join Hackatweet today.
          </h2>

          {/* BOUTON INSCRIPTION */}
          <Button
            type="primary"
            className={styles.buttonDark}
            onClick={() => setIsModalSignUpVisible(true)}
          >
            Sign up
          </Button>

          <div className={styles.text}>
            Already have an account?
          </div>

          {/* BOUTON CONNEXION */}
          <Button
            className={styles.buttonLight}
            onClick={() => setIsModalSignInVisible(true)}
          >
            Sign in
          </Button>
        </div>
      </main>

      {/* MODAL INSCRIPTION */}
      <Modal
        open={isModalSignUpVisible}
        onCancel={() => setIsModalSignUpVisible(false)}
        footer={null}
        centered
        className={styles.modal}
      >
        <SignUp onClose={() => setIsModalSignUpVisible(false)} />
      </Modal>

      {/* MODAL CONNEXION */}
      <Modal
        open={isModalSignInVisible}
        onCancel={() => setIsModalSignInVisible(false)}
        footer={null}
        centered
        className={styles.modal}
      >
        <SignIn onClose={() => setIsModalSignInVisible(false)} />
      </Modal>
    </div>
  );
}

export default Login;

