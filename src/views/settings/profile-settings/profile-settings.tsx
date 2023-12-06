import { useEffect, useState } from "react";
import { setAccount, useAccount, useResolvedAuthorAddress } from "@plebbit/plebbit-react-hooks";
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

  const [cryptoAddress, setCryptoAddress] = useState('');
  const [cryptoAddressToResolve, setCryptoAddressToResolve] = useState('');
  const [checkingCryptoAddress, setCheckingCryptoAddress] = useState(false);
  const [showResolvingMessage, setShowResolvingMessage] = useState(true);
  const [savedCryptoAddress, setSavedCryptoAddress] = useState(false);
  const [resolveString, setResolveString] = useState('');
  const [resolveClass, setResolveClass] = useState('');

  const author = { ...account?.author, address: cryptoAddressToResolve };
  const {resolvedAddress, state, error, chainProvider } = useResolvedAuthorAddress({ author, cache: false });

  useEffect(() => {
    if (showResolvingMessage) {
      if (state === 'failed') {
        if (error instanceof Error) {
          setResolveString('failed to resolve crypto address, error: ' + error.message)
        } else {
          setResolveString('cannot resolve crypto address, unknown error')
        }
        setResolveClass(styles.red)
      } else if (state === 'resolving') {
        setResolveString(`resolving from ${chainProvider?.urls}`)
        setResolveClass(styles.yellow)
      }
    }
  }, [showResolvingMessage, state, error, chainProvider]);

  useEffect(() => {
    if (resolvedAddress && resolvedAddress === account?.signer.address) {
      setResolveString('crypto address belongs to this account, address: ' + getShortAddress(resolvedAddress));
      setResolveClass(styles.green);
    } else if (resolvedAddress && resolvedAddress !== account?.signer.address) {
      setResolveString('crypto address belongs to another account, address: ' + getShortAddress(resolvedAddress));
      setResolveClass(styles.red);
    }
    setCryptoAddressToResolve('');
    setShowResolvingMessage(false);
  }, [checkingCryptoAddress, resolvedAddress, account?.signer.address]);
  

  const cryptoAddressInfo = () => {
    alert(
      'Change your account address to an ENS name you own: in your ENS name page on ens.domains, click on "Records", "Edit Records", "Add record", add "plebbit-author-address" as record name, add your full address as value (you can copy it from your account data) and save.',
    );
  };

  const saveCryptoAddress = async () => {
    if (!cryptoAddress) {
      alert('Please enter a crypto address.');
      return;
    } else if (resolvedAddress && resolvedAddress !== account?.signer.address) {
      alert('Cannot save resolved crypto address, it belongs to another account, address: ' + resolvedAddress);
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
    setCryptoAddressToResolve('');
    setCryptoAddress('');
    setCheckingCryptoAddress(false);
  };

  const checkCryptoAddress = () => {;
    if (!cryptoAddress) {
      alert('Please enter a crypto address.');
      return;
    }
    setCryptoAddressToResolve(cryptoAddress);
    setCheckingCryptoAddress(true);
    setShowResolvingMessage(true);
  }

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
          <input type='text' placeholder='address.eth' value={cryptoAddress} onChange={(e) => setCryptoAddress(e.target.value)} />
          <button className={styles.button} onClick={saveCryptoAddress}>
            save
          </button>
          {savedCryptoAddress && <span className={styles.saved}>Saved.</span>}
        </div>
        <div className={styles.checkCryptoAddress}>
          <button className={styles.button} onClick={checkCryptoAddress}>
            check
          </button>{' '}
          {checkingCryptoAddress ? <span className={resolveClass}>{resolveString}</span> : 'if the crypto address is resolved p2p'}
        </div>
        <div></div>
      </div>
    </>
  );
};

export default ProfileSettings;