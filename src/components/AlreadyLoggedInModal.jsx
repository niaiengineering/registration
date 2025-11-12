import React from "react";
import styles from "../styles/AlreadyLoggedInModal.module.css";
import { Home, LogOut } from "lucide-react";
import { useNavigate } from "react-router-dom";

const AlreadyLoggedInModal = ({ onLogout }) => {
  const navigate = useNavigate();

  return (
    <div className={styles.overlay}>
      <div className={styles.modal}>
        <h2 className={styles.title}>You’re already logged in!</h2>
        <p className={styles.message}>Please go to your home page or logout to continue.</p>

        <div className={styles.actions}>
          <button
            className={`${styles.btn} ${styles.homeBtn}`}
            onClick={() => navigate("/")}
          >
            <Home size={18} />
            Go Home
          </button>

          <button
            className={`${styles.btn} ${styles.logoutBtn}`}
            onClick={onLogout}
          >
            <LogOut size={18} />
            Logout
          </button>
        </div>
      </div>
    </div>
  );
};

export default AlreadyLoggedInModal;
