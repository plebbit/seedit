import { FC } from 'react';
import styles from './thumbnail.module.css';
import { useComment } from '@plebbit/plebbit-react-hooks';
import { Link } from 'react-router-dom';
import utils from '../../lib/utils';

interface ThumbnailProps {
  commentCid: string;
}

const Thumbnail: FC<ThumbnailProps> = ({ commentCid }) => {
  const comment = useComment({ commentCid });
  const subplebbitAddress = comment.subplebbitAddress;
  const { cid, linkHeight, linkWidth } = comment;
  const commentMediaInfo = utils.getCommentMediaInfoMemo(comment);
  const iframeThumbnail = commentMediaInfo?.patternThumbnailUrl || commentMediaInfo?.thumbnail;

  let displayWidth, displayHeight, hasLinkDimensions;

  if (linkWidth && linkHeight) {
    let scale = Math.min(1, 70 / Math.max(linkWidth, linkHeight));
    displayWidth = `${linkWidth * scale}px`;
    displayHeight = `${linkHeight * scale}px`;
    hasLinkDimensions = true;
  } else {
    displayWidth = '70px';
    displayHeight = '70px';
    hasLinkDimensions = false;
  }

  return (
    <span style={{ width: displayWidth, height: displayHeight }} className={styles.thumbnail}>
      <span className={hasLinkDimensions ? styles.transparentThumbnailWrapper : styles.thumbnailWrapper}>
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
              <video src={commentMediaInfo.url} />
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
          {commentMediaInfo?.type === 'iframe' && iframeThumbnail && (
            <img
              src={iframeThumbnail}
              alt='thumbnail'
              onError={(e) => {
                e.currentTarget.alt = '';
              }}
            />
          )}
        </Link>
      </span>
    </span>
  );
};

export default Thumbnail;
