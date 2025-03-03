import { useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useAccountComment, useAccountComments } from '@plebbit/plebbit-react-hooks';
import { useTranslation } from 'react-i18next';
import styles from './pending-post.module.css';
import Post from '../../components/post';
import useStateString from '../../hooks/use-state-string';
import LoadingEllipsis from '../../components/loading-ellipsis';

const PendingPost = () => {
  const { t } = useTranslation();
  const { accountComments } = useAccountComments();
  const { accountCommentIndex } = useParams<{ accountCommentIndex?: string }>();
  const commentIndex = accountCommentIndex ? parseInt(accountCommentIndex) : undefined;
  const post = useAccountComment({ commentIndex });
  const navigate = useNavigate();
  const stateString = useStateString(post);

  useEffect(() => window.scrollTo(0, 0), []);

  const isValidAccountCommentIndex =
    !accountCommentIndex ||
    (!isNaN(parseInt(accountCommentIndex)) &&
      parseInt(accountCommentIndex) >= 0 &&
      accountComments?.length > 0 &&
      parseInt(accountCommentIndex) < accountComments.length);

  useEffect(() => {
    if (!isValidAccountCommentIndex) {
      navigate('/not-found', { replace: true });
    }
  }, [isValidAccountCommentIndex, navigate]);

  useEffect(() => {
    if (post?.cid && post?.subplebbitAddress) {
      navigate(`/p/${post?.subplebbitAddress}/c/${post?.cid}`, { replace: true });
    }
  }, [post, navigate]);

  return (
    <div className={styles.container}>
      <Post post={post} />
      <div className={styles.stateString}>
        {stateString && stateString !== 'Failed' ? <LoadingEllipsis string={stateString} /> : post?.state === 'failed' && t('failed')}
      </div>
    </div>
  );
};

export default PendingPost;
