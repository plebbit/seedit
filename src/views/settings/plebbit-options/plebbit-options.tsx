import styles from './plebbit-options.module.css';
import { useTranslation } from 'react-i18next';

const PlebbitRPCSettings = () => {
  const { t } = useTranslation();

  return <div className={styles.plebbitRPCSettings}></div>;
};

const IPFSGatewaysSettings = () => {
  const { t } = useTranslation();

  return (
    <div className={styles.ipfsGatewaysSettings}>
      <textarea className={styles.input} />
      <div></div>
      <span className={styles.settingTitle}>profile pics gateway</span>
    </div>
  );
};

const PubsubProvidersSettings = () => {
  const { t } = useTranslation();

  return <div className={styles.pubsubProvidersSettings}>test</div>;
};

const BlockchainProvidersSettings = () => {
  const { t } = useTranslation();

  return <div className={styles.blockchainProvidersSettings}>test</div>;
};

const PlebbitOptions = () => {
  const { t } = useTranslation();

  return (
    <div className={styles.content}>
      <div className={styles.category}>
        <span className={styles.categoryTitle}>plebbit rpc</span>
        <span className={styles.categorySettings}>
          <PlebbitRPCSettings />
        </span>
      </div>
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
    </div>
  );
};

export default PlebbitOptions;
