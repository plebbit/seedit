import { Link } from 'react-router-dom';
import styles from './expando.module.css';
import Embed from '../embed';
import { CommentMediaInfo } from '../../../lib/utils/media-utils';
import Markdown from '../../markdown';
import { useTranslation } from 'react-i18next';

interface ExpandoProps {
  commentMediaInfo?: CommentMediaInfo;
  content?: string;
  expanded: boolean;
  link: string;
  reason?: string;
  showContent: boolean;
  toggleExpanded?: () => void;
}

const Expando = ({ commentMediaInfo, content, expanded, link, reason, showContent, toggleExpanded }: ExpandoProps) => {
  const { t } = useTranslation();

  let mediaComponent = null;
  let noExpandButton = false;

  if (commentMediaInfo?.type === 'image') {
    mediaComponent = <img src={commentMediaInfo.url} alt='' />;
    noExpandButton = true;
  } else if (commentMediaInfo?.type === 'video' && expanded) {
    mediaComponent = <video src={commentMediaInfo.url} controls />;
  } else if (commentMediaInfo?.type === 'webpage' && commentMediaInfo?.thumbnail) {
    mediaComponent = <img src={commentMediaInfo.thumbnail} alt='' />;
    noExpandButton = true;
  } else if (commentMediaInfo?.type === 'audio' && expanded) {
    mediaComponent = <audio src={commentMediaInfo.url} controls />;
  } else if (commentMediaInfo?.type === 'iframe' && expanded) {
    mediaComponent = <Embed url={commentMediaInfo.url} />;
  }

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
          <div className={styles.markdown}>
            <Markdown content={content} />
            {reason && (
              <div className={styles.modEdit}>
                <br />
                {t('mod_edit')}: {reason}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default Expando;
