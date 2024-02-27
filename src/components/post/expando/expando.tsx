import { useState } from 'react';
import { Link } from 'react-router-dom';
import styles from './expando.module.css';
import Embed from '../embed';
import { CommentMediaInfo } from '../../../lib/utils/media-utils';
import Markdown from '../../markdown';
import { useTranslation } from 'react-i18next';

interface ExpandoProps {
  authorEditReason?: string;
  commentMediaInfo?: CommentMediaInfo;
  content?: string;
  expanded: boolean;
  link?: string;
  modEditReason?: string;
  removed?: boolean;
  showContent: boolean;
  spoiler?: boolean;
  toggleExpanded?: () => void;
}

const Expando = ({ authorEditReason, commentMediaInfo, content, expanded, link, modEditReason, removed, showContent, spoiler = false, toggleExpanded }: ExpandoProps) => {
  const { t } = useTranslation();

  const [showSpoiler, setShowSpoiler] = useState(false);

  let mediaComponent = null;

  if (commentMediaInfo?.type === 'image') {
    mediaComponent = <img src={commentMediaInfo.url} alt='' />;
  } else if (commentMediaInfo?.type === 'video' && expanded) {
    mediaComponent = <video src={commentMediaInfo.url} controls />;
  } else if (commentMediaInfo?.type === 'webpage' && commentMediaInfo?.thumbnail) {
    mediaComponent = <img src={commentMediaInfo.thumbnail} alt='' />;
  } else if (commentMediaInfo?.type === 'audio' && expanded) {
    mediaComponent = <audio src={commentMediaInfo.url} controls />;
  } else if (commentMediaInfo?.type === 'iframe' && expanded) {
    mediaComponent = <Embed url={commentMediaInfo.url} />;
  }

  return (
    <div
      className={expanded ? styles.expando : styles.expandoHidden}
      onClick={() => {
        spoiler && !showSpoiler && setShowSpoiler(true);
      }}
    >
      {spoiler && !showSpoiler && (
        <>
          <div className={styles.hideSpoiler} />
          <span className={styles.showSpoilerButton}>{t('view_spoiler')}</span>
        </>
      )}
      {link && !removed && (
        <div className={styles.mediaPreview}>
          <Link
            to={link}
            onClick={(e) => {
              if (e.button === 0) {
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
            {modEditReason && (
              <div>
                <br />
                {t('mod_reason')}: {modEditReason}
              </div>
            )}
            {authorEditReason && (
              <div>
                <br />
                {t('edit')}: {authorEditReason}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default Expando;
