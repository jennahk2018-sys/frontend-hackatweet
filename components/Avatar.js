import styles from "../styles/Avatar.module.css";

// Avatar rond réutilisable (tweets, colonne gauche, choix d'avatar).
// Si l'utilisateur n'a pas d'avatar (anciens comptes), on affiche une silhouette.
function Avatar({ src, alt = "Avatar", size = 42 }) {
  const style = { width: size, height: size, minWidth: size };

  if (!src) {
    return (
      <div className={styles.fallback} style={style} aria-label={alt}>
        <div className={styles.fallbackHead} />
      </div>
    );
  }

  return <img className={styles.avatar} style={style} src={src} alt={alt} />;
}

export default Avatar;
