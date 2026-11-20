import { useRouter } from "next/router";
import styles from "../styles/Home.module.css";
import { useState, useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { logout } from "../reducers/user";
import LastTweets from "./LastTweets";
import Trends from "./Trends";
import Image from "next/image";
import logo from "../public/logo-twitter-blanc-png.png";

function Home() {
  const [newTweet, setNewTweet] = useState("");
  const [tweets, setTweets] = useState([]);
  const [trends, setTrends] = useState([]);

  const user = useSelector((state) => state.user.value);

  const dispatch = useDispatch();
  const router = useRouter();

  // Calculer tous les hashtags utilisés dans les tweets
  const calculateTrends = (tweetsList) => {
    const hashtagsCount = {};

    tweetsList.forEach((tweet) => {
      const hashtags = tweet.content?.match(/#[\w]+/g) || [];

      hashtags.forEach((hashtag) => {
        const key = hashtag.toLowerCase();

        if (!hashtagsCount[key]) {
          hashtagsCount[key] = 0;
        }

        hashtagsCount[key]++;
      });
    });

    // Transformer l'objet en tableau et trier les hashtags
    const sortedTrends = Object.entries(hashtagsCount)
      .map(([hashtag, count]) => ({
        hashtag,
        count,
      }))
      .sort((a, b) => b.count - a.count);

    setTrends(sortedTrends);
  };

  // Récupérer tous les tweets
  const getTweets = () => {
    fetch("https://backend-hackatweet-ten.vercel.app/tweets")
      .then((response) => response.json())
      .then((data) => {
        if (data.result === true) {
          setTweets(data.tweets);
          calculateTrends(data.tweets);
        }
      })
      .catch((error) => {
        console.error("Erreur récupération tweets :", error);
      });
  };

  // Rediriger vers la page du hashtag sélectionné
  const handleHashtagClick = (hashtag) => {
    const cleanTag = hashtag.trim().replace(/^#+/, "");

    if (cleanTag) {
      router.push(`/hashtag/${encodeURIComponent(cleanTag)}`);
    }
  };

  // Publier un tweet
  const handleTweet = () => {
    if (newTweet.trim() === "") {
      return;
    }

    if (!user.token) {
      console.log("Utilisateur non connecté");
      return;
    }

    fetch("https://backend-hackatweet-ten.vercel.app/tweets", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${user.token}`,
      },
      body: JSON.stringify({
        content: newTweet,
      }),
    })
      .then((response) => response.json())
      .then((data) => {
        if (data.result === true) {
          setNewTweet("");
          console.log("Tweet publié !");
          getTweets();
        } else {
          console.error("Erreur publication :", data.error);
        }
      })
      .catch((error) => {
        console.error("Erreur lors de la publication :", error);
      });
  };

  // Déconnexion
  const handleLogout = () => {
    dispatch(logout());
    router.push("/");
  };

  // Récupérer les tweets au chargement
  useEffect(() => {
    getTweets();

    const interval = setInterval(getTweets, 5000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className={styles.container}>
      {/* COLONNE GAUCHE */}
      <section className={styles.left}>
        <div
          className={styles.logoContainer}
          onClick={() => router.push("/home")}
        >
          <Image
            src={logo}
            alt="Logo Twitter"
            width={70}
            height={70}
            objectFit="contain"
          />
        </div>

        <div className={styles.userInfo}>
          <div>
            <p className={styles.firstname}>{user.firstname}</p>

            <p className={styles.username}>@{user.username}</p>
          </div>

          <button className={styles.logoutButton} onClick={handleLogout}>
            Logout
          </button>
        </div>
      </section>

      {/* COLONNE CENTRALE */}
      <section className={styles.middle}>
        <h1 className={styles.title}>Home</h1>

        <textarea
          className={styles.textarea}
          placeholder="What's up?"
          value={newTweet}
          onChange={(e) => setNewTweet(e.target.value)}
          maxLength={280}
        />

        <div className={styles.tweetActions}>
          <span>{newTweet.length}/280</span>

          <button className={styles.tweetButton} onClick={handleTweet}>
            Tweet
          </button>
        </div>

        {/* Liste des tweets */}
        <LastTweets
          tweets={tweets}
          onDelete={getTweets}
          onHashtagClick={handleHashtagClick}
          showTitle={false}
        />
      </section>

      {/* COLONNE DROITE */}
      <section className={styles.right}>
        <Trends trends={trends} onHashtagClick={handleHashtagClick} />
      </section>
    </div>
  );
}

export default Home;
