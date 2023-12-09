import { useLocation, useParams } from 'react-router-dom';
import Sidebar from '../../components/sidebar';
import AuthorSidebar from '../../components/author-sidebar';
import styles from './about.module.css';
import { useComment, useSubplebbit } from '@plebbit/plebbit-react-hooks';
import { isAuthorView, isProfileView } from '../../lib/utils/view-utils';

const About = () => {
  const { commentCid, subplebbitAddress } = useParams();
  const subplebbit = useSubplebbit({ subplebbitAddress });
  const comment = useComment({ commentCid });
  const { address, createdAt, description, roles, rules, title, updatedAt } = subplebbit || {};
  const { cid, downvoteCount, timestamp, upvoteCount } = comment || {};

  const location = useLocation();
  const isAuthor = isAuthorView(location.pathname);
  const isProfile = isProfileView(location.pathname);

  return (
    <div className={styles.content}>
      {isProfile || isAuthor ? (
        <AuthorSidebar />
      ) : (
        <Sidebar
          address={address}
          cid={cid}
          createdAt={createdAt}
          description={description}
          downvoteCount={downvoteCount}
          roles={roles}
          rules={rules}
          timestamp={timestamp}
          title={title}
          updatedAt={updatedAt}
          upvoteCount={upvoteCount}
        />
      )}
    </div>
  );
};

export default About;
