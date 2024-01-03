import styles from './subplebbit-settings.module.css';
import { useParams } from 'react-router-dom';
import { useSubplebbit } from '@plebbit/plebbit-react-hooks';

const SubplebbitSettings = () => {
  const { subplebbitAddress } = useParams<{ subplebbitAddress: string }>();
  const subplebbit = useSubplebbit({ subplebbitAddress });
  const { description, rules, suggested, roles, title } = subplebbit || {};

  return (
    <div className={styles.content}>
      <div className={styles.box}>
        <div className={styles.boxTitle}>title</div>
        <div className={styles.boxSubtitle}>e.g., books: made from trees or pixels. recommendations, news, or thoughts</div>
        <div className={styles.boxInput}>
          <input type='text' defaultValue={title} />
        </div>
      </div>
      <div className={styles.box}>
        <div className={styles.boxTitle}>description</div>
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
        <div className={styles.boxTitle}>rules</div>
        <div className={styles.boxSubtitle}>shown in the sidebar of your community</div>
        <div className={styles.boxInput}>
          <textarea defaultValue={rules} autoCorrect='off' autoComplete='off' />
        </div>
      </div>
      <div className={styles.box}>
        <div className={styles.boxTitle}>moderators</div>
        <div className={styles.boxSubtitle}>let other users moderate and post without challenges</div>
        <div className={styles.boxInput}>
          <textarea defaultValue={roles} autoCorrect='off' autoComplete='off' />
        </div>
      </div>
      <div className={styles.box}>
        <div className={styles.boxTitle}>challenge</div>
        <div className={styles.boxSubtitle}>choose a challenge to prevent spam</div>
        <div className={styles.boxInput}>
          <textarea autoCorrect='off' autoComplete='off' />
        </div>
      </div>
    </div>
  );
};

export default SubplebbitSettings;
