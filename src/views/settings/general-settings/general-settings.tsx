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
        const newVersionText = t('new_stable_version', { newVersion: packageData.version, oldVersion: packageJson.version });
        const updateActionText = isElectron
          ? t('download_latest_desktop', { link: 'https://github.com/plebbit/seedit/releases/latest', interpolation: { escapeValue: false } })
          : t('refresh_to_update');
        alert(newVersionText + ' ' + updateActionText);
        updateAvailable = true;
      }

      if (commitRef && commitRef.length > 0) {
        const commitRes = await fetch('https://api.github.com/repos/plebbit/seedit/commits?per_page=1&sha=development', { cache: 'no-cache' });
        const commitData = await commitRes.json();

        const latestCommitHash = commitData[0].sha;

        if (latestCommitHash.trim() !== commitRef.trim()) {
          const newVersionText = t('new_development_version', { newCommit: latestCommitHash.slice(0, 7), oldCommit: commitRef.slice(0, 7) }) + t('refresh_to_update');
          alert(newVersionText);
          updateAvailable = true;
        }
      }

      if (!updateAvailable) {
        alert(
          commitRef
            ? `${t('latest_development_version', { commit: commitRef.slice(0, 7), link: 'https://seedit.eth.limo/#/', interpolation: { escapeValue: false } })}`
            : `${t('latest_stable_version', { version: packageJson.version })}`,
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
  const { t, i18n } = useTranslation();
  const { changeLanguage, language } = i18n;

  const onSelectLanguage = (e: React.ChangeEvent<HTMLSelectElement>) => {
    changeLanguage(e.target.value);
    window.location.reload();
  };

  return (
    <>
      <select value={language} onChange={onSelectLanguage}>
        {availableLanguages.map((lang) => (
          <option key={lang} value={lang}>
            {lang}
          </option>
        ))}
      </select>
      <a href='https://github.com/plebbit/seedit/tree/master/public/translations' target='_blank' rel='noopener noreferrer'>
        {t('contribute_on_github')}
      </a>
    </>
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
