import { FC } from 'react';
import { useComment } from '@plebbit/plebbit-react-hooks';
import utils from '../../lib/utils';
import { Link } from 'react-router-dom';
import styles from './expando.module.css';
import Embed from '../embed';

interface ExpandoProps {
  commentCid: string;
  expanded: boolean;
}

const Expando: FC<ExpandoProps> = ({ commentCid, expanded }) => {
  const comment = useComment({ commentCid });
  const { cid, content, link, subplebbitAddress } = comment || {};
  const commentMediaInfo = utils.getCommentMediaInfoMemoized(comment);

  return (
    <div className={expanded ? styles.expando : styles.expandoHidden}>
      {link && (
        <div className={styles.mediaPreview}>
          <Link to={`p/${subplebbitAddress}/c/${cid}`} onClick={(e) => e.preventDefault()}>
            {commentMediaInfo?.type === 'image' && (
              <img
                src={commentMediaInfo.url}
                alt='thumbnail'
                onError={(e) => {
                  e.currentTarget.alt = '';
                }}
              />
            )}
            {commentMediaInfo?.type === 'video' &&
              (commentMediaInfo.thumbnail ? (
                <img
                  src={commentMediaInfo.thumbnail}
                  alt='thumbnail'
                  onError={(e) => {
                    e.currentTarget.alt = '';
                  }}
                />
              ) : (
                <video src={commentMediaInfo.url} controls />
              ))}
            {commentMediaInfo?.type === 'webpage' && commentMediaInfo.thumbnail && (
              <img
                src={commentMediaInfo.thumbnail}
                alt='thumbnail'
                onError={(e) => {
                  e.currentTarget.alt = '';
                }}
              />
            )}
            {commentMediaInfo?.type === 'audio' && <audio src={commentMediaInfo.url} controls />}
            {commentMediaInfo?.type === 'iframe' && expanded && <Embed url={commentMediaInfo.url} />}
          </Link>
        </div>
      )}
      {content && (
        <div className={styles.usertext}>
          <div className={styles.markdown}>{content}</div>
        </div>
      )}
    </div>
  );
};

export default Expando;
