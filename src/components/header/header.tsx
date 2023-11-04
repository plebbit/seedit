import { Link, useLocation, useParams } from 'react-router-dom';
import styles from './header.module.css';
import useTheme from '../../hooks/use-theme';
import AccountBar from './account-bar';
import PostHeader from './post-header';
import SortButtons from '../header/sort-buttons';

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
    </div>
  );
};

export default Header;
