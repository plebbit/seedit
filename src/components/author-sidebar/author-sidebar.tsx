import { Link, useLocation, useNavigate, useParams } from 'react-router-dom';
import {
  useAccount,
  useAccountComments,
  // useAccountSubplebbits,
  // AccountSubplebbit,
  useAuthor,
  useAuthorAvatar,
  useAuthorComments,
  useBlock,
  useComment,
  // useSubplebbits,
} from '@plebbit/plebbit-react-hooks';
// import Plebbit from '@plebbit/plebbit-js/dist/browser/index.js';
import styles from './author-sidebar.module.css';
import { getFormattedTimeDuration } from '../../lib/utils/time-utils';
import { isAuthorView, isProfileView } from '../../lib/utils/view-utils';
import {
  // findAuthorSubplebbits,
  estimateAuthorKarma,
} from '../../lib/utils/user-utils';
import { useTranslation } from 'react-i18next';
// import { useDefaultSubplebbitAddresses } from '../../lib/utils/addresses-utils';

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
//               <Link to={`/p/${address}`}>p/{Plebbit.getShortAddress(address)}</Link>
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

  const comment = useComment({ commentCid });
  const { imageUrl: authorPageAvatar } = useAuthorAvatar({ author: comment?.author });

  const isInAuthorView = isAuthorView(location.pathname);
  const isInProfileView = isProfileView(location.pathname);

  const profileAccount = useAccount();
  const { imageUrl: profilePageAvatar } = useAuthorAvatar({ author: profileAccount?.author });
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

  const address = isInAuthorView ? params?.authorAddress : isInProfileView ? profileAccount?.author?.shortAddress : '';
  const karma = isInAuthorView ? estimatedAuthorKarma : isInProfileView ? profileAccount?.karma : '';
  const { postScore, replyScore } = karma || { postScore: 0, replyScore: 0 };

  const oldestCommentTimestamp = isInAuthorView ? authorOldestCommentTimestamp : isInProfileView ? profileOldestAccountTimestamp : Date.now();
  const displayName = isInAuthorView ? authorAccount?.author?.displayName : isInProfileView ? profileAccount?.author?.displayName : '';

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
      {((isInAuthorView && authorPageAvatar) || (isInProfileView && profilePageAvatar)) && (
        <div className={styles.avatar}>
          <img src={isInAuthorView ? authorPageAvatar : profilePageAvatar} alt='' />
        </div>
      )}
      <div className={styles.titleBox}>
        <div className={styles.title}>
          {address}
          {isInProfileView && !displayName && (
            <span className={styles.editButtonWrapper}>
              {' '}
              (
              <span className={styles.editButton}>
                <Link to='/settings#displayName'>{t('edit')}</Link>
              </span>
              )
            </span>
          )}
        </div>
        {displayName && <div className={styles.displayName}>{displayName}</div>}
        {/*  TODO: implement functionality for subscribing to users
        {isInAuthorView && authorAddress !== profileAccount?.author?.address && (
          <div className={styles.friends}>
            <SubscribeButton address={address} />
          </div>
        )} */}
        <div>
          <span className={styles.karma}>{postScore}</span> {t('post_karma')}
        </div>
        <div>
          <span className={styles.karma}>{replyScore}</span> {t('comment_karma')}
        </div>
        <div className={styles.bottom}>
          {isInAuthorView && authorAddress !== profileAccount?.author?.address && (
            <span className={styles.blockUser} onClick={confirmBlock}>
              {blocked ? 'Unblock user' : 'Block user'}
            </span>
          )}
          <span className={styles.age}>
            {t('plebbitor_for')} {getFormattedTimeDuration(oldestCommentTimestamp)}
          </span>
        </div>
      </div>
      {/* {Object.keys(accountSubplebbits).length > 0 && (
        <AuthorModeratingList accountSubplebbits={accountSubplebbits} isAuthor={isInAuthorView} authorSubplebbits={authorSubplebbits} />
      )} */}
    </div>
  );
};

export default AuthorSidebar;
