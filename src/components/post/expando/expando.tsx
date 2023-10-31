import { FC, useMemo } from 'react';
import { Link } from 'react-router-dom';
import styles from './expando.module.css';
import Embed from '../embed';
import { CommentMediaInfo } from '../../../lib/utils';

interface ExpandoProps {
  commentMediaInfo?: CommentMediaInfo;
  content?: string;
  expanded: boolean;
  link: string;
  showContent: boolean;
  toggleExpanded?: () => void;
}

const Expando: FC<ExpandoProps> = ({ commentMediaInfo, content, expanded, link, showContent, toggleExpanded }) => {
  const { mediaComponent, noExpandButton } = useMemo(() => {
    let component = null;
    let noExpandBtn = false;

    if (commentMediaInfo?.type === 'image') {
      component = <img src={commentMediaInfo.url} alt='' />;
      noExpandBtn = true;
    } else if (commentMediaInfo?.type === 'video' && expanded) {
      component = <video src={commentMediaInfo.url} controls />;
    } else if (commentMediaInfo?.type === 'webpage' && commentMediaInfo?.thumbnail) {
      component = <img src={commentMediaInfo.thumbnail} alt='' />;
      noExpandBtn = true;
    } else if (commentMediaInfo?.type === 'audio' && expanded) {
      component = <audio src={commentMediaInfo.url} controls />;
    } else if (commentMediaInfo?.type === 'iframe' && expanded) {
      component = <Embed url={commentMediaInfo.url} />;
    }

    return { mediaComponent: component, noExpandButton: noExpandBtn };
  }, [commentMediaInfo, expanded]);

  return (
    <div className={expanded ? styles.expando : styles.expandoHidden}>
      {link && (
        <div className={styles.mediaPreview}>
          <Link
            to={link}
            onClick={(e) => {
              if (e.button === 0 && noExpandButton) {
                e.preventDefault();
                toggleExpanded && toggleExpanded();
              }
            }}
          >
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
