import { useEffect, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useAuthorComments } from '@plebbit/plebbit-react-hooks';
import { StateSnapshot, Virtuoso, VirtuosoHandle } from 'react-virtuoso';
import styles from './author.module.css';
import AuthorSidebar from '../../components/author-sidebar';
import Post from '../../components/post';

const lastVirtuosoStates: { [key: string]: StateSnapshot } = {};

const Loading = () => 'loading...';

const Author = () => {
  const { authorAddress, commentCid, sortType } = useParams();
  const navigate = useNavigate();
  const { authorComments, lastCommentCid, hasMore, loadMore } = useAuthorComments({ commentCid, authorAddress });

  const Footer = hasMore ? Loading : undefined;

  const virtuosoRef = useRef<VirtuosoHandle | null>(null);

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
      <div className={styles.sidebar}>
        <AuthorSidebar />
      </div>
      {authorComments?.length === 0 && <div className={styles.noPosts}>No posts found</div>}
      <Virtuoso
        increaseViewportBy={{ bottom: 1200, top: 600 }}
        totalCount={authorComments?.length || 0}
        data={authorComments}
        itemContent={(index, post) => (post && <Post index={index} post={post} />)}
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
