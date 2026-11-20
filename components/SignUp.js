import { useState } from "react";
import { useDispatch } from "react-redux";
import { useRouter } from "next/router";
import Image from "next/image";
import { Button, Input } from "antd";
import styles from "../styles/Signup.module.css";
import logo from "../public/logo-twitter-blanc-png.png";
import { login } from "../reducers/user";

function SignUp({ onClose }) {
  const dispatch = useDispatch();
  const router = useRouter();

  const [signUpFirstname, setSignUpFirstname] = useState("");
  const [signUpUsername, setSignUpUsername] = useState("");
  const [signUpPassword, setSignUpPassword] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  const handleRegister = () => {
    // On efface l'ancienne erreur avant chaque tentative
    setErrorMessage("");

    fetch("https://backend-hackatweet-ten.vercel.app/users/signup", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        firstname: signUpFirstname,
        username: signUpUsername,
        password: signUpPassword,
      }),
    })
      .then((response) => response.json())
      .then((data) => {
        if (data.result) {
          dispatch(
            login({
              firstname: signUpFirstname,
              username: signUpUsername,
              token: data.token,
              userId: data.userId,
            }),
          );

          setSignUpFirstname("");
          setSignUpUsername("");
          setSignUpPassword("");

          if (typeof onClose === "function") {
            onClose();
          }

          router.push("/home");
        } else if (data.error === "User already exists") {
          setErrorMessage("This username is already taken.");
        } else if (data.error === "Missing or empty fields") {
          setErrorMessage("Please fill in all the fields.");
        } else {
          setErrorMessage("Sign up failed. Please try again.");
        }
      })
      .catch((error) => {
        console.error("Erreur lors de l'inscription :", error);
        setErrorMessage("Unable to reach the server. Please try again.");
      });
  };

  return (
    <div className={styles.container}>
      <div className={styles.smallLogo}>
        <Image
          src={logo}
          alt="Logo Twitter"
          layout="fill"
          objectFit="contain"
        />
      </div>

      <h2 className={styles.subtitle}>Create your Hackatweet account</h2>

      <Input
        className={styles.input}
        placeholder="Firstname"
        id="signUpFirstname"
        onChange={(e) => {
          setSignUpFirstname(e.target.value);
          setErrorMessage("");
        }}
        value={signUpFirstname}
      />

      <Input
        className={styles.input}
        placeholder="Username"
        id="signUpUsername"
        onChange={(e) => {
          setSignUpUsername(e.target.value);
          setErrorMessage(""); // l'erreur disparaît dès qu'on change d'username
        }}
        value={signUpUsername}
      />

      <Input.Password
        className={styles.input}
        placeholder="Password"
        id="signUpPassword"
        onChange={(e) => {
          setSignUpPassword(e.target.value);
          setErrorMessage("");
        }}
        value={signUpPassword}
        onPressEnter={handleRegister}
      />

      {/* Message d'erreur, affiché seulement s'il y en a un */}
      {errorMessage && (
        <p className={styles.error} role="alert">
          {errorMessage}
        </p>
      )}

      <Button
        type="primary"
        className={styles.buttonDark}
        onClick={handleRegister}
      >
        Sign up
      </Button>
    </div>
  );
}

export default SignUp;
