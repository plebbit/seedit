import { FC } from 'react';
import Header from '../../header';
import Post from '../../post';
import { useComment } from '@plebbit/plebbit-react-hooks';
import { useParams } from 'react-router-dom';
import styles from './comments.module.css';

const Comments: FC = () => {
  const { commentCid } = useParams();
  const comment = useComment({ commentCid });

  return (
    <>
      <Header />
      <div className={styles.content}>
        <Post post={comment} shouldExpand={false} />
      </div>
    </>
  );
};

export default Comments;
