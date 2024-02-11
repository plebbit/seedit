import { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import styles from './settings.module.css';
import GeneralSettings from './general-settings/general-settings';
import AddressSettings from './address-settings';
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
        <span className={styles.categoryTitle}>{t('general_settings')}</span>
        <span className={styles.categorySettings}>
          <GeneralSettings />
        </span>
      </div>
      <div className={styles.category}>
        <span className={styles.categoryTitle}>{t('address')}</span>
        <span className={styles.categorySettings}>
          <AddressSettings />
        </span>
      </div>
      <div className={styles.category}>
        <span className={styles.categoryTitle}>{t('account')}</span>
        <span className={styles.categorySettings}>
          <AccountSettings />
        </span>
      </div>
    </div>
  );
};

export default Settings;
