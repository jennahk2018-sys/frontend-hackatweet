
import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import { useSelector } from "react-redux";
import styles from "../styles/Login.module.css";
import Image from "next/image";
import logo from "../public/logo-twitter-blanc-png.png";
import { Modal, Button } from "antd";
import SignUp from "./SignUp";
import SignIn from "./SignIn";

function Login() {
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

  return (
    <div>
      <main className={styles.main}>
        {/* COLONNE GAUCHE */}
        <div className={styles.imageContent}>
          <div className={styles.logo}>
            <Image
              src={logo}
              alt="Logo Twitter"
              layout="fill"
              objectFit="contain"
            />
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

          <h1 className={styles.title}>
            See what's happening
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

