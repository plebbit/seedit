import { useTranslation } from 'react-i18next';
import styles from './content-options.module.css';
import useContentOptionsStore from '../../../stores/use-content-options-store';

const MediaOptions = () => {
  const { t } = useTranslation();
  const {
    blurNsfwThumbnails,
    setBlurNsfwThumbnails,
    thumbnailDisplayOption,
    setThumbnailDisplayOption,
    mediaPreviewOption,
    setMediaPreviewOption,
    autoplayVideosOnComments,
    setAutoplayVideosOnComments,
    muteVideosOnComments,
    setMuteVideosOnComments,
  } = useContentOptionsStore();

  return (
    <div className={styles.contentOptions}>
      <div className={styles.contentOptionTitle}>thumbnails</div>
      <div>
        <label>
          <input type='radio' name='thumbnailOption' value='show' checked={thumbnailDisplayOption === 'show'} onChange={() => setThumbnailDisplayOption('show')} />
          Show thumbnails next to links
        </label>
      </div>
      <div>
        <label>
          <input type='radio' name='thumbnailOption' value='hide' checked={thumbnailDisplayOption === 'hide'} onChange={() => setThumbnailDisplayOption('hide')} />
          Don't show thumbnails next to links
        </label>
      </div>
      <div>
        <label
          style={{ cursor: 'not-allowed' }}
          onClick={(e) => {
            e.preventDefault();
            window.alert('This feature is not available yet');
          }}
        >
          <input
            type='radio'
            name='thumbnailOption'
            value='community'
            checked={thumbnailDisplayOption === 'community'}
            onChange={() => setThumbnailDisplayOption('community')}
            disabled
          />
          Show thumbnails based on that community's media preferences
        </label>
      </div>
      <br />
      <div className={styles.contentOptionTitle}>media previews</div>
      <div>
        <label>
          <input
            type='radio'
            name='mediaPreviewOption'
            value='autoExpandAll'
            checked={mediaPreviewOption === 'autoExpandAll'}
            onChange={() => setMediaPreviewOption('autoExpandAll')}
          />
          Auto-expand media previews
        </label>
      </div>
      <div>
        <label>
          <input
            type='radio'
            name='mediaPreviewOption'
            value='autoExpandExceptComments'
            checked={mediaPreviewOption === 'autoExpandExceptComments'}
            onChange={() => setMediaPreviewOption('autoExpandExceptComments')}
          />
          Don't auto-expand media previews on comments pages
        </label>
      </div>
      <div>
        <label
          style={{ cursor: 'not-allowed' }}
          onClick={(e) => {
            e.preventDefault();
            window.alert('This feature is not available yet');
          }}
        >
          <input
            type='radio'
            name='mediaPreviewOption'
            value='community'
            checked={mediaPreviewOption === 'community'}
            onChange={() => setMediaPreviewOption('community')}
            disabled
          />
          Expand media previews based on that community's media preferences
        </label>
      </div>
      <br />
      <div className={styles.contentOptionTitle}>Video Player</div>
      <div>
        <label>
          <input type='checkbox' checked={autoplayVideosOnComments} onChange={(e) => setAutoplayVideosOnComments(e.target.checked)} />
          Autoplay videos on the comments page
        </label>
      </div>
      <div>
        <label>
          <input type='checkbox' checked={muteVideosOnComments} onChange={(e) => setMuteVideosOnComments(e.target.checked)} />
          Mute videos by default
        </label>
      </div>
      <br />
      <div className={styles.contentOptionTitle}>{t('nsfw_content')}</div>
      <div>
        <label>
          <input type='checkbox' checked={blurNsfwThumbnails} onChange={(e) => setBlurNsfwThumbnails(e.target.checked)} />
          {t('blur_media')}
        </label>
      </div>
    </div>
  );
};

const CommunitiesOptions = () => {
  const { t } = useTranslation();
  const {
    hideAdultCommunities,
    hideGoreCommunities,
    hideAntiCommunities,
    hideVulgarCommunities,
    setHideAdultCommunities,
    setHideGoreCommunities,
    setHideAntiCommunities,
    setHideVulgarCommunities,
    hideDefaultCommunities,
    setHideDefaultCommunities,
  } = useContentOptionsStore();

  return (
    <div className={styles.contentOptions}>
      <div className={styles.contentOptionTitle}>{t('default_communities')}</div>
      <div>
        <input
          type='checkbox'
          id='hideAdultCommunities'
          ref={(el) => {
            if (el) {
              const allHidden = hideAdultCommunities && hideGoreCommunities && hideAntiCommunities && hideVulgarCommunities;
              const someHidden = hideAdultCommunities || hideGoreCommunities || hideAntiCommunities || hideVulgarCommunities;

              el.checked = allHidden;
              el.indeterminate = someHidden && !allHidden;
            }
          }}
          onChange={(e) => {
            const newValue = e.target.checked;
            setHideAdultCommunities(newValue);
            setHideGoreCommunities(newValue);
            setHideAntiCommunities(newValue);
            setHideVulgarCommunities(newValue);
          }}
        />
        <label htmlFor='hideAdultCommunities'>{t('hide_communities_tagged_as_nsfw')}</label>
      </div>
      <div className={styles.nsfwTag}>
        <label>
          <input
            type='checkbox'
            checked={hideAdultCommunities}
            onChange={(e) => {
              setHideAdultCommunities(e.target.checked);
            }}
          />
          {t('tagged_as_adult')}
        </label>
      </div>
      <div className={styles.nsfwTag}>
        <label>
          <input
            type='checkbox'
            checked={hideGoreCommunities}
            onChange={(e) => {
              setHideGoreCommunities(e.target.checked);
            }}
          />
          {t('tagged_as_gore')}
        </label>
      </div>
      <div className={styles.nsfwTag}>
        <label>
          <input
            type='checkbox'
            checked={hideAntiCommunities}
            onChange={(e) => {
              setHideAntiCommunities(e.target.checked);
            }}
          />
          {t('tagged_as_anti')}
        </label>
      </div>
      <div className={styles.nsfwTag}>
        <label>
          <input
            type='checkbox'
            checked={hideVulgarCommunities}
            onChange={(e) => {
              setHideVulgarCommunities(e.target.checked);
            }}
          />
          {t('tagged_as_vulgar')}
        </label>
      </div>
      <br />
      <div className={styles.contentOptionTitle}>topbar</div>
      <label>
        <input type='checkbox' checked={hideDefaultCommunities} onChange={(e) => setHideDefaultCommunities(e.target.checked)} />
        {t('hide_default_communities_from_topbar')}
      </label>
    </div>
  );
};

const ContentOptions = () => {
  const { t } = useTranslation();

  return (
    <div className={styles.content}>
      <div className={styles.category}>
        <span className={styles.categoryTitle}>{t('media')}</span>
        <span className={styles.categorySettings}>
          <MediaOptions />
        </span>
      </div>
      <div className={styles.category}>
        <span className={styles.categoryTitle}>{t('communities')}</span>
        <span className={styles.categorySettings}>
          <CommunitiesOptions />
        </span>
      </div>
    </div>
  );
};

export default ContentOptions;
