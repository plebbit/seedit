import { Link, useLocation, useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import styles from './header.module.css';
import useTheme from '../../hooks/use-theme';
import AccountBar from './account-bar';
import PostHeader from './post-header';
import SortButtons from '../header/sort-buttons';

// prettier-ignore
const availableLanguages = ['ar', 'bn', 'cs', 'da', 'de', 'el', 'en', 'es', 'fa', 'fi', 'fil', 'fr', 'he', 'hi', 'hu', 'id', 'it', 'ja', 'ko', 'mr', 'nl', 'no', 'pl', 'pt', 'ro', 'ru', 'sq', 'sv', 'te', 'th', 'tr', 'uk', 'ur', 'vi', 'zh'];

// TODO: move to settings page
const Theme = () => {
  const [theme, setTheme] = useTheme();
  const { t } = useTranslation();

  return (
    <div style={{ padding: '5px' }}>
      <select value={theme} onChange={(e) => setTheme(e.target.value)}>
        <option value='light'>{t('light')}</option>
        <option value='dark'>{t('dark')}</option>
      </select>
    </div>
  );
};

// TODO: move to settings page
const Language = () => {
  const { i18n } = useTranslation();
  const { changeLanguage, language } = i18n;

  const onSelectLanguage = (e: React.ChangeEvent<HTMLSelectElement>) => {
    changeLanguage(e.target.value);
  };

  return (
    <div style={{ padding: '5px' }}>
      <select value={language} onChange={onSelectLanguage}>
        {availableLanguages.map((lang) => (
          <option key={lang} value={lang}>
            {lang}
          </option>
        ))}
      </select>
    </div>
  );
};

const Header = () => {
  const [theme] = useTheme();
  const { sortType, subplebbitAddress, commentCid } = useParams();
  const location = useLocation();

  let buttons = null;

  if (location.pathname === `/p/${subplebbitAddress}/c/${commentCid}`) {
    buttons = <PostHeader />;
  } else if (location.pathname === `/` || (sortType && ['hot', 'new', 'active', 'controversialAll', 'topAll'].includes(sortType))) {
    buttons = <SortButtons />;
  }

  return (
    <div className={styles.header}>
      <AccountBar />
      <div className={styles.container}>
        <Link to='/' style={{ all: 'unset', cursor: 'pointer' }}>
          <img className={styles.logo} src='/assets/logo/seedit.png' alt='logo' />
          <img src={`${process.env.PUBLIC_URL}/assets/logo/seedit-text-${theme === 'dark' ? 'dark' : 'light'}.svg`} className={styles.logoText} alt='logo' />
        </Link>
        {buttons}
      </div>
      <div className={styles.temporary}>
        <Language />
        <Theme />
      </div>
    </div>
  );
};

export default Header;
