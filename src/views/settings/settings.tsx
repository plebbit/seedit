import { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import useTheme from '../../hooks/use-theme';
import styles from './settings.module.css';

// prettier-ignore
const availableLanguages = ['ar', 'bn', 'cs', 'da', 'de', 'el', 'en', 'es', 'fa', 'fi', 'fil', 'fr', 'he', 'hi', 'hu', 'id', 'it', 'ja', 'ko', 'mr', 'nl', 'no', 'pl', 'pt', 'ro', 'ru', 'sq', 'sv', 'te', 'th', 'tr', 'uk', 'ur', 'vi', 'zh'];

const Settings = () => {
  const [theme, setTheme] = useTheme();
  const { i18n, t } = useTranslation();
  const { changeLanguage, language } = i18n;

  useEffect(() => {
    document.title = `${t('preferences')} - seedit`;
  }, [t]);

  const onSelectLanguage = (e: React.ChangeEvent<HTMLSelectElement>) => {
    changeLanguage(e.target.value);
  };

  const themeSelect = (
    <div>
      <select value={theme} onChange={(e) => setTheme(e.target.value)}>
        <option value='light'>{t('light')}</option>
        <option value='dark'>{t('dark')}</option>
      </select>
    </div>
  );

  const languageSelect = (
    <div>
      <select value={language} onChange={onSelectLanguage}>
        {availableLanguages.map((lang) => (
          <option key={lang} value={lang}>
            {lang}
          </option>
        ))}
      </select>
    </div>
  );



  return (
    <div className={styles.content}>
      <div className={styles.category}>
        <span className={styles.categoryTitle}>interface language</span>
        <span className={styles.setting}>
          {languageSelect}
        </span>
      </div>
      <div className={styles.category}>
        <span className={styles.categoryTitle}>theme</span>
        <span className={styles.setting}>
          {themeSelect}
        </span>
      </div>
      {/* <div className={styles.category}>
        <span className={styles.categoryTitle}>account</span>
        <span className={styles.setting}>
          <textarea className={styles.textarea} />
        </span>
      </div> */}
    </div>
  );
};

export default Settings;
