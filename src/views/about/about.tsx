import { useLocation, useParams } from 'react-router-dom';
import Sidebar from '../../components/sidebar';
import AuthorSidebar from '../../components/author-sidebar';
import styles from './about.module.css';
import { useComment, useSubplebbit } from '@plebbit/plebbit-react-hooks';
import { isAuthorView, isProfileView } from '../../lib/utils/view-utils';

const About = () => {
  const location = useLocation();
  const isAuthor = isAuthorView(location.pathname);
  const isProfile = isProfileView(location.pathname);

  const { commentCid, subplebbitAddress } = useParams();
  const subplebbit = useSubplebbit({ subplebbitAddress });
  const comment = useComment({ commentCid });

  return <div className={styles.content}>{isProfile || isAuthor ? <AuthorSidebar /> : <Sidebar comment={comment} subplebbit={subplebbit} />}</div>;
};

export default About;
