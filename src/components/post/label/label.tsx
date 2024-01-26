import { useTranslation } from 'react-i18next';
import styles from './label.module.css';

export const DeletedLabel = () => {
  const { t } = useTranslation();

  return <span className={`${styles.stamp} ${styles.red}`}>{t('deleted')}</span>;
};

export const FailedLabel = () => {
  const { t } = useTranslation();

  return <span className={`${styles.stamp} ${styles.red}`}>{t('failed')}</span>;
};

export const PendingLabel = () => {
  const { t } = useTranslation();

  return <span className={`${styles.stamp} ${styles.yellow}`}>{t('pending')}</span>;
};

export const RemovedLabel = () => {
  const { t } = useTranslation();

  return <span className={`${styles.stamp} ${styles.red}`}>{t('removed')}</span>;
};

export const SpoilerLabel = () => {
  const { t } = useTranslation();

  return <span className={`${styles.stamp} ${styles.black}`}>{t('spoiler')}</span>;
};

export const RoleLabel = ({ role }: { role: string }) => {
  const { t } = useTranslation();

  return <span className={`${styles.stamp} ${styles.green}`}>{t(role)}</span>;
};

export const OfflineLabel = () => {
  const { t } = useTranslation();

  return <span className={`${styles.stamp} ${styles.red}`}>{t('offline')}</span>;
};
