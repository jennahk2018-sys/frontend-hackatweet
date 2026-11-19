import { useState } from "react";
import { useDispatch } from "react-redux";
import { useRouter } from "next/router";
import Image from "next/image";
import { Button } from "antd";
import styles from "../styles/SignUp.module.css";
import logo from "../public/logo-twitter-blanc-png.png";
import { login } from "../reducers/user";

function SignIn(onClose) {
  const dispatch = useDispatch();
  const router = useRouter();

  const [signInFirstname, setSignInFirstname] = useState("");
  const [signInUsername, setSignInUsername] = useState("");
  const [signInPassword, setSignInPassword] = useState("");

  const handleSignIn = () => {
    fetch("http://localhost:3000/users/signin", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        firstname: signInFirstname,
        username: signInUsername,
        password: signInPassword,
      }),
    })
      .then((response) => response.json())
      .then((data) => {
        if (data.result) {
          dispatch(
            login({
              firstname: signInFirstname,
              username: signInUsername,
              token: data.token,
            }),
          );
          setSignInFirstname("");
          setSignInUsername("");
          setSignInPassword("");
          onClose();
          router.push("/home");
        }
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
      <h2 className={styles.subtitle}>Create your Hackatweet account</h2>
      <input
        type="Firstname"
        placeholder="Firstname"
        id="signInFirstname"
        onChange={(e) => setSignInFirstname(e.target.value)}
        value={signInFirstname}
      />
      <input
        type="text"
        placeholder="Username"
        id="signInUsername"
        onChange={(e) => setSignInUsername(e.target.value)}
        value={signInUsername}
      />
      <input
        type="password"
        placeholder="Password"
        id="signInPassword"
        onChange={(e) => setSignInPassword(e.target.value)}
        value={signInPassword}
      />
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
