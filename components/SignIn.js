import { useState } from "react";
import { useDispatch } from "react-redux";
import { useRouter } from "next/router";
import Image from "next/image";
import { Button, Input } from "antd";
import styles from "../styles/Signin.module.css";
import logo from "../public/logo-twitter-blanc-png.png";
import { login } from "../reducers/user";

function SignIn({ onClose }) {
  const dispatch = useDispatch();
  const router = useRouter();

  const [signInUsername, setSignInUsername] = useState("");
  const [signInPassword, setSignInPassword] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  const handleSignIn = () => {
    // On efface l'ancienne erreur avant chaque tentative
    setErrorMessage("");

    fetch("https://backend-hackatweet-ten.vercel.app/users/signin", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        username: signInUsername,
        password: signInPassword,
      }),
    })
      .then((response) => response.json())
      .then((data) => {
        // DEBUG : vérifier les données du backend
        console.log("RÉPONSE SIGNIN :", {
          result: data.result,
          userId: data.userId,
          firstname: data.firstname,
          username: data.username,
          hasToken: Boolean(data.token),
        });

        if (data.result) {
          // Enregistrer l'utilisateur dans Redux
          dispatch(
            login({
              userId: data.userId,
              firstname: data.firstname,
              username: data.username,
              token: data.token,
              avatar: data.avatar,
            }),
          );

          // Vider les champs
          setSignInUsername("");
          setSignInPassword("");

          // Fermer la fenêtre de connexion
          if (typeof onClose === "function") {
            onClose();
          }

          // Rediriger vers la page Home
          router.push("/home");
        } else if (data.error === "Missing or empty fields") {
          setErrorMessage("Please fill in your username and password.");
        } else {
          // "User not found or wrong password"
          setErrorMessage("Incorrect username or password.");
        }
      })
      .catch((error) => {
        console.error("Erreur serveur :", error);
        setErrorMessage("Unable to reach the server. Please try again.");
      });
  };

  return (
    <div className={styles.container}>
      <div className={styles.smallLogo}>
        <Image
          src={logo}
          alt="Logo twitter"
          layout="fill"
          objectFit="contain"
        />
      </div>

      <h2 className={styles.subtitle}>Connect to Hackatweet account</h2>

      <Input
        className={styles.input}
        placeholder="Username"
        id="signInUsername"
        onChange={(e) => {
          setSignInUsername(e.target.value);
          setErrorMessage(""); // l'erreur disparaît dès qu'on corrige
        }}
        value={signInUsername}
      />

      <Input.Password
        className={styles.input}
        placeholder="Password"
        id="signInPassword"
        onChange={(e) => {
          setSignInPassword(e.target.value);
          setErrorMessage("");
        }}
        value={signInPassword}
        onPressEnter={handleSignIn}
      />

      {/* Message d'erreur, affiché seulement s'il y en a un */}
      {errorMessage && (
        <p className={styles.error} role="alert">
          {errorMessage}
        </p>
      )}

      <Button
        type="primary"
        className={styles.buttonLight}
        onClick={handleSignIn}
      >
        Sign In
      </Button>
    </div>
  );
}

export default SignIn;
