import styles from "../styles/Login.module.css";
import Image from "next/image";
import logo from "../public/logo-twitter-blanc-png.png";
import "antd/dist/antd.css";
import { Popover, Button } from "antd";

function Login() {
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
          <Button type="primary" className={styles.button}>
            Sign up
          </Button>
          <div className={styles.text}>Already have an account?</div>
          <Button className={styles.button}>Sign in</Button>
        </div>
      </main>
    </div>
  );
}

export default Login;
