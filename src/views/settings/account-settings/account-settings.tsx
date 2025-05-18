import { useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { Trans, useTranslation } from 'react-i18next';
import { createAccount, deleteAccount, exportAccount, importAccount, setActiveAccount, useAccount, useAccounts } from '@plebbit/plebbit-react-hooks';
import styles from './account-settings.module.css';

const CreateAccountButton = () => {
  const { accounts } = useAccounts();
  const switchToNewAccountRef = useRef(false);

  useEffect(() => {
    if (switchToNewAccountRef.current && accounts.length > 0) {
      const lastAccount = accounts[accounts.length - 1];
      setActiveAccount(lastAccount.name);
      switchToNewAccountRef.current = false;
    }
  }, [accounts]);

  const handleCreateAccount = async () => {
    try {
      switchToNewAccountRef.current = true;
      await createAccount();
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
    <Trans
      i18nKey='create_new_account'
      components={{
        1: <button key='createNewAccountButton' onClick={handleCreateAccount} />,
      }}
    />
  );
};

const ImportAccountButton = () => {
  const handleImportAccount = async () => {
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
          try {
            const fileContent = e.target!.result;
            if (typeof fileContent !== 'string') {
              throw new Error('File content is not a string.');
            }
            const newAccount = JSON.parse(fileContent);
            await importAccount(fileContent);

            // Store the imported account's address
            if (newAccount.account?.author?.address) {
              localStorage.setItem('importedAccountAddress', newAccount.account.author.address);
            }

            // Set the new account as active before reloading
            if (newAccount.account?.name) {
              await setActiveAccount(newAccount.account.name);
            }

            alert(`Imported ${newAccount.account?.name}`);
            window.location.reload();
          } catch (error) {
            if (error instanceof Error) {
              alert(error.message);
              console.log(error);
            } else {
              console.error('An unknown error occurred:', error);
            }
          }
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

  return (
    <Trans
      i18nKey='import_account_backup'
      components={{
        1: <button key='importAccountButton' onClick={handleImportAccount} />,
      }}
    />
  );
};

const ExportAccountButton = () => {
  const account = useAccount();

  const handleExportAccount = async () => {
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
    <Trans
      i18nKey='export_account_backup'
      components={{
        1: <button key='exportAccountButton' onClick={handleExportAccount} />,
      }}
    />
  );
};

const AccountSettings = () => {
  const { t } = useTranslation();

  const account = useAccount();
  const { accounts } = useAccounts();

  const accountsOptions = accounts.map((account) => (
    <option key={account?.id} value={account?.name}>
      u/{account?.author?.shortAddress}
    </option>
  ));

  const _deleteAccount = (accountName: string) => {
    if (!accountName) {
      return;
    } else if (window.confirm(t('delete_confirm', { value: accountName, interpolation: { escapeValue: false } }))) {
      if (window.confirm(t('double_confirm'))) {
        deleteAccount(accountName);
      }
    }
  };

  return (
    <span className={styles.categorySettings}>
      <div className={styles.accountAddress}>
        <select value={account?.name} onChange={(e) => setActiveAccount(e.target.value)}>
          {accountsOptions}
        </select>
        <Link to='/settings/account-data'>{t('edit')}</Link>
      </div>
      <div className={styles.createAccount}>
        <CreateAccountButton />
      </div>
      <div className={styles.accountData}>
        <div className={styles.accountButtons}>
          <div>
            <ImportAccountButton />
          </div>
          <div>
            <ExportAccountButton />
          </div>
          <div className={styles.deleteAccountBox}>
            <Trans
              i18nKey='delete_this_account'
              components={{
                1: <button key='deleteAccountButton' onClick={() => _deleteAccount(account?.name)} />,
              }}
            />
          </div>
        </div>
      </div>
    </span>
  );
};

export default AccountSettings;
