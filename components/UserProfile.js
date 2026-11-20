import { useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { Modal } from "antd";
import { updateAvatar } from "../reducers/user";
import Avatar from "./Avatar";
import AvatarPicker from "./AvatarPicker";
import styles from "../styles/UserProfile.module.css";

// Colonne gauche : avatar cliquable + prénom + username.
// Un clic sur l'avatar ouvre une fenêtre pour en choisir un autre.
function UserProfile() {
  const user = useSelector((state) => state.user.value);
  const dispatch = useDispatch();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const openModal = () => {
    setErrorMessage("");
    setIsModalOpen(true);
  };

  // Enregistre le nouvel avatar dans le backend, puis dans Redux
  const handleChooseAvatar = (avatar) => {
    if (avatar === user.avatar) {
      setIsModalOpen(false);
      return;
    }

    setIsSaving(true);
    setErrorMessage("");

    fetch("https://backend-hackatweet-ten.vercel.app/users/avatar", {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${user.token}`,
      },
      body: JSON.stringify({ avatar }),
    })
      .then((response) => response.json())
      .then((data) => {
        if (data.result) {
          dispatch(updateAvatar(data.avatar));
          setIsModalOpen(false);
        } else {
          setErrorMessage("Unable to change your avatar. Please try again.");
        }
      })
      .catch((error) => {
        console.error("Erreur avatar :", error);
        setErrorMessage("Unable to reach the server. Please try again.");
      })
      .finally(() => setIsSaving(false));
  };

  return (
    <>
      <div className={styles.profile}>
        <button
          type="button"
          className={styles.avatarButton}
          onClick={openModal}
          aria-label="Change your avatar"
          title="Change your avatar"
        >
          <Avatar src={user.avatar} alt={user.firstname} size={48} />
        </button>

        <div>
          <p className={styles.firstname}>{user.firstname}</p>
          <p className={styles.username}>@{user.username}</p>
        </div>
      </div>

      {/* FENÊTRE DE CHOIX D'AVATAR */}
      <Modal
        open={isModalOpen}
        onCancel={() => setIsModalOpen(false)}
        footer={null}
        centered
        className={styles.modal}
      >
        <h2 className={styles.modalTitle}>Choose your avatar</h2>

        <AvatarPicker
          value={user.avatar}
          onChange={handleChooseAvatar}
          disabled={isSaving}
        />

        {errorMessage && (
          <p className={styles.error} role="alert">
            {errorMessage}
          </p>
        )}
      </Modal>
    </>
  );
}

export default UserProfile;
