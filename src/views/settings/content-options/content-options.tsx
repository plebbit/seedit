import { useTranslation } from 'react-i18next';
import styles from './content-options.module.css';
import useContentOptionsStore from '../../../stores/use-content-options-store';

const MediaOptions = () => {
  const { t } = useTranslation();
  const { blurNsfwThumbnails, setBlurNsfwThumbnails } = useContentOptionsStore();

  return (
    <div className={styles.contentOptions}>
      <div className={styles.contentOptionTitle}>{t('nsfw_content')}</div>
      <div>
        <input type='checkbox' id='blurNsfwThumbnails' checked={blurNsfwThumbnails} onChange={(e) => setBlurNsfwThumbnails(e.target.checked)} />
        <label htmlFor='blurNsfwThumbnails'>{t('blur_media')}</label>
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
      <div>
        <input
          type='checkbox'
          id='hideAdultCommunities'
          ref={(el) => {
            if (el) {
              const allChecked = !hideAdultCommunities && !hideGoreCommunities && !hideAntiCommunities && !hideVulgarCommunities;
              const someChecked = !hideAdultCommunities || !hideGoreCommunities || !hideAntiCommunities || !hideVulgarCommunities;

              el.checked = allChecked;
              el.indeterminate = someChecked && !allChecked;
            }
          }}
          onChange={(e) => {
            const newValue = e.target.checked;
            setHideAdultCommunities(!newValue);
            setHideGoreCommunities(!newValue);
            setHideAntiCommunities(!newValue);
            setHideVulgarCommunities(!newValue);
          }}
        />
        <label htmlFor='hideAdultCommunities'>{t('hide_communities_tagged_as_nsfw')}</label>
      </div>
      <div className={styles.nsfwTag}>
        <label>
          <input type='checkbox' checked={!hideAdultCommunities} onChange={(e) => setHideAdultCommunities(!e.target.checked)} />
          {t('tagged_as_adult')}
        </label>
      </div>
      <div className={styles.nsfwTag}>
        <label>
          <input type='checkbox' checked={!hideGoreCommunities} onChange={(e) => setHideGoreCommunities(!e.target.checked)} />
          {t('tagged_as_gore')}
        </label>
      </div>
      <div className={styles.nsfwTag}>
        <label>
          <input type='checkbox' checked={!hideAntiCommunities} onChange={(e) => setHideAntiCommunities(!e.target.checked)} />
          {t('tagged_as_anti')}
        </label>
      </div>
      <div className={styles.nsfwTag}>
        <label>
          <input type='checkbox' checked={!hideVulgarCommunities} onChange={(e) => setHideVulgarCommunities(!e.target.checked)} />
          {t('tagged_as_vulgar')}
        </label>
      </div>
      <br />
      <div className={styles.contentOptionTitle}>{t('communities')}</div>
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
