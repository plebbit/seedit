import { useState } from 'react';
import { Comment } from '@plebbit/plebbit-react-hooks';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import styles from './reply.module.css';
import useReplies from '../../hooks/use-replies';
import { getCommentMediaInfoMemoized, getHasThumbnail } from '../../lib/utils/media-utils';
import { getFormattedTime } from '../../lib/utils/time-utils';
import Expando from '../post/expando/';
import ExpandButton from '../post/expand-button/';
import Thumbnail from '../post/thumbnail/';
import Flair from '../post/flair/';

interface ReplyProps {
  key: string;
  reply: Comment;
}

const Reply = ({ reply }: ReplyProps) => {
  const {
    author: { shortAddress },
    content,
    depth,
    downvoteCount,
    flair,
    link,
    linkHeight,
    linkWidth,
    removed,
    timestamp,
    upvoteCount,
  } = reply || {};
  const replies = useReplies(reply);
  const [expanded, setExpanded] = useState(false);
  const toggleExpanded = () => setExpanded(!expanded);
  const commentMediaInfo = getCommentMediaInfoMemoized(reply);
  const hasThumbnail = getHasThumbnail(commentMediaInfo, link);
  const { t } = useTranslation();
  let score = upvoteCount - downvoteCount;
  if ((upvoteCount === 0 && downvoteCount === 0) || (upvoteCount === 1 && downvoteCount === 0)) {
    score = 1;
  }
  const scoreTranslation = score === 1 ? t('reply_score_singular') : t('reply_score_plural', { count: score });
  const contentOrRemoved = removed ? `[${t('removed')}]` : content;

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
            <span className={styles.score}>{scoreTranslation}</span> <span className={styles.time}>{getFormattedTime(timestamp)}</span>
            {flair && (
              <>
                {' '}
                <Flair flair={flair} />
              </>
            )}
          </p>
          <div className={styles.usertext}>
            {hasThumbnail && (
              <Thumbnail
                commentMediaInfo={commentMediaInfo}
                expanded={expanded}
                isReply={true}
                link={link}
                linkHeight={linkHeight}
                linkWidth={linkWidth}
                toggleExpanded={toggleExpanded}
              />
            )}
            {commentMediaInfo?.type === 'iframe' && (
              <ExpandButton
                commentMediaInfo={commentMediaInfo}
                content={content}
                expanded={expanded}
                hasThumbnail={hasThumbnail}
                link={link}
                toggleExpanded={toggleExpanded}
              />
            )}
            {link && (commentMediaInfo?.type === 'iframe' || commentMediaInfo?.type === 'webpage') && (
              <>
                <a href={link} target='_blank' rel='noopener noreferrer'>
                  ({link})
                </a>
                <br />
                <br />
              </>
            )}
            {expanded && link && (
              <Expando commentMediaInfo={commentMediaInfo} content={content} expanded={expanded} link={link} showContent={false} toggleExpanded={toggleExpanded} />
            )}
            <div className={styles.md}>{contentOrRemoved}</div>
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
          <Reply key={`${index}${reply.cid}`} reply={reply} />
        ))}
      </div>
    </div>
  );
};

export default Reply;
