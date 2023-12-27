import { useEffect, useMemo, useState } from 'react';
import { createAccount, deleteAccount, exportAccount, importAccount, setAccount, setActiveAccount, useAccount, useAccounts } from '@plebbit/plebbit-react-hooks';
import stringify from 'json-stringify-pretty-compact';
import { useTranslation } from 'react-i18next';
import styles from './account-settings.module.css';

const AccountSettings = () => {
  const { t } = useTranslation();
  const account = useAccount();
  const { accounts } = useAccounts();
  const [text, setText] = useState('');
  const [switchToLastAccount, setSwitchToLastAccount] = useState(false);

  const accountJson = useMemo(
    () => stringify({ account: { ...account, plebbit: undefined, karma: undefined, plebbitReactOptions: undefined, unreadNotificationCount: undefined } }),
    [account],
  );

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
    // Create a file input element
    const fileInput = document.createElement('input');
    fileInput.type = 'file';
    fileInput.accept = '.json';

    // Handle file selection
    fileInput.onchange = async (event) => {
      try {
        const files = (event.target as HTMLInputElement).files;
        if (!files || files.length === 0) {
          throw new Error('No file selected.');
        }
        const file = files[0];

        // Read the file content
        const reader = new FileReader();
        reader.onload = async (e) => {
          const fileContent = e.target!.result; // Non-null assertion
          if (typeof fileContent !== 'string') {
            throw new Error('File content is not a string.');
          }
          const newAccount = JSON.parse(fileContent);
          await importAccount(fileContent);
          setSwitchToLastAccount(true);
          alert(`Imported ${newAccount.account?.name}`);
        };
        reader.readAsText(file);
      } catch (error) {
        if (error instanceof Error) {
          alert(error.message);
          console.log(error);
        } else {
          console.error('An unknown error occurred:', error);
        }
      }
    };

    // Trigger file selection dialog
    fileInput.click();
  };

  const _exportAccount = async () => {
    try {
      const accountString = await exportAccount();
      const accountObject = JSON.parse(accountString);
      const formattedAccountJson = JSON.stringify(accountObject, null, 2);

      // Create a Blob from the JSON string
      const blob = new Blob([formattedAccountJson], { type: 'application/json' });

      // Create a URL for the Blob
      const fileUrl = URL.createObjectURL(blob);

      // Create a temporary download link
      const link = document.createElement('a');
      link.href = fileUrl;
      link.download = `${account.name}.json`;

      // Append the link, trigger the download, then remove the link
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      // Release the Blob URL
      URL.revokeObjectURL(fileUrl);
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
        {t('is_current_account')}
      </div>
      <span className={styles.settingTitle}>account data preview</span>
      <div className={styles.accountData}>
        <textarea className={styles.textarea} value={text} onChange={(e) => setText(e.target.value)} autoCorrect='off' autoComplete='off' spellCheck='false' />
        <div className={styles.accountButtons}>
          <div>
            <button onClick={saveAccount}>{t('save')}</button> {t('or')} <button onClick={() => setText(accountJson)}>{t('reset')}</button> {t('changes')}
          </div>
          <div>
            <button onClick={_createAccount}>Create</button> a new account
          </div>
          <div>
            <button onClick={_importAccount}>Import</button> full account data
          </div>
          <div>
            <button onClick={_exportAccount}>Export</button> full account data
          </div>
          <div className={styles.deleteAccountBox}>
            <button onClick={() => _deleteAccount(account?.name)}>Delete</button> this account
          </div>
        </div>
      </div>
    </span>
  );
};

export default AccountSettings;
