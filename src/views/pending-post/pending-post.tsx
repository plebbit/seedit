import { useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useAccountComment } from '@plebbit/plebbit-react-hooks';
import styles from './pending-post.module.css';
import Post from '../../components/post';

const PendingPost = () => {
  const { accountCommentIndex } = useParams<{ accountCommentIndex?: string }>();
  const commentIndex = accountCommentIndex ? parseInt(accountCommentIndex) : undefined;
  const post = useAccountComment({ commentIndex });
  const navigate = useNavigate();

  useEffect(() => window.scrollTo(0, 0), []);

  useEffect(() => {
    if (post?.cid && post?.subplebbitAddress) {
      navigate(`/p/${post?.subplebbitAddress}/c/${post?.cid}`, { replace: true });
    }
  }, [post, navigate]);

  return (
    <div className={styles.container}>
      <Post post={post} />
    </div>
  );
};

export default PendingPost;
