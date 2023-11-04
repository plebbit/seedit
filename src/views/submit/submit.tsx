import { Link, useParams } from 'react-router-dom';
import { useSubplebbit } from '@plebbit/plebbit-react-hooks';
import styles from './submit.module.css';
import useCurrentView from '../../hooks/use-current-view';
import { useTranslation } from 'react-i18next';

const Submit = () => {
  const { t } = useTranslation();
  const { isSubplebbitSubmitView } = useCurrentView();
  const { subplebbitAddress } = useParams();
  const subplebbit = useSubplebbit({ subplebbitAddress });
  const { title, shortAddress } = subplebbit || {};
  const subLocation = (
    <Link to={`/p/${subplebbitAddress}`} className={styles.location} onClick={(e) => e.preventDefault()}>
      {title || shortAddress}
    </Link>
  );

  return (
    <div className={styles.content}>
      <h1>
        {t('submit_to_before')}
        {isSubplebbitSubmitView ? subLocation : 'seedit'}
        {t('submit_to_after')}
      </h1>
      <div className={styles.form}>
        <div className={styles.formContent}>
          <div className={styles.field}>
            <span className={styles.fieldTitleOptional}>url</span>
            <span className={styles.optional}> ({t('optional')})</span>
            <div className={styles.fieldContent}>
              <input className={`${styles.input} ${styles.inputUrl}`} type='text' />
              <div className={styles.description}>{t('submit_url_description')}</div>
            </div>
          </div>
          <div className={styles.field}>
            <span className={styles.fieldTitleRequired}>{t('title')}</span>
            <div className={styles.fieldContent}>
              <textarea className={`${styles.input} ${styles.inputTitle}`} />
            </div>
          </div>
          <div className={styles.field}>
            <span className={styles.fieldTitleOptional}>{t('text')}</span>
            <span className={styles.optional}> ({t('optional')})</span>
            <div className={styles.fieldContent}>
              <textarea className={`${styles.input} ${styles.inputText}`} />
            </div>
          </div>
          <div className={styles.field}>
            <span className={styles.fieldTitleRequired}>choose where to post</span>
            <div className={styles.fieldContent}>
              <span className={styles.fieldSubtitle}>{t('community address')}:</span>
              <input className={`${styles.input} ${styles.inputCommunity}`} type='text' defaultValue={subplebbitAddress} />
            </div>
          </div>
          <div className={`${styles.field} ${styles.notice}`}>please be mindful of the community's rules, seedit does not have global admins.</div>
          <div>*{t('required')}</div>
          <div className={styles.submit}>
            <button className={styles.submitButton}>{t('submit')}</button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Submit;
