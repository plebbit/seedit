import { FC, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { useComment } from '@plebbit/plebbit-react-hooks';
import styles from './comments.module.css';
import TopBar from '../../topbar';
import Header from '../../header';
import Post from '../../post';

const Comments: FC = () => {
  const { commentCid } = useParams();
  const comment = useComment({ commentCid });
  const { replyCount } = comment || {};

  useEffect(() => {window.scrollTo(0, 0);}, []);

  return (
    <>
      <div className={styles.content}>
        <TopBar />
        <Header />
        <div className={styles.comments}>
          <Post post={comment} shouldExpand={false} />
          <div className={styles.commentArea}>
            <div className={styles.commentsTitle}>
              <span className={styles.title}>all {replyCount} comments</span>
            </div>
            <div className={styles.menuArea}>
              <div className={styles.spacer}>
                <span className={styles.dropdownTitle}>sorted by:</span>
                <div className={styles.dropdown}>
                  <span className={styles.selected}>best</span>
                </div>
              </div>
              <div className={styles.mdContainer}>
                <div className={styles.md}>
                  <textarea className={styles.textarea} />
                </div>
                <div className={styles.bottomArea}>
                  <button className={styles.save}>save</button>
                </div>
              </div>
            </div>
            <div className={styles.replies}>

            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Comments;
