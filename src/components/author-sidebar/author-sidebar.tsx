import {
  // Link,
  useLocation,
  useNavigate,
  useParams,
} from 'react-router-dom';
import {
  useAccount,
  useAccountComments,
  // useAccountSubplebbits,
  // AccountSubplebbit,
  useAuthor,
  useAuthorComments,
  useBlock,
  // useSubplebbits,
} from '@plebbit/plebbit-react-hooks';
// import { getShortAddress } from '@plebbit/plebbit-js';
import styles from './author-sidebar.module.css';
import { getFormattedDuration } from '../../lib/utils/time-utils';
import { isAuthorView, isProfileView } from '../../lib/utils/view-utils';
import {
  // findAuthorSubplebbits,
  estimateAuthorKarma,
} from '../../lib/utils/user-utils';
import { useTranslation } from 'react-i18next';
// import { useDefaultSubplebbitAddresses } from '../../lib/utils/addresses-utils';
import SubscribeButton from '../subscribe-button';

// TODO: uncomment when useSubplebbits({fetch: false}) is implemented, because fetching all subs for this is too expensive

// interface AuthorModeratingListProps {
//   accountSubplebbits: AccountSubplebbit[];
//   authorSubplebbits: string[];
//   isAuthor?: boolean;
// }

// const AuthorModeratingList = ({ accountSubplebbits, authorSubplebbits, isAuthor = false }: AuthorModeratingListProps) => {
//   const subplebbitAddresses = isAuthor ? authorSubplebbits : Object.keys(accountSubplebbits);

//   return (
//     subplebbitAddresses.length > 0 && (
//       <div className={styles.modList}>
//         <div className={styles.modListTitle}>moderator of</div>
//         <ul className={`${styles.modListContent} ${styles.modsList}`}>
//           {subplebbitAddresses.map((address, index) => (
//             <li key={index}>
//               <Link to={`/p/${address}`}>p/{getShortAddress(address)}</Link>
//             </li>
//           ))}
//         </ul>
//       </div>
//     )
//   );
// };

const AuthorSidebar = () => {
  const { t } = useTranslation();
  const location = useLocation();
  const navigate = useNavigate();
  const params = useParams();
  const { authorAddress, commentCid } = useParams() || {};
  const { blocked, unblock, block } = useBlock({ address: authorAddress });

  const isAuthorPage = isAuthorView(location.pathname);
  const isProfilePage = isProfileView(location.pathname);

  const profileAccount = useAccount();
  const { accountComments } = useAccountComments();
  // const { accountSubplebbits } = useAccountSubplebbits();
  const profileOldestAccountTimestamp = accountComments?.[0]?.timestamp || Date.now();

  // const defaultSubplebbitAddresses = useDefaultSubplebbitAddresses();
  // const accountSubscriptions = profileAccount?.subscriptions || [];
  // const subscriptionsAndDefaults = [...accountSubscriptions, ...defaultSubplebbitAddresses];
  // const subplebbits = useSubplebbits({ subplebbitAddresses: subscriptionsAndDefaults });

  const authorAccount = useAuthor({ authorAddress, commentCid });
  const { authorComments } = useAuthorComments({ authorAddress, commentCid });
  const authorOldestCommentTimestamp = authorComments?.[0]?.timestamp || Date.now();
  // const authorSubplebbits = findAuthorSubplebbits(authorAddress, subplebbits.subplebbits);

  const estimatedAuthorKarma = estimateAuthorKarma(authorComments);

  const address = isAuthorPage ? params?.authorAddress : isProfilePage ? profileAccount?.author?.shortAddress : '';
  const karma = isAuthorPage ? estimatedAuthorKarma : isProfilePage ? profileAccount?.karma : '';
  const { postScore, replyScore } = karma || { postScore: 0, replyScore: 0 };

  const oldestCommentTimestamp = isAuthorPage ? authorOldestCommentTimestamp : isProfilePage ? profileOldestAccountTimestamp : Date.now();
  const displayName = isAuthorPage ? authorAccount?.author?.displayName : isProfilePage ? profileAccount?.author?.displayName : '';

  const confirmNavigateToSettings = () => {
    if (window.confirm('Go to the settings to set a display name.')) {
      navigate('/settings');
    } else {
      return;
    }
  };

  const confirmBlock = () => {
    if (window.confirm(`Are you sure you want to ${blocked ? 'unblock' : 'block'} this user?`)) {
      if (blocked) {
        unblock();
      } else {
        block();
      }
    }
  };

  return (
    <div className={styles.sidebar}>
      <div className={styles.titleBox}>
        <div className={styles.title}>
          {address}
          {isProfilePage && !displayName && (
            <span className={styles.editButtonWrapper}>
              {' '}
              (
              <span className={styles.editButton} onClick={confirmNavigateToSettings}>
                edit
              </span>
              )
            </span>
          )}
        </div>
        {displayName && <div className={styles.displayName}>{displayName}</div>}
        {isAuthorPage && authorAddress !== profileAccount?.author?.address && (
          <div className={styles.friends}>
            <SubscribeButton address={address} />
          </div>
        )}
        <div>
          <span className={styles.karma}>{postScore}</span> {t('post_karma')}
        </div>
        <div>
          <span className={styles.karma}>{replyScore}</span> {t('comment_karma')}
        </div>
        <div className={styles.bottom}>
          {isAuthorPage && authorAddress !== profileAccount?.author?.address && (
            <span className={styles.blockUser} onClick={confirmBlock}>
              {blocked ? 'Unblock user' : 'Block user'}
            </span>
          )}
          <span className={styles.age}>
            {t('plebbitor_for')} {getFormattedDuration(oldestCommentTimestamp)}
          </span>
        </div>
      </div>
      {/* {Object.keys(accountSubplebbits).length > 0 && (
        <AuthorModeratingList accountSubplebbits={accountSubplebbits} isAuthor={isAuthorPage} authorSubplebbits={authorSubplebbits} />
      )} */}
    </div>
  );
};

export default AuthorSidebar;
