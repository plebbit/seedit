import { useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useAccountComment } from '@plebbit/plebbit-react-hooks';
import styles from './pending-post.module.css';
import Post from '../../components/post';
import useStateString from '../../hooks/use-state-string';
import LoadingEllipsis from '../../components/loading-ellipsis';

const PendingPost = () => {
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

  const loadingString = stateString && <div className={styles.stateString}>{stateString === 'failed' ? <LoadingEllipsis string={stateString} /> : stateString}</div>;

  return (
    <div className={styles.container}>
      <Post post={post} />
      {loadingString}
    </div>
  );
};

export default PendingPost;
