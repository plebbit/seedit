import { useEffect, useMemo, useState } from 'react';
import { setAccount, useAccount, useAuthorAvatar } from '@plebbit/plebbit-react-hooks';
import { useTranslation } from 'react-i18next';
import styles from './avatar-settings.module.css';

interface AvatarSettingsProps {
  areSettingsShown?: boolean;
  avatar?: any;
  showSettings?: () => void;
}

const AvatarPreview = ({ avatar, showSettings, areSettingsShown }: AvatarSettingsProps) => {
  const { t } = useTranslation();
  const account = useAccount();
  let author = useMemo(() => ({ ...account?.author, avatar }), [account, avatar]);

  const { imageUrl, state, error } = useAuthorAvatar({ author });

  // if avatar already set, and user hasn't typed anything yet, preview already set author
  if (account?.author?.avatar && !avatar?.chainTicker && !avatar?.address && !avatar?.id && !avatar?.signature) {
    author = account.author;
  }

  // not enough data to preview yet
  if (!author?.avatar?.address && !author?.avatar?.signature) {
    return;
  }

  const stateText = state !== 'succeeded' ? `${state}...` : undefined;

  return (
    <>
      <div className={styles.avatar}>
        {imageUrl && state !== 'initializing' ? (
          <img src={imageUrl} alt='avatar' />
        ) : (
          <span className={styles.emptyAvatar} onClick={showSettings}>
            {areSettingsShown ? '–' + t('hide') : '+' + t('add')}
          </span>
        )}
      </div>
      <div className={styles.state}>
        {stateText} {error?.message}
      </div>
    </>
  );
};

const AvatarSettings = () => {
  const [showSettings, setShowSettings] = useState(false);

  const account = useAccount();

  const authorAddress = account?.author?.address;
  const [chainTicker, setChainTicker] = useState(account?.author?.avatar?.chainTicker);
  const [tokenAddress, setTokenAddress] = useState(account?.author?.avatar?.address);
  const [tokenId, setTokenId] = useState(account?.author?.avatar?.id);
  const [timestamp, setTimestamp] = useState(account?.author?.avatar?.timestamp);
  const [signature, setSignature] = useState(account?.author?.avatar?.signature?.signature);

  const getNftMessageToSign = (authorAddress: string, timestamp: number, tokenAddress: string, tokenId: string) => {
    let messageToSign: any = {};
    // the property names must be in this order for the signature to match
    // insert props one at a time otherwise babel/webpack will reorder
    messageToSign.domainSeparator = 'plebbit-author-avatar';
    messageToSign.authorAddress = authorAddress;
    messageToSign.timestamp = timestamp;
    messageToSign.tokenAddress = tokenAddress;
    messageToSign.tokenId = String(tokenId); // must be a type string, not number
    // use plain JSON so the user can read what he's signing
    messageToSign = JSON.stringify(messageToSign);
    return messageToSign;
  };

  const [hasCopied, setHasCopied] = useState(false);
  useEffect(() => {
    if (hasCopied) {
      setTimeout(() => setHasCopied(false), 2000);
    }
  }, [hasCopied]);

  const copyMessageToSign = () => {
    if (!chainTicker) {
      return alert('missing chain ticker');
    }
    if (!tokenAddress) {
      return alert('missing token address');
    }
    if (!tokenId) {
      return alert('missing token id');
    }
    const newTimestamp = Math.floor(Date.now() / 1000);
    const messageToSign = getNftMessageToSign(authorAddress, newTimestamp, tokenAddress, tokenId);
    // update timestamp every time the user gets a new message to sign
    setTimestamp(newTimestamp);
    navigator.clipboard.writeText(messageToSign);
    setHasCopied(true);
  };

  // how to resolve and verify NFT signatures https://github.com/plebbit/plebbit-js/blob/master/docs/nft.md
  const avatar = {
    chainTicker: chainTicker?.toLowerCase() || account?.author?.avatar?.chainTicker,
    timestamp,
    address: tokenAddress || account?.author?.avatar?.address,
    id: tokenId || account?.author?.avatar?.id,
    signature: {
      signature: signature || account?.author?.avatar?.signature?.signature,
      type: 'eip191',
    },
  };

  const save = () => {
    if (!chainTicker) {
      return alert('missing chain ticker');
    }
    if (!tokenAddress) {
      return alert('missing token address');
    }
    if (!tokenId) {
      return alert('missing token id');
    }
    if (!signature) {
      return alert('missing signature');
    }
    setAccount({ ...account, author: { ...account?.author, avatar } });
    alert(`saved`);
  };

  return (
    <div className={styles.avatarSettings}>
      <AvatarPreview avatar={avatar} showSettings={() => setShowSettings(!showSettings)} areSettingsShown={showSettings} />
      {showSettings && (
        <div className={styles.avatarSettingsForm}>
          <div className={styles.avatarSettingInput}>
            <span className={styles.settingTitle}>chain ticker</span>
            <input
              type='text'
              placeholder='eth/sol/avax'
              autoCorrect='off'
              autoComplete='off'
              spellCheck='false'
              defaultValue={account?.author?.avatar?.chainTicker}
              onChange={(e) => setChainTicker(e.target.value)}
            />
          </div>
          <div className={styles.avatarSettingInput}>
            <span className={styles.settingTitle}>token address</span>
            <input
              type='text'
              placeholder='0x...'
              autoCorrect='off'
              autoComplete='off'
              spellCheck='false'
              defaultValue={account?.author?.avatar?.address}
              onChange={(e) => setTokenAddress(e.target.value)}
            />
          </div>
          <div className={styles.avatarSettingInput}>
            <span className={styles.settingTitle}>token id</span>
            <input
              type='text'
              placeholder='Token ID'
              autoCorrect='off'
              autoComplete='off'
              spellCheck='false'
              defaultValue={account?.author?.avatar?.id}
              onChange={(e) => setTokenId(e.target.value)}
            />
          </div>
          <div className={styles.copyMessage}>
            <button onClick={copyMessageToSign}>{hasCopied ? 'copied' : 'copy'}</button> message to sign
          </div>
          <div className={styles.pasteSignature}>
            <span className={styles.settingTitle}>paste signature</span>
            <input
              type='text'
              placeholder='0x...'
              autoCorrect='off'
              autoComplete='off'
              spellCheck='false'
              defaultValue={account?.author?.avatar?.signature?.signature}
              onChange={(e) => setSignature(e.target.value)}
            />
            <button onClick={save}>save</button>
          </div>
        </div>
      )}
    </div>
  );
};

export default AvatarSettings;
