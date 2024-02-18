import { useEffect, useState } from 'react';
import { setAccount, useAccount, useResolvedAuthorAddress } from '@plebbit/plebbit-react-hooks';
import { Trans, useTranslation } from 'react-i18next';
import styles from './address-settings.module.css';

const AddressSettings = () => {
  const { t } = useTranslation();
  const account = useAccount();

  const [cryptoState, setCryptoState] = useState({
    cryptoAddress: '',
    checkingCryptoAddress: false,
    showResolvingMessage: false,
    resolveString: t('crypto_address_verification'),
    resolveClass: '',
  });

  const [savedCryptoAddress, setSavedCryptoAddress] = useState(false);

  const author = { ...account?.author, address: cryptoState.cryptoAddress };
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

    if (resolvedAddress && resolvedAddress === account?.signer?.address) {
      resolveString = t('crypto_address_yours');
      resolveClass = styles.green;
    } else if (resolvedAddress && resolvedAddress !== account?.signer?.address) {
      resolveString = t('crypto_address_not_yours');
      resolveClass = styles.red;
    } else {
      return;
    }

    setCryptoState((prevState) => ({
      ...prevState,
      resolveString: resolveString,
      resolveClass: resolveClass,
      showResolvingMessage: false,
    }));
  }, [resolvedAddress, account?.signer?.address, t]);

  const cryptoAddressInfo = () => {
    alert(
      'Change your account address to an ENS name you own: in your ENS name page on ens.domains, click on "Records", "Edit Records", "Add record", add "plebbit-author-address" as record name, add your full address as value (you can copy it from your account data) and save.',
    );
  };

  const saveCryptoAddress = async () => {
    if (!cryptoState.cryptoAddress || !cryptoState.cryptoAddress.includes('.')) {
      alert(t('enter_crypto_address'));
      return;
    } else if (resolvedAddress && resolvedAddress !== account?.signer?.address) {
      alert(t('crypto_address_not_yours'));
      return;
    } else if (cryptoState.cryptoAddress && !resolvedAddress) {
      alert(t('crypto_address_not_resolved'));
      return;
    } else if (resolvedAddress && resolvedAddress === account?.signer?.address) {
      try {
        await setAccount({ ...account, author: { ...account?.author, address: cryptoState.cryptoAddress } });
        setCryptoState((prevState) => ({
          ...prevState,
          savedCryptoAddress: true,
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
      setSavedCryptoAddress(true);
      setCryptoState((prevState) => ({
        ...prevState,
        checkingCryptoAddress: false,
        showResolvingMessage: false,
        resolveString: t('crypto_address_verification'),
        resolveClass: '',
      }));
    }
  };

  const checkCryptoAddress = () => {
    if (!cryptoState.cryptoAddress || !cryptoState.cryptoAddress.includes('.')) {
      alert(t('enter_crypto_address'));
      return;
    }
    setCryptoState((prevState) => ({
      ...prevState,
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
    <div className={styles.addressSettings}>
      <div className={styles.copyAddressSetting}>
        <button onClick={() => navigator.clipboard.writeText(account?.signer?.address)}>{t('copy')}</button> plebbit-author-address
      </div>
      <div className={styles.cryptoAddressSetting}>
        <span className={styles.settingTitle}>{t('crypto_address')}</span>
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
            {t('save')}
          </button>
          {savedCryptoAddress && <span className={styles.saved}>{t('saved')}</span>}
        </div>
        <div className={styles.checkCryptoAddress}>
          <button className={styles.button} onClick={checkCryptoAddress}>
            {t('check')}
          </button>{' '}
          <span className={cryptoState.resolveClass}>{cryptoState.resolveString}</span>
        </div>
        <div></div>
      </div>
    </div>
  );
};

export default AddressSettings;
