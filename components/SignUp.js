import { useState } from "react";
import { useDispatch } from "react-redux";
import { useRouter } from "next/router";
import Image from "next/image";
import { Button, Input } from "antd";
import styles from "../styles/SignUp.module.css";
import logo from "../public/logo-twitter-blanc-png.png";
import { login } from "../reducers/user";

function SignUp({ onClose }) {
  const dispatch = useDispatch();
  const router = useRouter();

  const [signUpFirstname, setSignUpFirstname] = useState("");
  const [signUpUsername, setSignUpUsername] = useState("");
  const [signUpPassword, setSignUpPassword] = useState("");

  const handleRegister = () => {
    fetch("http://localhost:3000/users/signup", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
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
      <Input
        className={styles.input}
        placeholder="Firstname"
        id="signUpFirstname"
        onChange={(e) => setSignUpFirstname(e.target.value)}
        value={signUpFirstname}
      />

      <Input
        className={styles.input}
        placeholder="Username"
        id="signUpUsername"
        onChange={(e) => setSignUpUsername(e.target.value)}
        value={signUpUsername}
      />

      <Input.Password
        className={styles.input}
        placeholder="Password"
        id="signUpPassword"
        onChange={(e) => setSignUpPassword(e.target.value)}
        value={signUpPassword}
        onPressEnter={handleRegister}
      />
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
