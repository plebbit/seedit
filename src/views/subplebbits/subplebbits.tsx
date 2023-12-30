import { useMemo } from 'react';
import { Subplebbit as SubplebbitType, useAccountSubplebbits, useSubplebbitStats } from '@plebbit/plebbit-react-hooks';
import { useTranslation } from 'react-i18next';
import styles from './subplebbits.module.css';
import Sidebar from '../../components/sidebar';
import SubscribeButton from '../../components/subscribe-button';
import { Link } from 'react-router-dom';
import { getFormattedDuration } from '../../lib/utils/time-utils';

interface SubplebbitProps {
  subplebbit: SubplebbitType;
}

const Subplebbit = ({ subplebbit }: SubplebbitProps) => {
  const { t } = useTranslation();
  const { address, createdAt, description, shortAddress, title } = subplebbit || {};
  const { allActiveUserCount } = useSubplebbitStats({ subplebbitAddress: address });

  return (
    <div className={styles.subplebbit}>
      <div className={styles.midcol}>
        <SubscribeButton address={address} />
      </div>
      <div className={styles.entry}>
        <div className={styles.title}>
          <Link to={`/p/${address}`}>
            p/{address.includes('.') ? address : shortAddress}
            {title && `: ${title}`}
          </Link>
        </div>
        {description && <div className={styles.description}>{description}</div>}
        <div className={styles.tagline}>
          <span>
            {t('readers_count', { count: allActiveUserCount })}, {t('community_for', { date: getFormattedDuration(createdAt) })}
          </span>
        </div>
      </div>
    </div>
  );
};

const Subplebbits = () => {
  const { t } = useTranslation();
  const { accountSubplebbits } = useAccountSubplebbits();
  const accountSubplebbitsArray = useMemo(() => Object.values(accountSubplebbits), [accountSubplebbits]);

  return (
    <div className={styles.content}>
      <div className={`${styles.sidebar}`}>
        <Sidebar />
      </div>
      <div className={styles.infobar}>
        click the <code>{t('join')}</code> or <code>{t('leave')}</code> buttons to choose which communities appear on the home feed.
      </div>
      {accountSubplebbitsArray?.map((subplebbit) => <Subplebbit subplebbit={subplebbit} />)}
    </div>
  );
};

export default Subplebbits;
