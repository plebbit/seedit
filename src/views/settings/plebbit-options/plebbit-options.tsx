import { useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { setAccount, useAccount, usePlebbitRpcSettings } from '@plebbit/plebbit-react-hooks';
import styles from './plebbit-options.module.css';

const IPFSGatewaysSettings = () => {
  const { t } = useTranslation();
  const account = useAccount();
  const { plebbitOptions, mediaIpfsGatewayUrl } = account || {};
  const { ipfsGatewayUrls } = plebbitOptions || {};
  const plebbitRpc = usePlebbitRpcSettings();
  const isConnectedToRpc = plebbitRpc?.state === 'succeeded';
  const ipfsGatewayUrlsDefaultValue = ipfsGatewayUrls?.join('\n');
  const ipfsGatewayUrlsRef = useRef<HTMLTextAreaElement>(null);
  const mediaIpfsGatewayUrlRef = useRef<HTMLInputElement>(null);

  const handleSave = async () => {
    const ipfsGatewayUrls = ipfsGatewayUrlsRef.current?.value.split('\n').map((url) => url.trim());
    const mediaIpfsGatewayUrl = mediaIpfsGatewayUrlRef.current?.value.trim();

    try {
      await setAccount({ ...account, mediaIpfsGatewayUrl, plebbitOptions: { ...plebbitOptions, ipfsGatewayUrls } });
      alert('ipfs gateways saved.');
    } catch (e) {
      if (e instanceof Error) {
        alert('error saving ipfs gateways: ' + e.message);
        console.log(e);
      } else {
        alert('error');
      }
    }
  };

  return (
    <div className={styles.ipfsGatewaysSettings}>
      <div className={styles.ipfsGatewaysSetting}>
        <textarea
          defaultValue={ipfsGatewayUrlsDefaultValue}
          ref={ipfsGatewayUrlsRef}
          disabled={isConnectedToRpc}
          autoCorrect='off'
          autoComplete='off'
          spellCheck='false'
        />
        <button onClick={handleSave} disabled={isConnectedToRpc}>
          {t('save')}
        </button>
      </div>
      <span className={styles.settingTitle}>nft profile pics gateway</span>
      <div>
        <input type='text' defaultValue={mediaIpfsGatewayUrl} ref={mediaIpfsGatewayUrlRef} disabled={isConnectedToRpc} />
      </div>
    </div>
  );
};

const PubsubProvidersSettings = () => {
  const { t } = useTranslation();
  const account = useAccount();
  const { plebbitOptions } = account || {};
  const { pubsubHttpClientsOptions } = plebbitOptions || {};
  const plebbitRpc = usePlebbitRpcSettings();
  const isConnectedToRpc = plebbitRpc?.state === 'succeeded';
  const pubsubProvidersDefaultValue = pubsubHttpClientsOptions?.join('\n');
  const pubsubProvidersRef = useRef<HTMLTextAreaElement>(null);

  const handleSave = async () => {
    const pubsubHttpClientsOptions = pubsubProvidersRef.current?.value.split('\n').map((url) => url.trim());

    try {
      await setAccount({ ...account, plebbitOptions: { ...plebbitOptions, pubsubHttpClientsOptions } });
      alert('pubsub providers saved.');
    } catch (e) {
      if (e instanceof Error) {
        alert('error saving pubsub providers: ' + e.message);
        console.log(e);
      } else {
        alert('error');
      }
    }
  };

  return (
    <div className={styles.pubsubProvidersSettings}>
      <textarea defaultValue={pubsubProvidersDefaultValue} ref={pubsubProvidersRef} disabled={isConnectedToRpc} autoCorrect='off' autoComplete='off' spellCheck='false' />
      <button onClick={handleSave} disabled={isConnectedToRpc}>
        {t('save')}
      </button>
    </div>
  );
};

const BlockchainProvidersSettings = () => {
  const { t } = useTranslation();
  const account = useAccount();
  const { plebbitOptions } = account || {};
  const { chainProviders } = plebbitOptions || {};
  const ethRpcDefaultValue = chainProviders?.['eth']?.urls.join('\n');
  const solRpcDefaultValue = chainProviders?.['sol']?.urls.join('\n');
  const maticRpcDefaultValue = chainProviders?.['matic']?.urls.join('\n');
  const avaxRpcDefaultValue = chainProviders?.['avax']?.urls.join('\n');
  const ethRpcRef = useRef<HTMLTextAreaElement>(null);
  const solRpcRef = useRef<HTMLTextAreaElement>(null);
  const maticRpcRef = useRef<HTMLTextAreaElement>(null);
  const avaxRpcRef = useRef<HTMLTextAreaElement>(null);

  const handleSave = async () => {
    const ethRpcUrls = ethRpcRef.current?.value.split('\n').map((url) => url.trim());
    const solRpcUrls = solRpcRef.current?.value.split('\n').map((url) => url.trim());
    const maticRpcUrls = maticRpcRef.current?.value.split('\n').map((url) => url.trim());
    const avaxRpcUrls = avaxRpcRef.current?.value.split('\n').map((url) => url.trim());

    const chainProviders = {
      eth: {
        urls: ethRpcUrls,
        chainId: 1,
      },
      sol: {
        urls: solRpcUrls,
        chainId: 1,
      },
      matic: {
        urls: maticRpcUrls,
        chainId: 137,
      },
      avax: {
        urls: avaxRpcUrls,
        chainId: 43114,
      },
    };

    try {
      await setAccount({
        ...account,
        plebbitOptions: {
          ...account?.plebbitOptions,
          chainProviders,
        },
      });
      alert('blockchain providers saved.');
    } catch (e) {
      if (e instanceof Error) {
        alert('error saving blockchain providers: ' + e.message);
        console.log(e);
      } else {
        alert('error');
      }
    }
  };

  return (
    <div className={styles.blockchainProvidersSettings}>
      <span className={styles.settingTitle}>ethereum rpc, for .eth addresses</span>
      <div>
        <textarea defaultValue={ethRpcDefaultValue} ref={ethRpcRef} autoCorrect='off' autoComplete='off' spellCheck='false' />
        <button onClick={handleSave}>{t('save')}</button>
      </div>
      <span className={styles.settingTitle}>solana rpc, for .sol addresses</span>
      <div>
        <textarea defaultValue={solRpcDefaultValue} ref={solRpcRef} autoCorrect='off' autoComplete='off' spellCheck='false' />
      </div>
      <span className={styles.settingTitle}>polygon rpc, for nft profile pics</span>
      <div>
        <textarea defaultValue={maticRpcDefaultValue} ref={maticRpcRef} autoCorrect='off' autoComplete='off' spellCheck='false' />
      </div>
      <span className={styles.settingTitle}>avalanche rpc</span>
      <div>
        <textarea defaultValue={avaxRpcDefaultValue} ref={avaxRpcRef} autoCorrect='off' autoComplete='off' spellCheck='false' />
      </div>
    </div>
  );
};

const PlebbitRPCSettings = () => {
  const { t } = useTranslation();
  const [showInfo, setShowInfo] = useState(false);
  const account = useAccount();
  const { plebbitOptions } = account || {};
  const { plebbitRpcClientsOptions } = plebbitOptions || {};
  const plebbitRpcRef = useRef<HTMLInputElement>(null);

  const handleSave = async () => {
    const plebbitRpcClientsOptions = plebbitRpcRef.current?.value.trim();

    try {
      await setAccount({ ...account, plebbitOptions: { ...plebbitOptions, plebbitRpcClientsOptions } });
      alert('plebbit rpc saved, connecting...');
    } catch (e) {
      if (e instanceof Error) {
        alert('error saving plebbit rpc: ' + e.message);
        console.log(e);
      } else {
        alert('error');
      }
    }
  };

  return (
    <div className={styles.plebbitRPCSettings}>
      <div>
        <input type='text' defaultValue={plebbitRpcClientsOptions} ref={plebbitRpcRef} />
        <button onClick={() => setShowInfo(!showInfo)}>{showInfo ? 'X' : '?'}</button>
        <button onClick={handleSave}>{t('save')}</button>
      </div>
      {showInfo && (
        <div className={styles.plebbitRpcSettingsInfo}>
          use a plebbit full node locally, or remotely with SSL
          <br />
          <ol>
            <li>get secret auth key from the node</li>
            <li>get IP address and port used by the node</li>
            <li>
              enter: <code>{`ws://<IP>:<port>/<secretAuthKey>`}</code>
            </li>
            <li>click save to connect</li>
          </ol>
        </div>
      )}
    </div>
  );
};

const NodeDataPathSettings = () => {
  const { t } = useTranslation();
  const plebbitRpc = usePlebbitRpcSettings();
  const { plebbitRpcSettings, setPlebbitRpcSettings } = plebbitRpc || {};
  const { plebbitOptions } = plebbitRpcSettings || {};
  const isConnectedToRpc = plebbitRpc?.state === 'succeeded';
  const path = plebbitRpcSettings?.plebbitOptions?.dataPath || '';
  const nodeDataPathRef = useRef<HTMLInputElement>(null);

  const handleSave = async () => {
    const dataPath = nodeDataPathRef.current?.value.trim();

    try {
      await setPlebbitRpcSettings({ ...plebbitRpcSettings, plebbitOptions: { ...plebbitOptions, dataPath } });
      alert('node data path saved.');
    } catch (e) {
      if (e instanceof Error) {
        alert('error saving plebbit rpc: ' + e.message);
        console.log(e);
      } else {
        alert('error');
      }
    }
  };

  return (
    <div className={styles.nodeDataPathSettings}>
      <div>
        <input type='text' defaultValue={path} disabled={!isConnectedToRpc} ref={nodeDataPathRef} />
        <button disabled={!isConnectedToRpc} onClick={handleSave}>
          {t('save')}
        </button>
      </div>
    </div>
  );
};

const PlebbitOptions = () => {
  // const { t } = useTranslation();

  return (
    <div className={styles.content}>
      <div className={styles.category}>
        <span className={styles.categoryTitle}>ipfs gateways</span>
        <span className={styles.categorySettings}>
          <IPFSGatewaysSettings />
        </span>
      </div>
      <div className={styles.category}>
        <span className={styles.categoryTitle}>pubsub providers</span>
        <span className={styles.categorySettings}>
          <PubsubProvidersSettings />
        </span>
      </div>
      <div className={styles.category}>
        <span className={styles.categoryTitle}>blockchain providers</span>
        <span className={styles.categorySettings}>
          <BlockchainProvidersSettings />
        </span>
      </div>
      <div className={styles.category}>
        <span className={styles.categoryTitle}>node rpc</span>
        <span className={styles.categorySettings}>
          <PlebbitRPCSettings />
        </span>
      </div>
      <div className={styles.category}>
        <span className={styles.categoryTitle}>node data path</span>
        <span className={styles.categorySettings}>
          <NodeDataPathSettings />
        </span>
      </div>
    </div>
  );
};

export default PlebbitOptions;
