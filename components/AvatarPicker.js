import { useAvatars } from "../context/AvatarsContext";
import Avatar from "./Avatar";
import styles from "../styles/AvatarPicker.module.css";

// Grille de choix d'avatar, utilisée au sign up et dans la colonne gauche.
// value : l'avatar sélectionné / onChange : appelé avec le nouvel avatar
function AvatarPicker({ value, onChange, disabled = false }) {
  // La liste vient automatiquement du dossier public/avatar
  // (lue par getStaticProps, partagée par le Context)
  const avatars = useAvatars();

  return (
    <div className={styles.grid} role="radiogroup" aria-label="Choose your avatar">
      {avatars.map((avatar) => {
        const isSelected = avatar.src === value;

        return (
          <button
            key={avatar.src}
            type="button"
            role="radio"
            aria-checked={isSelected}
            className={`${styles.option} ${isSelected ? styles.selected : ""}`}
            onClick={() => onChange(avatar.src)}
            disabled={disabled}
          >
            <Avatar src={avatar.src} alt={avatar.label} size={64} />
            <span className={styles.label}>{avatar.label}</span>
          </button>
        );
      })}
    </div>
  );
}

export default AvatarPicker;
