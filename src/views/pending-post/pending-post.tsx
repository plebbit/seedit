import { useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useAccountComment } from '@plebbit/plebbit-react-hooks';
import styles from './pending-post.module.css';
import Post from '../../components/post';
import useStateString from '../../hooks/use-state-string';

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

  return (
    <div className={styles.container}>
      <Post post={post} />
      {stateString && <div className={styles.stateString}>{stateString}</div>}
    </div>
  );
};

export default PendingPost;
