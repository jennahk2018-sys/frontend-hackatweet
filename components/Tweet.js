import { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faTrashCan } from "@fortawesome/free-regular-svg-icons";
import styles from "../styles/Tweet.module.css";
import Avatar from "./Avatar";

function Tweet({
  id,
  content,
  author,
  likes = [],
  createdAt,
  onDelete,
  onHashtagClick,
}) {
  const user = useSelector((state) => state.user.value);

  const [liked, setLiked] = useState(false);
  const [likesCount, setLikesCount] = useState(likes.length);
  const [isLiking, setIsLiking] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  // Synchroniser les likes avec MongoDB
  useEffect(() => {
    setLikesCount(likes.length);

    const alreadyLiked = likes.some(
      (like) => String(like?._id || like) === String(user.userId),
    );

    setLiked(Boolean(user.userId) && alreadyLiked);
  }, [likes, user.userId]);

  // Vérifier si le tweet appartient à l'utilisateur
  const isOwner =
    Boolean(user.userId) &&
    String(author?._id || author) === String(user.userId);

  // Calculer le temps écoulé
  const getTimeAgo = () => {
    if (!createdAt) return "";

    const difference = Date.now() - new Date(createdAt).getTime();
    const minutes = Math.max(0, Math.floor(difference / 60000));

    if (minutes < 1) return "a few seconds";
    if (minutes < 60) return `${minutes} min`;
    if (minutes < 1440) return `${Math.floor(minutes / 60)} hours`;

    return `${Math.floor(minutes / 1440)} days`;
  };

  // Afficher les hashtags en bleu et les rendre cliquables
  const displayContent = content?.split(/(#[\w]+)/g).map((part, index) => {
    if (part.startsWith("#")) {
      return (
        <span
          key={index}
          className={styles.hashtag}
          onClick={() => onHashtagClick?.(part)}
          style={{ cursor: "pointer" }}
        >
          {part}
        </span>
      );
    }

    return part;
  });

  // Liker ou retirer un like
  const handleLike = async () => {
    if (!user.token || isLiking) return;

    setIsLiking(true);

    try {
      const response = await fetch(
        `https://backend-hackatweet-ten.vercel.app/tweets/${id}/like`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${user.token}`,
          },
        },
      );

      const data = await response.json();

      if (response.ok && data.result === true) {
        setLiked(data.liked);
        setLikesCount(data.likesCount);
      } else {
        console.error("Erreur like :", data.error);
      }
    } catch (error) {
      console.error("Erreur lors du like :", error);
    } finally {
      setIsLiking(false);
    }
  };

  // Supprimer son propre tweet
  const handleDelete = async () => {
    if (!user.token || !isOwner || isDeleting) return;

    setIsDeleting(true);

    try {
      const response = await fetch(`https://backend-hackatweet-ten.vercel.app/tweets/${id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${user.token}`,
        },
      });

      const data = await response.json();

      if (response.ok && data.result === true) {
        if (typeof onDelete === "function") {
          onDelete();
        }
      } else {
        console.error("Erreur suppression :", data.error);
      }
    } catch (error) {
      console.error("Erreur suppression :", error);
    } finally {
      setIsDeleting(false);
    }
  };

  console.log("Utilisateur Redux :", user);
  console.log("Auteur du tweet :", author);
  console.log("isOwner :", isOwner);
  return (
    <div className={styles.tweet}>
      {/* Auteur */}
      <div className={styles.header}>
        <Avatar
          src={author?.avatar}
          alt={author?.firstname || author?.username || "Avatar"}
          size={42}
        />

        <div className={styles.authorInfo}>
          <span className={styles.firstname}>
            {author?.firstname || author?.username || "Utilisateur"}
          </span>

          <span className={styles.username}>
            @{author?.username || "unknown"}
          </span>

          <span className={styles.date}>· {getTimeAgo()}</span>
        </div>
      </div>

      {/* Contenu du tweet */}
      <p className={styles.content}>{displayContent}</p>

      {/* Actions */}
      <div className={styles.actions}>
        {/* Like */}
        <button
          type="button"
          className={styles.likeButton}
          onClick={handleLike}
          disabled={isLiking}
        >
          {liked ? "❤️" : "♥"} {likesCount}
        </button>

        {/* Supprimer uniquement son propre tweet */}
        {isOwner && (
          <button
            type="button"
            className={styles.deleteButton}
            onClick={handleDelete}
            disabled={isDeleting}
            aria-label="Supprimer le tweet"
          >
            <FontAwesomeIcon icon={faTrashCan} />
          </button>
        )}
      </div>
    </div>
  );
}

export default Tweet;
