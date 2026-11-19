import { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import styles from "../styles/Login.module.css";
import Image from "next/image";
import logo from "../public/logo-twitter-blanc-png.png";
import { Modal, Button } from "antd";
import SignUp from "./SignUp";
import SignIn from "./SignIn";

function Login() {
  const [isModalSignInVisible, setIsModalSignInVisible] = useState(false);
  const [isModalSignUpVisible, setIsModalSignUpVisible] = useState(false);

  return (
    <div>
      <main className={styles.main}>
        <div className={styles.imageContent}>
          <div className={styles.logo}>
            <Image
              src={logo}
              alt="Logo twitter"
              layout="fill"
              objectFit="contain"
            ></Image>
          </div>
        </div>
        <div className={styles.connexionContent}>
          <div className={styles.smallLogo}>
            <Image
              src={logo}
              alt="Logo twitter"
              layout="fill"
              objectFit="contain"
            />
          </div>
          <h1 className={styles.title}>See what's happening</h1>
          <h2 className={styles.subtitle}>Join Hackatweet today.</h2>
          <Button
            type="primary"
            className={styles.buttonDark}
            onClick={() => setIsModalSignUpVisible(true)}
          >
            Sign up
          </Button>
          <div className={styles.text}>Already have an account?</div>
          <Button
            className={styles.buttonLight}
            onClick={() => setIsModalSignInVisible(true)}
          >
            Sign in
          </Button>
        </div>
      </main>
      <Modal
        open={isModalSignUpVisible}
        onCancel={() => setIsModalSignUpVisible(false)}
        footer={null}
        centered
        className={styles.modal}
      >
        <SignUp onClose={() => setIsSignUpOpen(false)} />
      </Modal>
      ;
      <Modal
        open={isModalSignInVisible}
        onCancel={() => setIsModalSignInVisible(false)}
        footer={null}
        centered
        className={styles.modal}
      >
        <SignIn onClose={() => setIsSignInOpen(false)} />
      </Modal>
      ;
    </div>
  );
}

export default Login;
