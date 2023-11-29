import { useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { createAccount, deleteAccount, importAccount, setAccount, setActiveAccount, useAccount, useAccounts } from '@plebbit/plebbit-react-hooks';
import stringify from 'json-stringify-pretty-compact';
import useTheme from '../../hooks/use-theme';
import styles from './settings.module.css';

// prettier-ignore
const availableLanguages = ['ar', 'bn', 'cs', 'da', 'de', 'el', 'en', 'es', 'fa', 'fi', 'fil', 'fr', 'he', 'hi', 'hu', 'id', 'it', 'ja', 'ko', 'mr', 'nl', 'no', 'pl', 'pt', 'ro', 'ru', 'sq', 'sv', 'te', 'th', 'tr', 'uk', 'ur', 'vi', 'zh'];

const ThemeSettings = () => {
  const [theme, setTheme] = useTheme();
  const { t } = useTranslation();

  return (
    <span className={styles.categorySettings}>
      <select value={theme} onChange={(e) => setTheme(e.target.value)}>
        <option value='light'>{t('light')}</option>
        <option value='dark'>{t('dark')}</option>
      </select>
    </span>
  );
};

const LanguageSettings = () => {
  const { i18n } = useTranslation();
  const { changeLanguage, language } = i18n;

  const onSelectLanguage = (e: React.ChangeEvent<HTMLSelectElement>) => {
    changeLanguage(e.target.value);
  };

  return (
    <span className={styles.categorySettings}>
      <select value={language} onChange={onSelectLanguage}>
        {availableLanguages.map((lang) => (
          <option key={lang} value={lang}>
            {lang}
          </option>
        ))}
      </select>
    </span>
  );
};

const AccountSettings = () => {
  const account = useAccount();
  const { accounts } = useAccounts();
  const [text, setText] = useState('');
  const [switchToLastAccount, setSwitchToLastAccount] = useState(false);

  const accountJson = useMemo(() => stringify({account: {...account, plebbit: undefined, karma: undefined, unreadNotificationCount: undefined}}), [account])

  const accountsOptions = accounts.map((account) => (
    <option key={account?.id} value={account?.name}>
      u/{account?.author?.shortAddress?.toLowerCase?.().substring(0, 8) || ''}
    </option>
  ));

  useEffect(() => {
    setText(accountJson)
  }, [accountJson])

  useEffect(() => {
    if (switchToLastAccount && accounts.length > 0) {
      const lastAccount = accounts[accounts.length - 1];
      setActiveAccount(lastAccount.name);
      setSwitchToLastAccount(false);
    }
  }, [accounts, switchToLastAccount]);

  const _createAccount = async () => {
    try {
      await createAccount();
    } catch (error) {
      if (error instanceof Error) {
        alert(error.message);
        console.log(error);
      } else {
        console.error('An unknown error occurred:', error);
      }
    }
    setSwitchToLastAccount(true);
  }

  const _deleteAccount = (accountName: string) => {
    if (!accountName) {
      return
    } else if (window.confirm(`Are you sure you want to delete ${accountName}?`)) {
      deleteAccount(accountName);
      setSwitchToLastAccount(true);
    } else {
      return
    }
  }

  const saveAccount = async () => {
    try {
      const newAccount = JSON.parse(text).account
      // force keeping the same id, makes it easier to copy paste
      await setAccount({...newAccount, id: account?.id})
      alert(`Saved ${newAccount.name}`)
    } catch (error) {
      if (error instanceof Error) {
        alert(error.message);
        console.log(error);
      } else {
        console.error('An unknown error occurred:', error);
      }
    }
  }

  const _importAccount = async () => {
    try {
      const newAccount = JSON.parse(text)
      await importAccount(text)
      setSwitchToLastAccount(true);
      alert(`Imported ${newAccount.account?.name}`)
    } catch (error) {
      if (error instanceof Error) {
        alert(error.message);
        console.log(error);
      } else {
        console.error('An unknown error occurred:', error);
      }
    }
  }

  return (
    <span className={styles.categorySettings}>
      <span className={styles.settingTitle}>account data</span>
      <div className={styles.accountData}>
        <textarea className={styles.textarea} value={text} onChange={(e) => setText(e.target.value)} autoCorrect="off" autoComplete='off' spellCheck='false' />
        <div className={styles.accountButtons}>
          <div>
            <button onClick={saveAccount}>Save</button> or <button onClick={() => setText(accountJson)}>Reset</button> changes
          </div>
          <div>
            <button onClick={() => _deleteAccount(account?.name)}>Delete</button> this account
          </div>
          <div>
            <button onClick={_importAccount}>Import</button> another account
          </div>
          <div>
            <button onClick={_createAccount}>Create</button> a new account
          </div>
        </div>
      </div>
      <br />
      <span className={styles.settingTitle}>account address</span>
      <div className={styles.accountAddress}>
        <select value={account?.name} onChange={(e) => setActiveAccount(e.target.value)}>{accountsOptions}</select> is the current account
      </div>
    </span>
  );
};

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
        <LanguageSettings />
      </div>
      <div className={styles.category}>
        <span className={styles.categoryTitle}>theme</span>
        <ThemeSettings />
      </div>
      <div className={styles.category}>
        <span className={styles.categoryTitle}>account</span>
        <AccountSettings />
      </div>
    </div>
  );
};

export default Settings;
