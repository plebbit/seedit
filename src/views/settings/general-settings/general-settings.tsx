import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import useTheme from '../../../hooks/use-theme';
import styles from './general-settings.module.css';
import packageJson from '../../../../package.json';

const commitRef = process.env.REACT_APP_COMMIT_REF;
const isElectron = window.isElectron === true;

const CheckForUpdates = () => {
  const { t } = useTranslation();
  const [loading, setLoading] = useState(false);

  const checkForUpdates = async () => {
    try {
      setLoading(true);
      const packageRes = await fetch('https://raw.githubusercontent.com/plebbit/seedit/master/package.json', { cache: 'no-cache' });
      const packageData = await packageRes.json();
      let updateAvailable = false;

      if (packageJson.version !== packageData.version) {
        const newVersionText = `New version available, seedit v${packageData.version}. You are using v${packageJson.version}. `;
        const updateActionText = isElectron ? ` Download the latest desktop version here: https://github.com/plebbit/seedit/releases/latest` : ` Refresh to update.`;
        alert(newVersionText + updateActionText);
        updateAvailable = true;
      }

      if (commitRef && commitRef.length > 0) {
        const commitRes = await fetch('https://api.github.com/repos/plebbit/seedit/commits?per_page=1&sha=development', { cache: 'no-cache' });
        const commitData = await commitRes.json();

        const latestCommitHash = commitData[0].sha;

        if (latestCommitHash.trim() !== commitRef.trim()) {
          const newVersionText = `New dev version available, commit ${latestCommitHash.slice(0, 7)}. You are using commit ${commitRef.slice(0, 7)}. Refresh to update.`;
          alert(newVersionText);
          updateAvailable = true;
        }
      }

      if (!updateAvailable) {
        alert(
          commitRef
            ? `You're on the latest development version, commit ${commitRef.slice(0, 7)}.`
            : `You are on the latest stable version, seedit v${packageJson.version}.`,
        );
      }
    } catch (error) {
      alert('Failed to fetch latest version info:' + error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <button className={styles.checkForUpdatesButton} onClick={checkForUpdates} disabled={loading}>
      {t('check')}
    </button>
  );
};

// prettier-ignore
const availableLanguages = ['ar', 'bn', 'cs', 'da', 'de', 'el', 'en', 'es', 'fa', 'fi', 'fil', 'fr', 'he', 'hi', 'hu', 'id', 'it', 'ja', 'ko', 'mr', 'nl', 'no', 'pl', 'pt', 'ro', 'ru', 'sq', 'sv', 'te', 'th', 'tr', 'uk', 'ur', 'vi', 'zh'];

const LanguageSettings = () => {
  const { i18n } = useTranslation();
  const { changeLanguage, language } = i18n;

  const onSelectLanguage = (e: React.ChangeEvent<HTMLSelectElement>) => {
    changeLanguage(e.target.value);
    window.location.reload();
  };

  return (
    <select value={language} onChange={onSelectLanguage}>
      {availableLanguages.map((lang) => (
        <option key={lang} value={lang}>
          {lang}
        </option>
      ))}
    </select>
  );
};

const ThemeSettings = () => {
  const [theme, setTheme] = useTheme();
  const { t } = useTranslation();

  return (
    <select value={theme} onChange={(e) => setTheme(e.target.value)}>
      <option value='light'>{t('light')}</option>
      <option value='dark'>{t('dark')}</option>
    </select>
  );
};

const GeneralSettings = () => {
  const { t } = useTranslation();

  return (
    <>
      <div className={styles.checkForUpdates}>
        <div className={styles.settingTitle}>{t('check_for_updates')}</div>
        <CheckForUpdates />
      </div>
      <div className={styles.languageSettings}>
        <div className={styles.settingTitle}>{t('interface_language')}</div>
        <LanguageSettings />
      </div>
      <div className={styles.themeSettings}>
        <div className={styles.settingTitle}>{t('theme')}</div>
        <ThemeSettings />
      </div>
    </>
  );
};

export default GeneralSettings;
