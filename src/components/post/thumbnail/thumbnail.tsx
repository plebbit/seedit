import styles from './thumbnail.module.css';
import { Link } from 'react-router-dom';
import { CommentMediaInfo } from '../../../lib/utils/media-utils';
import useFetchGifFirstFrame from '../../../hooks/use-fetch-gif-first-frame';

interface ThumbnailProps {
  cid?: string;
  commentMediaInfo?: CommentMediaInfo;
  expanded?: boolean;
  isLink: boolean;
  isReply: boolean;
  isSpoiler?: boolean;
  isText: boolean;
  link: string;
  linkHeight?: number;
  linkWidth?: number;
  subplebbitAddress?: string;
  toggleExpanded?: () => void;
}

const Thumbnail = ({
  cid,
  commentMediaInfo,
  expanded = false,
  isLink = false,
  isReply = false,
  isSpoiler = false,
  isText = false,
  link,
  linkHeight,
  linkWidth,
  subplebbitAddress,
  toggleExpanded,
}: ThumbnailProps) => {
  const iframeThumbnail = commentMediaInfo?.patternThumbnailUrl || commentMediaInfo?.thumbnail;
  let displayWidth, displayHeight, hasLinkDimensions;
  const thumbnailClass = expanded ? styles.thumbnailHidden : styles.thumbnailVisible;

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

  if (isText || isLink || isSpoiler) {
    displayWidth = '50px';
    displayHeight = '50px';
    hasLinkDimensions = true;
  }

  const style = hasLinkDimensions ? ({ '--width': displayWidth, '--height': displayHeight } as React.CSSProperties) : {};

  let mediaComponent = null;
  const gifFrameUrl = useFetchGifFirstFrame(commentMediaInfo?.type === 'gif' ? commentMediaInfo.url : undefined);

  if (commentMediaInfo?.type === 'image') {
    mediaComponent = <img src={commentMediaInfo.url} alt='' />;
  } else if (commentMediaInfo?.type === 'video') {
    mediaComponent = commentMediaInfo.thumbnail ? <img src={commentMediaInfo.thumbnail} alt='' /> : <video src={`${commentMediaInfo.url}#t=0.001`} />;
  } else if (commentMediaInfo?.type === 'webpage') {
    mediaComponent = <img src={commentMediaInfo.thumbnail} alt='' />;
  } else if (commentMediaInfo?.type === 'iframe') {
    mediaComponent = iframeThumbnail ? <img src={iframeThumbnail} alt='' /> : null;
  } else if (commentMediaInfo?.type === 'gif') {
    mediaComponent = <img src={gifFrameUrl || commentMediaInfo.url} alt='' />;
  }

  if (isText) {
    mediaComponent = <span className={`${styles.iconThumbnail} ${styles.textIcon}`} />;
  }

  if (isLink) {
    mediaComponent = <span className={`${styles.iconThumbnail} ${styles.linkIcon}`} />;
  }

  if (isSpoiler) {
    mediaComponent = <span className={`${styles.iconThumbnail} ${styles.spoilerIcon}`} />;
  }

  return (
    <span className={`${styles.thumbnail} ${thumbnailClass}`} style={style}>
      <span className={hasLinkDimensions ? styles.transparentThumbnailWrapper : styles.thumbnailWrapper}>
        {isReply || commentMediaInfo?.type === 'webpage' ? (
          <a
            href={link}
            target='_blank'
            rel='noopener noreferrer'
            onClick={(e) => {
              if (e.button === 0 && isReply) {
                e.preventDefault();
                toggleExpanded && toggleExpanded();
              }
            }}
          >
            {mediaComponent}
          </a>
        ) : (
          <Link to={`/p/${subplebbitAddress}/c/${cid}`}>{mediaComponent}</Link>
        )}
      </span>
    </span>
  );
};

export default Thumbnail;
