import { useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { useSubplebbit } from '@plebbit/plebbit-react-hooks';
import { useTranslation } from 'react-i18next';
import styles from './subplebbit-settings.module.css';

const SubplebbitSettings = () => {
  const { t } = useTranslation();
  const { subplebbitAddress } = useParams<{ subplebbitAddress: string }>();
  const subplebbit = useSubplebbit({ subplebbitAddress });
  const { description, rules, suggested, roles, title } = subplebbit || {};

  useEffect(() => {
    document.title = `${t('preferences')} - seedit`;
  }, [t]);

  return (
    <div className={styles.content}>
      <div className={styles.box}>
        <div className={styles.boxTitle}>{t('title')}</div>
        <div className={styles.boxSubtitle}>e.g., books: made from trees or pixels. recommendations, news, or thoughts</div>
        <div className={styles.boxInput}>
          <input type='text' defaultValue={title} />
        </div>
      </div>
      <div className={styles.box}>
        <div className={styles.boxTitle}>{t('description')}</div>
        <div className={styles.boxSubtitle}>shown in the sidebar of your community</div>
        <div className={styles.boxInput}>
          <textarea defaultValue={description} />
        </div>
      </div>
      <div className={styles.box}>
        <div className={styles.boxTitle}>logo</div>
        <div className={styles.boxSubtitle}>set a community logo using its direct image link (ending in .jpg, .png)</div>
        <div className={styles.boxInput}>
          <input type='text' defaultValue={suggested?.avatarUrl} />
        </div>
      </div>
      <div className={styles.box}>
        <div className={styles.boxTitle}>{t('rules')}</div>
        <div className={styles.boxSubtitle}>shown in the sidebar of your community</div>
        <div className={styles.boxInput}>
          <textarea defaultValue={rules} autoCorrect='off' autoComplete='off' />
        </div>
      </div>
      <div className={styles.box}>
        <div className={styles.boxTitle}>{t('moderators')}</div>
        <div className={styles.boxSubtitle}>let other users moderate and post without challenges</div>
        <div className={styles.boxInput}>
          <textarea defaultValue={roles} autoCorrect='off' autoComplete='off' />
        </div>
      </div>
      <div className={styles.box}>
        <div className={styles.boxTitle}>{t('challenge')}</div>
        <div className={styles.boxSubtitle}>choose a challenge to prevent spam</div>
        <div className={styles.boxInput}>
          <textarea autoCorrect='off' autoComplete='off' />
        </div>
      </div>
    </div>
  );
};

export default SubplebbitSettings;
