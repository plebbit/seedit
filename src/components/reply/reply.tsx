import { FC, useState } from 'react';
import { Comment } from '@plebbit/plebbit-react-hooks';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import styles from './reply.module.css';
import useReplies from '../../hooks/use-replies';
import utils from '../../lib/utils';
import { Thumbnail, Expando, ExpandButton } from '../post';

interface ReplyProps {
  key: number;
  reply: Comment;
}

const Reply: FC<ReplyProps> = ({ reply }) => {
  const {
    author: { shortAddress },
    cid,
    content,
    depth,
    link,
    timestamp,
  } = reply || {};
  const replies = useReplies(reply);
  const [expanded, setExpanded] = useState(false);
  const toggleExpanded = () => setExpanded(!expanded);
  const commentMediaInfo = utils.getCommentMediaInfoMemoized(reply);
  const hasThumbnail = utils.hasThumbnail(commentMediaInfo, link);
  const { t } = useTranslation();

  return (
    <div className={styles.reply}>
      <div className={`${styles.replyWrapper} ${depth > 1 && styles.nested}`}>
        <div className={styles.midcol}>
          <div className={`${styles.arrow} ${styles.arrowUp}`} />
          <div className={`${styles.arrow} ${styles.arrowDown}`} />
        </div>
        <div className={styles.entry}>
          <p className={styles.tagline}>
            <span className={styles.expand}>[–]</span>
            <Link
              to='/u/address.eth'
              onClick={(e) => {
                e.preventDefault();
              }}
              className={styles.author}
            >
              {shortAddress}
            </Link>
            <span className={styles.score}>1 point</span>
            &nbsp;
            <span className={styles.time}>{utils.getFormattedTime(timestamp)}</span>
          </p>
          <div className={styles.usertext}>
            {hasThumbnail && <Thumbnail commentCid={cid} />}
            {hasThumbnail && <ExpandButton commentCid={cid} expanded={expanded} hasThumbnail={hasThumbnail} toggleExpanded={toggleExpanded} />}
            <div className={styles.md}>{content}</div>
            {hasThumbnail && <Expando commentCid={cid} expanded={expanded} showContent={false} />}
          </div>
        </div>
        <ul className={styles.buttons}>
          <li className={styles.button}>
            <span>{t('reply_permalink')}</span>
          </li>
          <li className={styles.button}>
            <span>{t('reply_embed')}</span>
          </li>
          <li className={styles.button}>
            <span>{t('post_save')}</span>
          </li>
          <li className={styles.button}>
            <span>{t('post_report')}</span>
          </li>
          <li className={styles.button}>
            <span>{t('reply_reply')}</span>
          </li>
        </ul>
        {replies.map((reply, index) => (
          <Reply key={index} reply={reply} />
        ))}
      </div>
    </div>
  );
};

export default Reply;
