import { RefObject, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useLocation } from 'react-router-dom';
import { setAccount, useAccount, usePlebbitRpcSettings } from '@plebbit/plebbit-react-hooks';
import styles from './plebbit-options.module.css';

interface SettingsProps {
  ipfsGatewayUrlsRef?: RefObject<HTMLTextAreaElement>;
  mediaIpfsGatewayUrlRef?: RefObject<HTMLInputElement>;
  pubsubProvidersRef?: RefObject<HTMLTextAreaElement>;
  ethRpcRef?: RefObject<HTMLTextAreaElement>;
  solRpcRef?: RefObject<HTMLTextAreaElement>;
  maticRpcRef?: RefObject<HTMLTextAreaElement>;
  avaxRpcRef?: RefObject<HTMLTextAreaElement>;
  plebbitRpcRef?: RefObject<HTMLInputElement>;
  nodeDataPathRef?: RefObject<HTMLInputElement>;
}

const IPFSGatewaysSettings = ({ ipfsGatewayUrlsRef, mediaIpfsGatewayUrlRef }: SettingsProps) => {
  const account = useAccount();
  const { plebbitOptions, mediaIpfsGatewayUrl } = account || {};
  const { ipfsGatewayUrls } = plebbitOptions || {};
  const plebbitRpc = usePlebbitRpcSettings();
  const isConnectedToRpc = plebbitRpc?.state === 'succeeded';
  const ipfsGatewayUrlsDefaultValue = ipfsGatewayUrls?.join('\n');

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
      </div>
      <span className={styles.settingTitle}>nft profile pics gateway</span>
      <div>
        <input type='text' defaultValue={mediaIpfsGatewayUrl} ref={mediaIpfsGatewayUrlRef} disabled={isConnectedToRpc} />
      </div>
    </div>
  );
};

const PubsubProvidersSettings = ({ pubsubProvidersRef }: SettingsProps) => {
  const account = useAccount();
  const { plebbitOptions } = account || {};
  const { pubsubHttpClientsOptions } = plebbitOptions || {};
  const plebbitRpc = usePlebbitRpcSettings();
  const isConnectedToRpc = plebbitRpc?.state === 'succeeded';
  const pubsubProvidersDefaultValue = pubsubHttpClientsOptions?.join('\n');

  return (
    <div className={styles.pubsubProvidersSettings}>
      <textarea defaultValue={pubsubProvidersDefaultValue} ref={pubsubProvidersRef} disabled={isConnectedToRpc} autoCorrect='off' autoComplete='off' spellCheck='false' />
    </div>
  );
};

