import { useTranslation } from "react-i18next";
import styles from "./label.module.css";

export const SpoilerLabel = () => {
  const { t } = useTranslation();

  return (
    <li>
      <span className={`${styles.stamp} ${styles.stampSpoiler}`}>
        <span className={`${styles.content} ${styles.contentSpoiler}`}>{t('spoiler').toUpperCase()}</span>
      </span>
    </li>
  );
};

export const PendingLabel = () => {
  const { t } = useTranslation();

  return (
    <li>
      <span className={`${styles.stamp} ${styles.stampPending}`}>
        <span className={`${styles.content} ${styles.contentPending}`}>{t('pending').toUpperCase()}</span>
      </span>
    </li>
  );
};