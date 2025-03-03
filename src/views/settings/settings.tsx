import { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { Trans, useTranslation } from 'react-i18next';
import { Capacitor } from '@capacitor/core';
import { setAccount, useAccount } from '@plebbit/plebbit-react-hooks';
import { isSettingsPlebbitOptionsView } from '../../lib/utils/view-utils';
import useContentOptionsStore from '../../stores/use-content-options-store';
import useTheme from '../../hooks/use-theme';
import Version from '../../components/version';
import AccountSettings from './account-settings';
import AddressSettings from './address-settings';
import AvatarSettings from './avatar-settings';
import PlebbitOptions from './plebbit-options';
import WalletSettings from './wallet-settings';
import styles from './settings.module.css';
import packageJson from '../../../package.json';
import _ from 'lodash';

const commitRef = process.env.REACT_APP_COMMIT_REF;
const isElectron = window.isElectron === true;
const isAndroid = Capacitor.getPlatform() === 'android';

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
          : isAndroid
          ? t('download_latest_android')
          : t('refresh_to_update');
        if (isAndroid) {
          if (window.confirm(newVersionText + ' ' + updateActionText)) {
            window.open(`https://github.com/plebbit/seedit/releases/download/v${packageData.version}/seedit-${packageData.version}.apk`, '_blank', 'noreferrer');
          }
        } else {
          alert(newVersionText + ' ' + updateActionText);
        }
        updateAvailable = true;
      }

      if (commitRef && commitRef.length > 0) {
        const commitRes = await fetch('https://api.github.com/repos/plebbit/seedit/commits?per_page=1&sha=development', { cache: 'no-cache' });
        const commitData = await commitRes.json();

        const latestCommitHash = commitData[0].sha;

        if (latestCommitHash.trim() !== commitRef.trim()) {
          const newVersionText =
            t('new_development_version', { newCommit: latestCommitHash.slice(0, 7), oldCommit: commitRef.slice(0, 7) }) + ' ' + t('refresh_to_update');
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
      alert('Failed to fetch latest version info: ' + error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.checkForUpdates}>
      <Trans i18nKey='check_for_updates' components={{ 1: <button className={styles.checkForUpdatesButton} onClick={checkForUpdates} disabled={loading} /> }} />
    </div>
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
    <div className={styles.languageSettings}>
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
    </div>
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

const ContentOptions = () => {
  const { t } = useTranslation();
  const {
    blurNsfwThumbnails,
    hideAdultCommunities,
    hideGoreCommunities,
    hideAntiCommunities,
    hideVulgarCommunities,
    setBlurNsfwThumbnails,
    setHideAdultCommunities,
    setHideGoreCommunities,
    setHideAntiCommunities,
    setHideVulgarCommunities,
  } = useContentOptionsStore();

  return (
    <div className={styles.filters}>
      <div className={styles.filterSettingTitle}>{t('nsfw_content')}</div>
      <input type='checkbox' id='blurNsfwThumbnails' checked={blurNsfwThumbnails} onChange={(e) => setBlurNsfwThumbnails(e.target.checked)} />
      <label htmlFor='blurNsfwThumbnails'>{t('blur_media')}</label>
      <br />
      <br />
      <div className={styles.filterSettingTitle}>{t('communities')}</div>
      <input type='checkbox' id='hideAdultCommunities' checked={hideAdultCommunities} onChange={(e) => setHideAdultCommunities(e.target.checked)} />
      <label htmlFor='hideAdultCommunities'>{t('hide_adult')} (NSFW/18+)</label>
      <br />
      <input type='checkbox' id='hideAntiCommunities' checked={hideAntiCommunities} onChange={(e) => setHideAntiCommunities(e.target.checked)} />
      <label htmlFor='hideAntiCommunities'>{t('hide_anti')}</label>
      <br />
      <input type='checkbox' id='hideGoreCommunities' checked={hideGoreCommunities} onChange={(e) => setHideGoreCommunities(e.target.checked)} />
      <label htmlFor='hideGoreCommunities'>{t('hide_gore')} (NSFW/18+)</label>
      <br />
      <input type='checkbox' id='hideVulgarCommunities' checked={hideVulgarCommunities} onChange={(e) => setHideVulgarCommunities(e.target.checked)} />
      <label htmlFor='hideVulgarCommunities'>{t('hide_vulgar')}</label>
    </div>
  );
};

const DisplayNameSetting = () => {
  const { t } = useTranslation();
  const account = useAccount();
  const [displayName, setDisplayName] = useState(account?.author?.displayName || '');
  const [savedDisplayName, setSavedDisplayName] = useState(false);

  const saveUsername = async () => {
    try {
      await setAccount({ ...account, author: { ...account?.author, displayName } });
      setSavedDisplayName(true);
      setTimeout(() => {
        setSavedDisplayName(false);
      }, 2000);
    } catch (error) {
      if (error instanceof Error) {
        alert(error.message);
        console.log(error);
      } else {
        console.error('An unknown error occurred:', error);
      }
    }
  };

  return (
    <div className={styles.displayNameSetting}>
      <div className={styles.usernameInput}>
        <input type='text' placeholder='My Name' value={displayName || account?.author?.displayName || ''} onChange={(e) => setDisplayName(e.target.value)} />
        <button className={styles.button} onClick={saveUsername}>
          {t('save')}
        </button>
        {savedDisplayName && <span className={styles.saved}>{t('saved')}</span>}
      </div>
    </div>
  );
};

const GeneralSettings = () => {
  const { t } = useTranslation();
  const location = useLocation();

  return (
    <>
      <div className={styles.category}>
        <span className={styles.categoryTitle}>{t('version')}</span>
        <span className={styles.categorySettings}>
          <div className={styles.version}>
            seedit <Version />
            {isElectron && (
              <a className={styles.fullNodeStats} href='http://localhost:50019/webui/' target='_blank' rel='noreferrer'>
                {t('node_stats')}
              </a>
            )}
          </div>
          <CheckForUpdates />
        </span>
      </div>
      <div className={styles.category}>
        <span className={styles.categoryTitle}>{t('interface_language')}</span>
        <span className={styles.categorySettings}>
          <LanguageSettings />
        </span>
      </div>
      <div className={styles.category}>
        <span className={styles.categoryTitle}>{t('theme')}</span>
        <span className={styles.categorySettings}>
          <ThemeSettings />
        </span>
      </div>
      <div className={styles.category}>
        <span className={styles.categoryTitle}>{t('content_options')}</span>
        <span className={styles.categorySettings}>
          <ContentOptions />
        </span>
      </div>
      <div className={styles.category}>
        <span className={styles.categoryTitle}>{t('avatar')}</span>
        <span className={styles.categorySettings}>
          <AvatarSettings />
        </span>
      </div>
      <div className={`${styles.category} ${location.hash === '#displayName' ? styles.highlightedSetting : ''}`} id='displayName'>
        <span className={styles.categoryTitle}>{t('display_name')}</span>
        <span className={styles.categorySettings}>
          <DisplayNameSetting />
        </span>
      </div>
      <div className={`${styles.category} ${location.hash === '#cryptoAddress' ? styles.highlightedSetting : ''}`} id='cryptoAddress'>
        <span className={styles.categoryTitle}>{t('crypto_address')}</span>
        <span className={styles.categorySettings}>
          <AddressSettings />
        </span>
      </div>
      <div className={styles.category}>
        <span className={styles.categoryTitle}>{t('crypto_wallets')}</span>
        <span className={styles.categorySettings}>
          <WalletSettings />
        </span>
      </div>
      <div className={`${styles.category} ${location.hash === '#exportAccount' ? styles.highlightedSetting : ''}`} id='exportBackup'>
        <span className={styles.categoryTitle}>{t('account')}</span>
        <span className={styles.categorySettings}>
          <AccountSettings />
        </span>
      </div>
    </>
  );
};

const Settings = () => {
  const { t } = useTranslation();
  const isInSettingsPlebbitOptionsView = isSettingsPlebbitOptionsView(useLocation().pathname);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const documentTitle = `${_.startCase(t('preferences'))} - Seedit`;
  useEffect(() => {
    document.title = documentTitle;
  }, [documentTitle]);

  return <div className={styles.content}>{isInSettingsPlebbitOptionsView ? <PlebbitOptions /> : <GeneralSettings />}</div>;
};

export default Settings;
