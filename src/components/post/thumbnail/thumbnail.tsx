import styles from './thumbnail.module.css';
import { Link } from 'react-router-dom';
import { CommentMediaInfo } from '../../../lib/utils/media-utils';

interface ThumbnailProps {
  cid?: string;
  commentMediaInfo?: CommentMediaInfo;
  expanded?: boolean;
  isReply: boolean;
  link: string;
  linkHeight?: number;
  linkWidth?: number;
  subplebbitAddress?: string;
  toggleExpanded?: () => void;
}

const Thumbnail = ({ cid, commentMediaInfo, expanded = false, isReply = false, link, linkHeight, linkWidth, subplebbitAddress, toggleExpanded }: ThumbnailProps) => {
  const iframeThumbnail = commentMediaInfo?.patternThumbnailUrl || commentMediaInfo?.thumbnail;
  let displayWidth, displayHeight, hasLinkDimensions;
  const routeOrLink = isReply ? link : `/p/${subplebbitAddress}/c/${cid}`;

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
    <span style={{ width: displayWidth, height: displayHeight, display: expanded ? 'none' : 'block' }} className={styles.thumbnail}>
      <span className={hasLinkDimensions ? styles.transparentThumbnailWrapper : styles.thumbnailWrapper}>
        <Link
          to={routeOrLink}
          onClick={(e) => {
            if (e.button === 0 && isReply) {
              e.preventDefault();
              toggleExpanded && toggleExpanded();
            }
          }}
        >
          {mediaComponent}
        </Link>
      </span>
    </span>
  );
};

export default Thumbnail;
