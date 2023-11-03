import { Link, useParams } from 'react-router-dom';
import styles from './post-buttons.module.css';
import { useTranslation } from 'react-i18next';
import { useSubplebbit } from '@plebbit/plebbit-react-hooks';

const PostButtons = () => {
  const { t } = useTranslation();
  const { subplebbitAddress, commentCid } = useParams();
  const subplebbit = useSubplebbit({ subplebbitAddress });
  const { title, shortAddress } = subplebbit || {};

  return (
    <div className={styles.wrapper}>
      <span className={styles.pageName}>
        <Link
          to={`/p/${subplebbitAddress}`}
          onClick={(e) => {
            e.preventDefault();
          }}
        >
          {title || shortAddress}
        </Link>
      </span>
      <ul className={styles.tabMenu}>
        <li>
          <Link to={`/p/${subplebbitAddress}/c/${commentCid}`}>{t('header_comments')}</Link>
        </li>
      </ul>
    </div>
  );
};

export default PostButtons;
