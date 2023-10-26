import { FC, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { useComment, useSubplebbit } from '@plebbit/plebbit-react-hooks';
import styles from './comments.module.css';
import TopBar from '../../topbar';
import Header from '../../header';
import Post from '../../post';
import useReplies from '../../../hooks/use-replies';
import Reply from '../../reply/reply';

const Comments: FC = () => {
  const { commentCid } = useParams();
  const comment = useComment({ commentCid });
  const { content, replyCount, subplebbitAddress, title } = comment || {};
  const subplebbit = useSubplebbit({subplebbitAddress});
  const replies = useReplies(comment).map((reply, index) => <Reply key={index} reply={reply} />) || '';
  const threadTitle = title?.slice(0, 40) || content?.slice(0, 40);
  const subplebbitTitle = subplebbit?.title || subplebbit?.shortAddress;

  useEffect(() => {
    if (threadTitle || subplebbitTitle) {
      document.title = `${threadTitle} - ${subplebbitTitle} - seedit`;
    } else {
      document.title = 'seedit';
    }
    window.scrollTo(0, 0);
  }, [threadTitle, subplebbitTitle]);

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
            <div className={styles.replies}>{replies}</div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Comments;
