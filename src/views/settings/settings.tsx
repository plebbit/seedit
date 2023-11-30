import { useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { createAccount, deleteAccount, importAccount, setAccount, setActiveAccount, useAccount, useAccounts, useResolvedAuthorAddress } from '@plebbit/plebbit-react-hooks';
import stringify from 'json-stringify-pretty-compact';
import useTheme from '../../hooks/use-theme';
import styles from './settings.module.css';

// prettier-ignore
const availableLanguages = ['ar', 'bn', 'cs', 'da', 'de', 'el', 'en', 'es', 'fa', 'fi', 'fil', 'fr', 'he', 'hi', 'hu', 'id', 'it', 'ja', 'ko', 'mr', 'nl', 'no', 'pl', 'pt', 'ro', 'ru', 'sq', 'sv', 'te', 'th', 'tr', 'uk', 'ur', 'vi', 'zh'];

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

const ProfileSettings = () => {
  const account = useAccount();

  const [username, setUsername] = useState(account?.author.displayName || '');
  const [savedUsername, setSavedUsername] = useState(false);

  useEffect(() => {
    if (savedUsername) {
      setTimeout(() => {
        setSavedUsername(false);
      }, 2000);
    }
  }, [savedUsername]);

  const saveUsername = async () => {
    try {
      await setAccount({ ...account, author: { ...account?.author, displayName: username } });
    } catch (error) {
      if (error instanceof Error) {
        alert(error.message);
        console.log(error);
      } else {
        console.error('An unknown error occurred:', error);
      }
    }
    setSavedUsername(true);
  };

  const [cryptoAddress, setCryptoAddress] = useState(account?.author.displayName || '');
  const [savedCryptoAddress, setSavedCryptoAddress] = useState(false);
  const [checkCryptoAddress, setCheckCryptoAddress] = useState(false);
  const author = { ...account?.author, address: cryptoAddress };
  const { state, error, chainProvider } = useResolvedAuthorAddress({ author, cache: false });
  const resolvedAddressInfoMessageClass = `${state === 'succeeded' ? styles.resolvedMessageSuccess : state === 'failed' ? styles.resolvedMessageFailed : state === 'resolving' ? styles.resolvedMessageResolving : ''}`

  const resolvedAddressInfoMessage = useMemo(() => {
    if (state === 'succeeded') {
      return 'crypto address resolved successfully';
    } else if (state === 'failed') {
      if (error instanceof Error) {
        return `failed to resolve crypto address, ${error.message}`;
      } else {
        return 'cannot resolve crypto address';
      }
    } else if (state === 'resolving') {
      return `resolving from ${chainProvider?.urls}`;
    } else {
      return '';
    }
  }, [state, error, chainProvider]);

  const cryptoAddressInfo = () => {
    alert(
      'Change your account address to an ENS name you own: in your ENS name page on ens.domains, click on "Records", "Edit Records", "Add record", add "plebbit-author-address" as record name, add your full address as value (you can copy it from your account data) and save.',
    );
  };

  const saveCryptoAddress = async () => {
    if (state !== 'succeeded') {
      alert('Cannot save crypto address, it is not resolved');
      return;
    }

    try {
      await setAccount({ ...account, author: { ...account?.author, address: cryptoAddress } });
    } catch (error) {
      if (error instanceof Error) {
        alert(error.message);
        console.log(error);
      } else {
        console.error('An unknown error occurred:', error);
      }
    }
    setSavedCryptoAddress(true);
  }

  useEffect(() => {
    if (savedCryptoAddress) {
      setTimeout(() => {
        setSavedCryptoAddress(false);
      }, 2000);
    }
  }, [savedCryptoAddress]);

  return (
    <span className={styles.categorySettings}>
      <span className={styles.settingTitle}>display name</span>
      <div className={styles.usernameInput}>
        <input type='text' placeholder='My Name' value={username} onChange={(e) => setUsername(e.target.value)} />
        <button className={styles.button} onClick={saveUsername}>
          save
        </button>
        {savedUsername && <span className={styles.saved}>Saved.</span>}
      </div>
      <div className={styles.cryptoAddressSetting}>
        <span className={styles.settingTitle}>crypto address</span>
        <button className={styles.infoButton} onClick={cryptoAddressInfo}>
          ?
        </button>
        <div className={styles.usernameInput}>
          <input type='text' placeholder='address.eth' onChange={(e) => setCryptoAddress(e.target.value)} />
          <button className={styles.button} onClick={saveCryptoAddress}>save</button>
          {savedCryptoAddress && <span className={styles.saved}>Saved.</span>}
        </div>
        <div className={styles.checkCryptoAddress}>
        <button className={styles.button} onClick={() => setCheckCryptoAddress(true)}>check</button>{' '}
          {checkCryptoAddress ? (
            <span className={resolvedAddressInfoMessageClass}>{resolvedAddressInfoMessage}</span>
          ) : 'if the crypto address is resolved p2p'}
        </div>
        <div></div>
      </div>
    </span>
  );
};

const AccountSettings = () => {
  const account = useAccount();
  const { accounts } = useAccounts();
  const [text, setText] = useState('');
  const [switchToLastAccount, setSwitchToLastAccount] = useState(false);

  const accountJson = useMemo(() => stringify({ account: { ...account, plebbit: undefined, karma: undefined, unreadNotificationCount: undefined } }), [account]);

  const accountsOptions = accounts.map((account) => (
    <option key={account?.id} value={account?.name}>
      u/{account?.author?.shortAddress}
    </option>
  ));

  useEffect(() => {
    setText(accountJson);
  }, [accountJson]);

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
  };

  const _deleteAccount = (accountName: string) => {
    if (!accountName) {
      return;
    } else if (window.confirm(`Are you sure you want to delete ${accountName}?`)) {
      deleteAccount(accountName);
      setSwitchToLastAccount(true);
    } else {
      return;
    }
  };

  const saveAccount = async () => {
    try {
      const newAccount = JSON.parse(text).account;
      // force keeping the same id, makes it easier to copy paste
      await setAccount({ ...newAccount, id: account?.id });
      alert(`Saved ${newAccount.name}`);
    } catch (error) {
      if (error instanceof Error) {
        alert(error.message);
        console.log(error);
      } else {
        console.error('An unknown error occurred:', error);
      }
    }
  };

  const _importAccount = async () => {
    try {
      const newAccount = JSON.parse(text);
      await importAccount(text);
      setSwitchToLastAccount(true);
      alert(`Imported ${newAccount.account?.name}`);
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
    <span className={styles.categorySettings}>
      <div className={styles.accountAddress}>
        <select value={account?.name} onChange={(e) => setActiveAccount(e.target.value)}>
          {accountsOptions}
        </select>{' '}
        is the current account
      </div>
      <span className={styles.settingTitle}>account data</span>
      <div className={styles.accountData}>
        <textarea className={styles.textarea} value={text} onChange={(e) => setText(e.target.value)} autoCorrect='off' autoComplete='off' spellCheck='false' />
        <div className={styles.accountButtons}>
          <div>
            <button onClick={saveAccount}>Save</button> or <button onClick={() => setText(accountJson)}>Reset</button> changes
          </div>
          <div>
            <button onClick={() => _deleteAccount(account?.name)}>Delete</button> this account
          </div>
          <div>
            <button onClick={_importAccount}>Import</button> other account data
          </div>
          <div>
            <button onClick={_createAccount}>Create</button> a new account
          </div>
        </div>
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
        <span className={styles.categoryTitle}>profile</span>
        <ProfileSettings />
      </div>
      <div className={styles.category}>
        <span className={styles.categoryTitle}>account</span>
        <AccountSettings />
      </div>
    </div>
  );
};

export default Settings;
