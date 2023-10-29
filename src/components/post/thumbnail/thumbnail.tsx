import { FC } from 'react';
import styles from './thumbnail.module.css';
import { useComment } from '@plebbit/plebbit-react-hooks';
import { Link } from 'react-router-dom';
import utils from '../../../lib/utils';

interface ThumbnailProps {
  commentCid: string;
}

const Thumbnail: FC<ThumbnailProps> = ({ commentCid }) => {
  const comment = useComment({ commentCid });
  const subplebbitAddress = comment.subplebbitAddress;
  const { cid, linkHeight, linkWidth } = comment;
  const commentMediaInfo = utils.getCommentMediaInfoMemoized(comment);
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

  let mediaComponent = null;

  if (commentMediaInfo?.type === 'image') {
    mediaComponent = <img src={commentMediaInfo.url} alt='' />;
  } else if (commentMediaInfo?.type === 'video') {
    mediaComponent = commentMediaInfo.thumbnail ? <img src={commentMediaInfo.thumbnail} alt='' /> : <video src={commentMediaInfo.url} />;
  } else if (commentMediaInfo?.type === 'webpage') {
    mediaComponent = <img src={commentMediaInfo.thumbnail} alt='' />;
  } else if (commentMediaInfo?.type === 'iframe') {
    mediaComponent = iframeThumbnail ? <img src={iframeThumbnail} alt='' /> : null;
  }

  return (
    <span style={{ width: displayWidth, height: displayHeight }} className={styles.thumbnail}>
      <span className={hasLinkDimensions ? styles.transparentThumbnailWrapper : styles.thumbnailWrapper}>
        <Link to={`p/${subplebbitAddress}/c/${cid}`} onClick={(e) => e.preventDefault()}>
          {mediaComponent}
        </Link>
      </span>
    </span>
  );
};

export default Thumbnail;
