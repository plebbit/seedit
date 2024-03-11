import { useState } from 'react';
import { Account, setAccount, useAccount } from '@plebbit/plebbit-react-hooks';
import styles from './wallet-settings.module.css';
import { Trans, useTranslation } from 'react-i18next';

interface Wallet {
  chainTicker: string;
  address: string;
  timestamp: number;
  signature: string;
}

const getWalletMessageToSign = (authorAddress: string, timestamp: number, address: string): string => {
  const messageToSign = {
    domainSeparator: 'plebbit-author-wallet',
    authorAddress,
    timestamp,
    address,
  };
  return JSON.stringify(messageToSign);
};

const CryptoWalletsForm = ({ account }: { account: Account | undefined }) => {
  const { t } = useTranslation();

  if (!account) {
    throw Error('CryptoWalletsForm account prop must be defined');
  }
  const authorAddress = account?.author?.address;
  const defaultWalletObject: Wallet = { chainTicker: '', address: '', timestamp: 0, signature: '' };

  // Use a separate variable to avoid referencing 'defaultWalletsArray' in its own initializer
  const walletsFromAccount = Object.keys(account?.author?.wallets || {}).map(
    (chainTicker): Wallet => ({
      chainTicker,
      address: account.author.wallets[chainTicker].address,
      timestamp: account.author.wallets[chainTicker].timestamp,
      signature: account.author.wallets[chainTicker].signature.signature,
    }),
  );

  // Now decide whether to add the default object
  const defaultWalletsArray: Wallet[] = walletsFromAccount.length ? walletsFromAccount : [defaultWalletObject];

  const [walletsArray, setWalletsArray] = useState<Wallet[]>(defaultWalletsArray);
  const setWalletsArrayProperty = (index: number, property: keyof Wallet, value: string | number) => {
    const newArray = [...walletsArray];
    newArray[index] = { ...newArray[index], [property]: value };
    setWalletsArray(newArray);
  };

  const [hasCopied, setHasCopied] = useState(false);

  const copyMessageToSign = (wallet: any, index: number) => {
    if (!wallet.chainTicker) {
      return alert('missing chain ticker');
    }
    if (!wallet.address) {
      return alert('missing address');
    }
    const timestamp = wallet.timestamp || Math.floor(Date.now() / 1000);
    const messageToSign = getWalletMessageToSign(authorAddress, timestamp, wallet.address);
    if (timestamp !== wallet.timestamp) {
      setWalletsArrayProperty(index, 'timestamp', timestamp);
    }
    navigator.clipboard.writeText(messageToSign);
    setHasCopied(true);
    setTimeout(() => {
      setHasCopied(false);
    }, 2000);
  };

  const walletsInputs = walletsArray.map((wallet, index) => (
    <>
      <div className={styles.walletTitle}>wallet #{index + 1}</div>
      <div key={index} className={styles.walletBox}>
        <div className={styles.walletField}>
          <div className={styles.walletFieldTitle}>{t('chain_ticker')}</div>
          <input onChange={(e) => setWalletsArrayProperty(index, 'chainTicker', e.target.value)} value={wallet.chainTicker} placeholder='eth/sol/avax' />
        </div>
        <div className={styles.walletField}>
          <div className={styles.walletFieldTitle}>{t('wallet_address')}</div>
          <input onChange={(e) => setWalletsArrayProperty(index, 'address', e.target.value)} value={wallet.address} placeholder='0x...' />
        </div>
        <div className={`${styles.walletField} ${styles.copyMessage}`}>
          <Trans
            i18nKey='copy_message_etherscan'
            values={{ copy: hasCopied ? t('copied') : t('copy') }}
            components={{
              1: <button onClick={() => copyMessageToSign(wallet, index)} />,
              // eslint-disable-next-line
              2: <a href='https://etherscan.io/verifiedSignatures' target='_blank' rel='noopener noreferrer' />,
            }}
          />
        </div>
        <div className={styles.walletField}>
          <div className={styles.walletFieldTitle}>{t('paste_signature')}</div>
          <input onChange={(e) => setWalletsArrayProperty(index, 'signature', e.target.value)} value={wallet.signature} placeholder='0x...' />
        </div>
        <button onClick={() => setWalletsArray([...walletsArray.slice(0, index), ...walletsArray.slice(index + 1)])}>remove</button>
      </div>
    </>
  ));

  const save = () => {
    const wallets: { [key: string]: { address: string; timestamp: number; signature: { signature: string; type: string } } } = {};
    walletsArray.forEach((wallet) => {
      if (wallet.chainTicker && wallet.address && wallet.signature && wallet.timestamp) {
        wallets[wallet.chainTicker] = {
          address: wallet.address,
          timestamp: wallet.timestamp,
          signature: {
            signature: wallet.signature,
            type: 'eip191',
          },
        };
      }
    });
    setAccount({ ...account, author: { ...account.author, wallets } });
    alert(`saved`);
  };

  return (
    <>
      <div className={styles.addWallet}>
        <button onClick={() => setWalletsArray([...walletsArray, defaultWalletObject])}>add</button> a crypto wallet
      </div>
      {walletsInputs}
      {walletsArray.length > 0 && (
        <div className={styles.saveWallets}>
          <button onClick={save}>save</button> wallet(s) to account
        </div>
      )}
    </>
  );
};

const WalletSettings = () => {
  const account = useAccount();
  return account && <CryptoWalletsForm account={account} />;
};

export default WalletSettings;
