import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import { useSelector, useDispatch } from "react-redux";
import { logout } from "../reducers/user";
import LastTweets from "./LastTweets";
import Trends from "./Trends";
import Image from "next/image";
import logo from "../public/logo-twitter-blanc-png.png";
import styles from "../styles/Home.module.css";
import useRequireAuth from "../hooks/useRequireAuth";

function Hashtag() {
  const isLoggedIn = useRequireAuth();

  const router = useRouter();
  const { tag } = router.query;

  const user = useSelector((state) => state.user.value);
  const dispatch = useDispatch();

  const [search, setSearch] = useState("");
  const [tweets, setTweets] = useState([]);
  const [trends, setTrends] = useState([]);
  const [loading, setLoading] = useState(true);

  // Calculer les tendances
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
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    getTweets();
  }, []);

  // Synchroniser la recherche avec l'URL
  useEffect(() => {
    if (typeof tag === "string") {
      setSearch(`#${tag}`);
    }
  }, [tag]);

  // Changer de hashtag
  const handleHashtagClick = (hashtag) => {
    const cleanTag = hashtag.trim().replace(/^#+/, "");

    if (cleanTag) {
      router.push(`/hashtag/${encodeURIComponent(cleanTag)}`);
    }
  };

  // Recherche avec Entrée
  const handleSearch = (e) => {
    e.preventDefault();
    handleHashtagClick(search);
  };

  // Filtrer les tweets par hashtag
  // (la regex est construite une seule fois, pas à chaque tweet)
  let filteredTweets = [];

  if (typeof tag === "string") {
    const escapedTag = tag.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    const regex = new RegExp(`(^|[^\\w])#${escapedTag}(?!\\w)`, "i");

    filteredTweets = tweets.filter((tweet) => regex.test(tweet.content || ""));
  }

  // Déconnexion
  const handleLogout = () => {
    dispatch(logout());
    router.push("/");
  };

  // Pas connecté : on n'affiche rien pendant la redirection
  // (ce return doit rester APRÈS tous les hooks)
  if (!isLoggedIn) {
    return null;
  }

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
        <h1 className={styles.title}>Hashtag</h1>

        <form onSubmit={handleSearch}>
          <input
            type="text"
            className={styles.hashtagSearch}
            placeholder="#"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </form>

        {/* Au premier rendu, Next.js n'a pas encore lu l'URL : tag vaut undefined */}
        {loading || !router.isReady ? (
          <p>Loading tweets...</p>
        ) : filteredTweets.length > 0 ? (
          <LastTweets
            tweets={filteredTweets}
            onDelete={getTweets}
            onHashtagClick={handleHashtagClick}
          />
        ) : (
          <p className={styles.noTweets}>No tweets found with #{tag}</p>
        )}
      </section>

      {/* COLONNE DROITE */}
      <section className={styles.right}>
        <Trends trends={trends} onHashtagClick={handleHashtagClick} />
      </section>
    </div>
  );
}

export default Hashtag;
