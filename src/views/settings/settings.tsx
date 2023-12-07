import { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import styles from './settings.module.css';
import LanguageSettings from './language-settings';
import ThemeSettings from './theme-settings';
import ProfileSettings from './profile-settings';
import AccountSettings from './account-settings/account-settings';

const Settings = () => {
  const { t } = useTranslation();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  useEffect(() => {
    document.title = `${t('preferences')} - seedit`;
  }, [t]);

  return (
    <div className={styles.content}>
      <div className={styles.category}>
        <span className={styles.categoryTitle}>interface language</span>
        <span className={styles.categorySettings}>
          <LanguageSettings />
        </span>
      </div>
      <div className={styles.category}>
        <span className={styles.categoryTitle}>theme</span>
        <span className={styles.categorySettings}>
          <ThemeSettings />
        </span>
      </div>
      <div className={styles.category}>
        <span className={styles.categoryTitle}>profile</span>
        <span className={styles.categorySettings}>
          <ProfileSettings />
        </span>
      </div>
      <div className={styles.category}>
        <span className={styles.categoryTitle}>account</span>
        <span className={styles.categorySettings}>
          <AccountSettings />
        </span>
      </div>
    </div>
  );
};

export default Settings;
