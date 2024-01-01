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

  // TODO: make arrows functional when token voting is implemented in the API
  const upvoted = false;
  const downvoted = false;
  const upvoteCount = 0;
  const downvoteCount = 0;

  const postScore = upvoteCount === 0 && downvoteCount === 0 ? '•' : upvoteCount - downvoteCount || '•';

  return (
    <div className={styles.subplebbit}>
      <div className={styles.midcol}>
        <div className={styles.midcol}>
          <div className={styles.arrowWrapper}>
            <div className={`${styles.arrowCommon} ${upvoted ? styles.upvoted : styles.arrowUp}`} />
          </div>
          <div className={styles.score}>{postScore}</div>
          <div className={styles.arrowWrapper}>
            <div className={`${styles.arrowCommon} ${downvoted ? styles.downvoted : styles.arrowDown}`} />
          </div>
        </div>
      </div>
      <div className={styles.entry}>
        <div className={styles.title}>
          <Link to={`/p/${address}`}>
            p/{address.includes('.') ? address : shortAddress}
            {title && `: ${title}`}
          </Link>
          <span className={styles.subscribeButton}>
            <SubscribeButton address={address} />
          </span>
        </div>
        {description && <div className={styles.description}>{description}</div>}
        <div className={styles.tagline}>
          <span>
            {allActiveUserCount ? (
              <>
                {t('members_count', { count: allActiveUserCount })}, {t('community_for', { date: getFormattedDuration(createdAt) })}
                <div className={styles.subplebbitPreferences}>
                  <Link to={`/p/${address}/settings`} onClick={(e) => e.preventDefault()}>
                    {t('preferences')}
                  </Link>
                </div>
              </>
            ) : (
              'this community is offline'
            )}
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
