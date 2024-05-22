import { useState } from 'react';
import { useAccount } from '@plebbit/plebbit-react-hooks';
import styles from './plebbit-options.module.css';
import { useTranslation } from 'react-i18next';

const isElectron = window.isElectron === true;

const IPFSGatewaysSettings = ({ ipfsGatewayUrls, mediaIpfsGatewayUrl }: { ipfsGatewayUrls: any; mediaIpfsGatewayUrl: any }) => {
  const { t } = useTranslation();
  const ipfsGatewayUrlsDefaultValue = ipfsGatewayUrls?.join('\n');

  return (
    <div className={styles.ipfsGatewaysSettings}>
      <div className={styles.ipfsGatewaysSetting}>
        <textarea defaultValue={ipfsGatewayUrlsDefaultValue} />
        <button>{t('save')}</button>
      </div>
      <span className={styles.settingTitle}>nft profile pics gateway</span>
      <div>
        <input type='text' defaultValue={mediaIpfsGatewayUrl} />
      </div>
    </div>
  );
};

const PubsubProvidersSettings = ({ pubsubHttpClientsOptions }: { pubsubHttpClientsOptions: any }) => {
  const { t } = useTranslation();
  const pubsubProvidersDefaultValue = pubsubHttpClientsOptions?.join('\n');

  return (
    <div className={styles.pubsubProvidersSettings}>
      <textarea defaultValue={pubsubProvidersDefaultValue} />
      <button>{t('save')}</button>
    </div>
  );
};

const BlockchainProvidersSettings = ({ chainProviders }: { chainProviders: any }) => {
  const { t } = useTranslation();
  const ethRpcDefaultValue = chainProviders?.['eth']?.urls.join(', ');
  const solRpcDefaultValue = chainProviders?.['sol']?.urls.join(', ');
  const maticRpcDefaultValue = chainProviders?.['matic']?.urls.join(', ');

  return (
    <div className={styles.blockchainProvidersSettings}>
      <span className={styles.settingTitle}>ethereum rpc, for .eth addresses</span>
      <div>
        <input type='text' defaultValue={ethRpcDefaultValue} />
        <button>{t('save')}</button>
      </div>
      <span className={styles.settingTitle}>solana rpc, for .sol addresses</span>
      <div>
        <input type='text' defaultValue={solRpcDefaultValue} />
      </div>
      <span className={styles.settingTitle}>polygon rpc, for nft profile pics</span>
      <div>
        <input type='text' defaultValue={maticRpcDefaultValue} />
      </div>
    </div>
  );
};

const PlebbitRPCSettings = ({ isElectron }: { isElectron: boolean }) => {
  const { t } = useTranslation();
  const [showInfo, setShowInfo] = useState(false);

  return (
    <div className={styles.plebbitRPCSettings}>
      <div>
        <input type='text' placeholder='' disabled={!isElectron} />
        <button onClick={() => setShowInfo(!showInfo)}>{showInfo ? 'X' : '?'}</button>
        <button disabled={!isElectron}>{t('save')}</button>
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

const NodeDataPathSettings = ({ isElectron }: { isElectron: boolean }) => {
  const { t } = useTranslation();
  const path = '~/Application Support/seedit';

  return (
    <div className={styles.nodeDataPathSettings}>
      <div>
        <input type='text' placeholder={isElectron ? path : ''} disabled={!isElectron} />
        <button disabled={!isElectron}>{t('save')}</button>
      </div>
    </div>
  );
};

const PlebbitOptions = () => {
  // const { t } = useTranslation();
  const { plebbitOptions, mediaIpfsGatewayUrl } = useAccount() || {};
  const { ipfsGatewayUrls, pubsubHttpClientsOptions, chainProviders } = plebbitOptions || {};

  return (
    <div className={styles.content}>
      <div className={styles.category}>
        <span className={styles.categoryTitle}>ipfs gateways</span>
        <span className={styles.categorySettings}>
          <IPFSGatewaysSettings ipfsGatewayUrls={ipfsGatewayUrls} mediaIpfsGatewayUrl={mediaIpfsGatewayUrl} />
        </span>
      </div>
      <div className={styles.category}>
        <span className={styles.categoryTitle}>pubsub providers</span>
        <span className={styles.categorySettings}>
          <PubsubProvidersSettings pubsubHttpClientsOptions={pubsubHttpClientsOptions} />
        </span>
      </div>
      <div className={styles.category}>
        <span className={styles.categoryTitle}>blockchain providers</span>
        <span className={styles.categorySettings}>
          <BlockchainProvidersSettings chainProviders={chainProviders} />
        </span>
      </div>
      <div className={styles.category}>
        <span className={styles.categoryTitle}>node rpc</span>
        <span className={styles.categorySettings}>
          <PlebbitRPCSettings isElectron={isElectron} />
        </span>
      </div>
      <div className={styles.category}>
        <span className={styles.categoryTitle}>node data path</span>
        <span className={styles.categorySettings}>
          <NodeDataPathSettings isElectron={isElectron} />
        </span>
      </div>
    </div>
  );
};

export default PlebbitOptions;
