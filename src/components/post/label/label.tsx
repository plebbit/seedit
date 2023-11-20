import { useTranslation } from 'react-i18next';
import styles from './label.module.css';

export const FailedLabel = () => {
  const { t } = useTranslation();

  return <span className={`${styles.stamp} ${styles.stampFailed}`}>{t('failed').toUpperCase()}</span>;
};

export const PendingLabel = () => {
  const { t } = useTranslation();

  return <span className={`${styles.stamp} ${styles.stampPending}`}>{t('pending').toUpperCase()}</span>;
};

export const SpoilerLabel = () => {
  const { t } = useTranslation();

  return <span className={`${styles.stamp} ${styles.stampSpoiler}`}>{t('spoiler').toUpperCase()}</span>;
};
