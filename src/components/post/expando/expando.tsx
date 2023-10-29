import { FC } from 'react';
import { Link } from 'react-router-dom';
import styles from './expando.module.css';
import Embed from '../embed';
import { CommentMediaInfo } from '../../../lib/utils';

interface ExpandoProps {
  cid: string;
  commentMediaInfo?: CommentMediaInfo;
  content?: string;
  expanded: boolean;
  link?: boolean;
  showContent: boolean;
  subplebbitAddress: string;
}

const Expando: FC<ExpandoProps> = ({ cid, commentMediaInfo, content, expanded, link, showContent, subplebbitAddress }) => {
  let mediaComponent = null;

  if (commentMediaInfo?.type === 'image') {
    mediaComponent = <img src={commentMediaInfo.url} alt='' />;
  } else if (commentMediaInfo?.type === 'video' && expanded) {
    mediaComponent = <video src={commentMediaInfo.url} controls />;
  } else if (commentMediaInfo?.type === 'webpage') {
    mediaComponent = <img src={commentMediaInfo.thumbnail} alt='' />;
  } else if (commentMediaInfo?.type === 'audio' && expanded) {
    mediaComponent = <audio src={commentMediaInfo.url} controls />;
  } else if (commentMediaInfo?.type === 'iframe' && expanded) {
    mediaComponent = <Embed url={commentMediaInfo.url} />;
  }

  return (
    <div className={expanded ? styles.expando : styles.expandoHidden}>
      {link && (
        <div className={styles.mediaPreview}>
          <Link to={`p/${subplebbitAddress}/c/${cid}`} onClick={(e) => e.preventDefault()}>
            {mediaComponent}
          </Link>
        </div>
      )}
      {content && showContent && (
        <div className={styles.usertext}>
          <div className={styles.markdown}>{content}</div>
        </div>
      )}
    </div>
  );
};

export default Expando;
