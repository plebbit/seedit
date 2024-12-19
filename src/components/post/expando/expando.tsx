import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import styles from './expando.module.css';
import Embed from '../embed';
import { CommentMediaInfo } from '../../../lib/utils/media-utils';
import Markdown from '../../markdown';
import { useTranslation } from 'react-i18next';
import useFilterSettingsStore from '../../../stores/use-filter-settings-store';

interface ExpandoProps {
  authorEditReason?: string;
  commentMediaInfo?: CommentMediaInfo;
  content?: string;
  deleted?: boolean;
  expanded: boolean;
  link?: string;
  modEditReason?: string;
  nsfw?: boolean;
  removed?: boolean;
  showContent: boolean;
  spoiler?: boolean;
  toggleExpanded?: () => void;
}

const Expando = ({
  authorEditReason,
  commentMediaInfo,
  content,
  deleted,
  expanded,
  link,
  modEditReason,
  nsfw,
  removed,
  showContent,
  spoiler = false,
  toggleExpanded,
}: ExpandoProps) => {
  const { t } = useTranslation();
  const { blurNsfwThumbnails, setBlurNsfwThumbnails } = useFilterSettingsStore();
  const [hideContent, setHideContent] = useState(blurNsfwThumbnails);
  const [alwaysShowNsfw, setAlwaysShowNsfw] = useState(false);

  useEffect(() => {
    if (!expanded) {
      setHideContent(true);
    }
  }, [expanded]);

  const handleAlwaysShowNsfw = () => {
    setBlurNsfwThumbnails(false);
    setHideContent(false);
    setAlwaysShowNsfw(true);
  };

  let mediaComponent = null;

  if (commentMediaInfo?.type === 'image' || commentMediaInfo?.type === 'gif') {
    mediaComponent = <img src={commentMediaInfo.url} alt='' />;
  } else if (commentMediaInfo?.type === 'video' && expanded) {
    mediaComponent = <video src={`${commentMediaInfo.url}#t=0.001`} controls />;
  } else if (commentMediaInfo?.type === 'webpage' && commentMediaInfo?.thumbnail) {
    mediaComponent = <img src={commentMediaInfo.thumbnail} alt='' />;
  } else if (commentMediaInfo?.type === 'audio' && expanded) {
    mediaComponent = <audio src={commentMediaInfo.url} controls />;
  } else if (commentMediaInfo?.type === 'iframe' && expanded) {
    mediaComponent = <Embed url={commentMediaInfo.url} />;
  }

  return (
    <div className={expanded ? styles.expando : styles.expandoHidden}>
      {link && !removed && commentMediaInfo?.type !== 'webpage' && (
        <div className={styles.mediaPreview} onClick={() => setHideContent(false)}>
          {((nsfw && blurNsfwThumbnails) || spoiler) && hideContent && link && commentMediaInfo?.type !== 'webpage' && !(deleted || removed) && (
            <>
              <div className={styles.blurContent} />
              <span className={styles.unblurButton}>{nsfw && spoiler ? t('see_nsfw_spoiler') : spoiler ? t('view_spoiler') : nsfw ? t('see_nsfw') : ''}</span>
              {nsfw && (
                <span className={styles.alwaysShowNsfwButton} onClick={handleAlwaysShowNsfw}>
                  {t('always_show_nsfw')}
                </span>
              )}
            </>
          )}
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
      {alwaysShowNsfw && (
        <div className={styles.alwaysShowNsfwContainer}>
          <div className={styles.alwaysShowNsfwNotice}>
            <p>{t('always_show_nsfw_notice')}</p>
            <button onClick={() => setAlwaysShowNsfw(false)}>{t('undo')}</button>
          </div>
        </div>
      )}
      {content && showContent && (
        <div className={styles.usertext}>
          <div className={styles.markdown}>
            <Markdown content={content} />
            {modEditReason && (
              <p>
                {t('mod_reason')}: {modEditReason}
              </p>
            )}
            {authorEditReason && !(removed || deleted) && (
              <p>
                {t('edit')}: {authorEditReason}
              </p>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default Expando;
