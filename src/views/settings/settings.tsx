import { useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { createAccount, deleteAccount, importAccount, setAccount, setActiveAccount, useAccount, useAccounts } from '@plebbit/plebbit-react-hooks';
import stringify from 'json-stringify-pretty-compact';
import styles from './settings.module.css';
import ThemeSettings from './theme-settings';
import LanguageSettings from './language-settings';
import ProfileSettings from './profile-settings';

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
        <AccountSettings />
      </div>
    </div>
  );
};

export default Settings;
