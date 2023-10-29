import React, { FC, useMemo } from 'react';
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

  const [displayWidth, displayHeight, hasLinkDimensions] = useMemo(() => {
    let dw, dh, hld;
    if (linkWidth && linkHeight) {
      let scale = Math.min(1, 70 / Math.max(linkWidth, linkHeight));
      dw = `${linkWidth * scale}px`;
      dh = `${linkHeight * scale}px`;
      hld = true;
    } else {
      dw = '70px';
      dh = '70px';
      hld = false;
    }
    return [dw, dh, hld];
  }, [linkWidth, linkHeight]);

  const mediaComponent = useMemo(() => {
    if (commentMediaInfo?.type === 'image') {
      return <img src={commentMediaInfo.url} alt='' />;
    } else if (commentMediaInfo?.type === 'video') {
      return commentMediaInfo.thumbnail ? <img src={commentMediaInfo.thumbnail} alt='' /> : <video src={commentMediaInfo.url} />;
    } else if (commentMediaInfo?.type === 'webpage') {
      return <img src={commentMediaInfo.thumbnail} alt='' />;
    } else if (commentMediaInfo?.type === 'iframe') {
      return iframeThumbnail ? <img src={iframeThumbnail} alt='' /> : null;
    }
  }, [commentMediaInfo, iframeThumbnail]);

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

export default React.memo(Thumbnail);
