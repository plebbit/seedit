import { useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useAccountComment } from '@plebbit/plebbit-react-hooks';
import { useTranslation } from 'react-i18next';
import styles from './pending-post.module.css';
import Post from '../../components/post';
import useStateString from '../../hooks/use-state-string';
import LoadingEllipsis from '../../components/loading-ellipsis';

const PendingPost = () => {
  const { t } = useTranslation();
  const { accountCommentIndex } = useParams<{ accountCommentIndex?: string }>();
  const commentIndex = accountCommentIndex ? parseInt(accountCommentIndex) : undefined;
  const post = useAccountComment({ commentIndex });
  const navigate = useNavigate();
  const stateString = useStateString(post);

  useEffect(() => window.scrollTo(0, 0), []);

  useEffect(() => {
    if (post?.cid && post?.subplebbitAddress) {
      navigate(`/p/${post?.subplebbitAddress}/c/${post?.cid}`, { replace: true });
    }
  }, [post, navigate]);

  return (
    <div className={styles.container}>
      <Post post={post} />
      <div className={styles.stateString}>{stateString && stateString !== 'Failed' ? <LoadingEllipsis string={stateString} /> : t('failed')}</div>
    </div>
  );
};

export default PendingPost;
