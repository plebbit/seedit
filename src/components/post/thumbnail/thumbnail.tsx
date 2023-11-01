import { FC, useMemo } from 'react';
import styles from './thumbnail.module.css';
import { Link } from 'react-router-dom';
import { CommentMediaInfo } from '../../../lib/utils';

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

const Thumbnail: FC<ThumbnailProps> = ({ cid, commentMediaInfo, expanded = false, isReply = false, link, linkHeight, linkWidth, subplebbitAddress, toggleExpanded }) => {
  const iframeThumbnail = commentMediaInfo?.patternThumbnailUrl || commentMediaInfo?.thumbnail;

  const { displayWidth, displayHeight, hasLinkDimensions } = useMemo(() => {
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
    return { displayWidth: dw, displayHeight: dh, hasLinkDimensions: hld };
  }, [linkWidth, linkHeight]);

  const mediaComponent = useMemo(() => {
    let component = null;
    if (commentMediaInfo?.type === 'image') {
      component = <img src={commentMediaInfo.url} alt='' />;
    } else if (commentMediaInfo?.type === 'video') {
      component = commentMediaInfo.thumbnail ? <img src={commentMediaInfo.thumbnail} alt='' /> : <video src={commentMediaInfo.url} />;
    } else if (commentMediaInfo?.type === 'webpage') {
      component = <img src={commentMediaInfo.thumbnail} alt='' />;
    } else if (commentMediaInfo?.type === 'iframe') {
      component = iframeThumbnail ? <img src={iframeThumbnail} alt='' /> : null;
    }
    return component;
  }, [commentMediaInfo, iframeThumbnail]);

  const routeOrLink = isReply ? link : `/p/${subplebbitAddress}/c/${cid}`;

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