const BlockchainProvidersSettings = ({ ethRpcRef, solRpcRef, maticRpcRef, avaxRpcRef }: SettingsProps) => {
  const account = useAccount();
  const { plebbitOptions } = account || {};
  const { chainProviders } = plebbitOptions || {};
  const ethRpcDefaultValue = chainProviders?.['eth']?.urls.join('\n');
  const solRpcDefaultValue = chainProviders?.['sol']?.urls.join('\n');
  const maticRpcDefaultValue = chainProviders?.['matic']?.urls.join('\n');
  const avaxRpcDefaultValue = chainProviders?.['avax']?.urls.join('\n');

  return (
    <div className={styles.blockchainProvidersSettings}>
      <span className={styles.settingTitle}>ethereum rpc, for .eth addresses</span>
      <div>
        <textarea defaultValue={ethRpcDefaultValue} ref={ethRpcRef} autoCorrect='off' autoComplete='off' spellCheck='false' />
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

const PlebbitRPCSettings = ({ plebbitRpcRef }: SettingsProps) => {
  const [showInfo, setShowInfo] = useState(false);
  const account = useAccount();
  const { plebbitOptions } = account || {};
  const { plebbitRpcClientsOptions } = plebbitOptions || {};

  return (
    <div className={styles.plebbitRPCSettings}>
      <div>
        <input type='text' defaultValue={plebbitRpcClientsOptions} ref={plebbitRpcRef} />
        <button onClick={() => setShowInfo(!showInfo)}>{showInfo ? 'X' : '?'}</button>
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

const NodeDataPathSettings = ({ nodeDataPathRef }: SettingsProps) => {
  const plebbitRpc = usePlebbitRpcSettings();
  const { plebbitRpcSettings } = plebbitRpc || {};
  const isConnectedToRpc = plebbitRpc?.state === 'succeeded';
  const path = plebbitRpcSettings?.plebbitOptions?.dataPath || '';

  return (
    <div className={styles.nodeDataPathSettings}>
      <div>
        <input type='text' defaultValue={path} disabled={!isConnectedToRpc} ref={nodeDataPathRef} />
      </div>
    </div>
  );
};

const PlebbitOptions = () => {
  const { t } = useTranslation();
  const location = useLocation();
  const account = useAccount();
  const { plebbitOptions } = account || {};

  const ipfsGatewayUrlsRef = useRef<HTMLTextAreaElement>(null);
  const mediaIpfsGatewayUrlRef = useRef<HTMLInputElement>(null);
  const pubsubProvidersRef = useRef<HTMLTextAreaElement>(null);
  const ethRpcRef = useRef<HTMLTextAreaElement>(null);
  const solRpcRef = useRef<HTMLTextAreaElement>(null);
  const maticRpcRef = useRef<HTMLTextAreaElement>(null);
  const avaxRpcRef = useRef<HTMLTextAreaElement>(null);
  const plebbitRpcRef = useRef<HTMLInputElement>(null);
  const nodeDataPathRef = useRef<HTMLInputElement>(null);

  const handleSave = async () => {
    const ipfsGatewayUrls = ipfsGatewayUrlsRef.current?.value.split('\n').map((url) => url.trim());
    const mediaIpfsGatewayUrl = mediaIpfsGatewayUrlRef.current?.value.trim();
    const pubsubHttpClientsOptions = pubsubProvidersRef.current?.value.split('\n').map((url) => url.trim());
    const ethRpcUrls = ethRpcRef.current?.value.split('\n').map((url) => url.trim());
    const solRpcUrls = solRpcRef.current?.value.split('\n').map((url) => url.trim());
    const maticRpcUrls = maticRpcRef.current?.value.split('\n').map((url) => url.trim());
    const avaxRpcUrls = avaxRpcRef.current?.value.split('\n').map((url) => url.trim());
    const plebbitRpcClientsOptions = plebbitRpcRef.current?.value.trim();
    const dataPath = nodeDataPathRef.current?.value.trim();

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
        mediaIpfsGatewayUrl,
        plebbitOptions: {
          ...plebbitOptions,
          ipfsGatewayUrls,
          pubsubHttpClientsOptions,
          chainProviders,
          plebbitRpcClientsOptions,
          dataPath,
        },
      });
      alert('Options saved.');
    } catch (e) {
      if (e instanceof Error) {
        alert('Error saving options: ' + e.message);
        console.log(e);
      } else {
        alert('Error');
      }
    }
  };

  return (
    <div className={styles.content}>
      <div className={styles.category}>
        <span className={styles.categoryTitle}>ipfs gateways</span>
        <span className={styles.categorySettings}>
          <IPFSGatewaysSettings ipfsGatewayUrlsRef={ipfsGatewayUrlsRef} mediaIpfsGatewayUrlRef={mediaIpfsGatewayUrlRef} />
        </span>
      </div>
      <div className={styles.category}>
        <span className={styles.categoryTitle}>pubsub providers</span>
        <span className={styles.categorySettings}>
          <PubsubProvidersSettings pubsubProvidersRef={pubsubProvidersRef} />
        </span>
      </div>
      <div className={styles.category}>
        <span className={styles.categoryTitle}>blockchain providers</span>
        <span className={styles.categorySettings}>
          <BlockchainProvidersSettings ethRpcRef={ethRpcRef} solRpcRef={solRpcRef} maticRpcRef={maticRpcRef} avaxRpcRef={avaxRpcRef} />
        </span>
      </div>
      <div className={`${styles.category} ${location.hash === '#nodeRpc' ? styles.highlightedSetting : ''}`} id='nodeRpc'>
        <span className={styles.categoryTitle}>node rpc</span>
        <span className={styles.categorySettings}>
          <PlebbitRPCSettings plebbitRpcRef={plebbitRpcRef} />
        </span>
      </div>
      <div className={styles.category}>
        <span className={styles.categoryTitle}>node data path</span>
        <span className={styles.categorySettings}>
          <NodeDataPathSettings nodeDataPathRef={nodeDataPathRef} />
        </span>
      </div>
      <button className={styles.saveOptions} onClick={handleSave}>
        {t('save_options')}
      </button>
    </div>
  );
};

export default PlebbitOptions;
