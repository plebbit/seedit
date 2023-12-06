import { useEffect, useState } from 'react';
import { setAccount, useAccount, useResolvedAuthorAddress } from '@plebbit/plebbit-react-hooks';
import { getShortAddress } from '@plebbit/plebbit-js';
import styles from './profile-settings.module.css';

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

  const [cryptoState, setCryptoState] = useState({
    cryptoAddress: '',
    cryptoAddressToResolve: '',
    checkingCryptoAddress: false,
    showResolvingMessage: true,
    resolveString: 'if the crypto address is resolved p2p',
    resolveClass: '',
  });

  const [savedCryptoAddress, setSavedCryptoAddress] = useState(false);

  const author = { ...account?.author, address: cryptoState.cryptoAddressToResolve };
  const { resolvedAddress, state, error, chainProvider } = useResolvedAuthorAddress({ author, cache: false });

  useEffect(() => {
    if (cryptoState.showResolvingMessage) {
      let resolveString = '';
      let resolveClass = '';

      if (state === 'failed') {
        resolveString = error instanceof Error ? `failed to resolve crypto address, error: ${error.message}` : 'cannot resolve crypto address, unknown error';
        resolveClass = styles.red;
      } else if (state === 'resolving') {
        resolveString = `resolving from ${chainProvider?.urls}`;
        resolveClass = styles.yellow;
      } else {
        return;
      }

      setCryptoState((prevState) => ({
        ...prevState,
        resolveString: resolveString,
        resolveClass: resolveClass,
      }));
    }
  }, [cryptoState.showResolvingMessage, state, error, chainProvider]);

  useEffect(() => {
    let resolveString = '';
    let resolveClass = '';

    if (resolvedAddress && resolvedAddress === account?.signer.address) {
      resolveString = `crypto address belongs to this account, address: ${getShortAddress(resolvedAddress)}`;
      resolveClass = styles.green;
    } else if (resolvedAddress && resolvedAddress !== account?.signer.address) {
      resolveString = `crypto address belongs to another account, address: ${getShortAddress(resolvedAddress)}`;
      resolveClass = styles.red;
    } else {
      return;
    }

    setCryptoState((prevState) => ({
      ...prevState,
      resolveString: resolveString,
      resolveClass: resolveClass,
      cryptoAddressToResolve: '',
      showResolvingMessage: false,
    }));
  }, [resolvedAddress, account?.signer.address]);

  const cryptoAddressInfo = () => {
    alert(
      'Change your account address to an ENS name you own: in your ENS name page on ens.domains, click on "Records", "Edit Records", "Add record", add "plebbit-author-address" as record name, add your full address as value (you can copy it from your account data) and save.',
    );
  };

  const saveCryptoAddress = async () => {
    if (!cryptoState.cryptoAddress || !cryptoState.cryptoAddress.includes('.')) {
      alert('Please enter a crypto address.');
      return;
    } else if (resolvedAddress && resolvedAddress !== account?.signer.address) {
      alert(`Cannot save resolved crypto address, it belongs to another account, address: ${resolvedAddress}`);
      return;
    } else if (resolvedAddress && resolvedAddress === account?.signer.address) {
      try {
        await setAccount({ ...account, author: { ...account?.author, address: cryptoState.cryptoAddress } });
        setCryptoState((prevState) => ({
          ...prevState,
          savedCryptoAddress: true,
          cryptoAddressToResolve: '',
          cryptoAddress: '',
          checkingCryptoAddress: false,
        }));
      } catch (error) {
        if (error instanceof Error) {
          alert(error.message);
          console.log(error);
        } else {
          console.error('An unknown error occurred:', error);
        }
      }
    }
  };

  const checkCryptoAddress = () => {
    if (!cryptoState.cryptoAddress || !cryptoState.cryptoAddress.includes('.')) {
      alert('Please enter a valid crypto address.');
      return;
    }
    setCryptoState((prevState) => ({
      ...prevState,
      cryptoAddressToResolve: cryptoState.cryptoAddress,
      checkingCryptoAddress: true,
      showResolvingMessage: true,
    }));
  };

  useEffect(() => {
    if (savedCryptoAddress) {
      setTimeout(() => {
        setSavedCryptoAddress(false);
      }, 2000);
    }
  }, [savedCryptoAddress]);

  return (
    <>
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
          <input
            type='text'
            placeholder='address.eth'
            value={cryptoState.cryptoAddress}
            onChange={(e) => setCryptoState((prevState) => ({ ...prevState, cryptoAddress: e.target.value }))}
          />
          <button className={styles.button} onClick={saveCryptoAddress}>
            save
          </button>
          {savedCryptoAddress && <span className={styles.saved}>Saved.</span>}
        </div>
        <div className={styles.checkCryptoAddress}>
          <button className={styles.button} onClick={checkCryptoAddress}>
            check
          </button>{' '}
          <span className={cryptoState.resolveClass}>{cryptoState.resolveString}</span>
        </div>
        <div></div>
      </div>
    </>
  );
};

export default ProfileSettings;
