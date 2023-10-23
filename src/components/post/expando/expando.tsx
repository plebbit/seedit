import { FC } from 'react';
import { useComment } from '@plebbit/plebbit-react-hooks';
import utils from '../../../lib/utils';
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
      {content && (
        <div className={styles.usertext}>
          <div className={styles.markdown}>{content}</div>
        </div>
      )}
    </div>
  );
};

export default Expando;
