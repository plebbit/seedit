import { FC } from 'react';
import { useComment } from '@plebbit/plebbit-react-hooks';
import utils from '../../lib/utils';
import { Link } from 'react-router-dom';
import styles from './expando.module.css';
import Embed from '../embed';
import { CommentMediaInfo } from '../../lib/utils';

interface ExpandoProps {
  commentCid: string;
  expanded: boolean;
}

const Expando: FC<ExpandoProps> = ({ commentCid, expanded }) => {
  const comment = useComment({ commentCid });
  const { cid, content, link, subplebbitAddress } = comment || {};
  const commentMediaInfo = utils.getCommentMediaInfoMemoized(comment);

  // prettier-ignore
  const mediaComponents: { [key in CommentMediaInfo['type']]?: JSX.Element | null } = {
    'image': <img src={commentMediaInfo?.url} alt='' />,
    'video': expanded ? <video src={commentMediaInfo?.url} controls /> : null,
    'webpage': <img src={commentMediaInfo?.thumbnail} alt='' />,
    'audio': expanded ? <audio src={commentMediaInfo?.url} controls /> : null,
    'iframe': expanded ? <Embed url={commentMediaInfo?.url} /> : null,
  };

  return (
    <div className={expanded ? styles.expando : styles.expandoHidden}>
      {link && (
        <div className={styles.mediaPreview}>
          <Link to={`p/${subplebbitAddress}/c/${cid}`} onClick={(e) => e.preventDefault()}>
            {commentMediaInfo?.type ? mediaComponents[commentMediaInfo.type] : null}
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
