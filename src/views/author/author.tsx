import { useEffect, useMemo, useRef } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import { useAuthorComments } from '@plebbit/plebbit-react-hooks';
import { StateSnapshot, Virtuoso, VirtuosoHandle } from 'react-virtuoso';
import { isAuthorCommentsView, isAuthorSubmittedView } from '../../lib/utils/view-utils';
import { useTranslation } from 'react-i18next';
import styles from './author.module.css';
import AuthorSidebar from '../../components/author-sidebar';
import LoadingEllipsis from '../../components/loading-ellipsis';
import Post from '../../components/post';
import Reply from '../../components/reply/';

const lastVirtuosoStates: { [key: string]: StateSnapshot } = {};

const Author = () => {
  const { t } = useTranslation();
  const location = useLocation();
  const navigate = useNavigate();
  const { authorAddress, commentCid, sortType } = useParams();
  const params = useParams();
  const isAuthorCommentsPage = isAuthorCommentsView(location.pathname, params);
  const isAuthorSubmittedPage = isAuthorSubmittedView(location.pathname, params);
  const isMobile = window.innerWidth < 768;

  const { authorComments, lastCommentCid, hasMore, loadMore } = useAuthorComments({ commentCid, authorAddress });

  const replyComments = useMemo(() => authorComments?.filter((comment) => comment && comment.parentCid) || [], [authorComments]);
  const postComments = useMemo(() => authorComments?.filter((comment) => comment && !comment.parentCid) || [], [authorComments]);

  const Footer = () => {
    return hasMore ? <LoadingEllipsis string={'loading'} /> : null;
  };

  const virtuosoRef = useRef<VirtuosoHandle | null>(null);

  let virtuosoData;
  if (isAuthorCommentsPage) {
    virtuosoData = replyComments;
  } else if (isAuthorSubmittedPage) {
    virtuosoData = postComments;
  } else {
    virtuosoData = authorComments;
  }

  useEffect(() => {
    const setLastVirtuosoState = () =>
      virtuosoRef.current?.getState((snapshot: StateSnapshot) => {
        if (snapshot?.ranges?.length) {
          const key = `${authorAddress ?? ''}${sortType ?? ''}`;
          lastVirtuosoStates[key] = snapshot;
        }
      });
    window.addEventListener('scroll', setLastVirtuosoState);
    return () => window.removeEventListener('scroll', setLastVirtuosoState);
  }, [authorAddress, sortType]);

  const key = `${authorAddress ?? ''}${sortType ?? ''}`;
  const lastVirtuosoState = lastVirtuosoStates?.[key];

  // always redirect to latest author cid
  useEffect(() => {
    if (authorAddress && lastCommentCid && commentCid && lastCommentCid !== commentCid) {
      navigate(`/u/${authorAddress}/c/${lastCommentCid}`, { replace: true });
    }
  }, [authorAddress, lastCommentCid, commentCid, navigate]);

  return (
    <div className={styles.content}>
      <div className={isMobile ? styles.sidebarMobile : styles.sidebarDesktop}>
        <AuthorSidebar />
      </div>
      {authorComments?.length === 0 && !hasMore && <div className={styles.noPosts}>{t('no_posts_found')}</div>}
      <Virtuoso
        increaseViewportBy={{ bottom: 1200, top: 600 }}
        totalCount={authorComments?.length || 0}
        data={virtuosoData}
        itemContent={(index, post) => {
          const isReply = post?.parentCid;
          return !isReply ? <Post index={index} post={post} /> : <Reply index={index} isSingle={true} reply={post} />;
        }}
        useWindowScroll={true}
        components={{ Footer }}
        endReached={loadMore}
        ref={virtuosoRef}
        restoreStateFrom={lastVirtuosoState}
        initialScrollTop={lastVirtuosoState?.scrollTop}
      />
    </div>
  );
};

export default Author;
