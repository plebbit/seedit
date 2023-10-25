import { FC } from 'react';
import { useParams } from 'react-router-dom';
import { useComment } from '@plebbit/plebbit-react-hooks';
import styles from './comments.module.css';
import TopBar from '../../topbar';
import Header from '../../header';
import Post from '../../post';

const Comments: FC = () => {
  const { commentCid } = useParams();
  const comment = useComment({ commentCid });

  return (
    <>
      <div className={styles.content}>
        <TopBar />
        <Header />
        <div className={styles.comments}>
          <Post post={comment} shouldExpand={false} />
        </div>
      </div>
    </>
  );
};

export default Comments;
