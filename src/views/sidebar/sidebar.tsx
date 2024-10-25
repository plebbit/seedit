import { useEffect } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import Sidebar from '../../components/sidebar';
import AuthorSidebar from '../../components/author-sidebar';
import styles from './sidebar.module.css';
import { useComment, useSubplebbit } from '@plebbit/plebbit-react-hooks';
import { isAuthorView, isProfileView } from '../../lib/utils/view-utils';
import useIsMobile from '../../hooks/use-is-mobile';

const SidebarView = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const isMobile = useIsMobile();
  const { commentCid, subplebbitAddress } = useParams();

  useEffect(() => {
    if (!isMobile && location.pathname.endsWith('/sidebar')) {
      const newPath = location.pathname.replace(/\/sidebar$/, '');
      navigate(newPath || '/');
    }
  }, [isMobile, location.pathname, navigate]);

  const isAuthor = isAuthorView(location.pathname);
  const isProfile = isProfileView(location.pathname);

  const subplebbit = useSubplebbit({ subplebbitAddress });
  const comment = useComment({ commentCid });

  return <div className={styles.content}>{isMobile && (isProfile || isAuthor ? <AuthorSidebar /> : <Sidebar comment={comment} subplebbit={subplebbit} />)}</div>;
};

export default SidebarView;
